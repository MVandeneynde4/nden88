"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { modifierDb } from "@/lib/db";
import { ErreurMetier, messageErreur, type EtatAction } from "@/lib/erreurs";
import { erreursZod, versObjet, type EtatFormulaire } from "@/lib/formulaire";
import { schemaPiece } from "@/lib/schemas";
import { ajouterJours, isoDate, prefixePiece, prochainNumero } from "@/lib/calculs";
import {
  STATUTS_DEVIS,
  STATUTS_FACTURE,
  type Database,
  type Piece,
  type StatutPiece,
} from "@/lib/types";

function numeroter(db: Database, type: Piece["type"], date: string) {
  const prefixe = prefixePiece(type);
  return prochainNumero(prefixe, db.pieces.map((p) => p.numero), Number(date.slice(0, 4)));
}

export async function enregistrerPiece(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const valeurs = versObjet(fd);
  const designations = fd.getAll("designation").map(String);
  const quantites = fd.getAll("quantite").map(String);
  const prix = fd.getAll("prixUnitaire").map(String);
  const lignes = designations
    .map((designation, i) => ({ designation, quantite: quantites[i], prixUnitaire: prix[i] }))
    // Les lignes entièrement vides sont ignorées.
    .filter((l) => l.designation.trim() || l.quantite?.trim() || l.prixUnitaire?.trim());

  const r = schemaPiece.safeParse({ ...valeurs, lignes });
  if (!r.success) {
    return {
      erreurs: erreursZod(r.error),
      valeurs: { ...valeurs, lignes: JSON.stringify(lignes) },
    };
  }

  let id: string;
  try {
    id = await modifierDb((db) => {
      if (!db.projets.some((p) => p.id === r.data.projetId)) {
        throw new ErreurMetier("Affaire introuvable.");
      }
      const donnees = { ...r.data, statut: r.data.statut as StatutPiece };
      if (valeurs.id) {
        const p = db.pieces.find((x) => x.id === valeurs.id);
        if (!p) throw new ErreurMetier("Cette pièce n'existe plus.");
        if (p.type === "facture" && p.statut !== "Brouillon") {
          // Une facture émise n'est plus modifiable (seul son statut évolue).
          throw new ErreurMetier("Une facture émise ne peut plus être modifiée.");
        }
        if (p.type !== donnees.type) throw new ErreurMetier("Le type d'une pièce ne peut pas changer.");
        Object.assign(p, donnees);
        return p.id;
      }
      const nouvelle: Piece = {
        id: crypto.randomUUID(),
        numero: numeroter(db, donnees.type, donnees.date),
        ...donnees,
      };
      db.pieces.push(nouvelle);
      return nouvelle.id;
    });
  } catch (e) {
    return { message: messageErreur(e), valeurs: { ...valeurs, lignes: JSON.stringify(lignes) } };
  }
  revalidatePath("/", "layout");
  redirect(`/facturation/${id}`);
}

export async function changerStatutPiece(fd: FormData): Promise<void> {
  const id = String(fd.get("id"));
  const statut = String(fd.get("statut")) as StatutPiece;
  await modifierDb((db) => {
    const p = db.pieces.find((x) => x.id === id);
    if (!p) return;
    const autorises: readonly string[] = p.type === "devis" ? STATUTS_DEVIS : STATUTS_FACTURE;
    if (!autorises.includes(statut)) return;
    // Une facture émise ne repasse jamais en brouillon : elle redeviendrait modifiable.
    if (p.type === "facture" && p.statut !== "Brouillon" && statut === "Brouillon") return;
    p.statut = statut;
  });
  revalidatePath("/", "layout");
}

/** Crée une facture brouillon reprenant les lignes d'un devis accepté. */
export async function facturerDevis(fd: FormData): Promise<void> {
  const id = String(fd.get("id"));
  const nouvelleId = await modifierDb((db) => {
    const devis = db.pieces.find((x) => x.id === id && x.type === "devis");
    if (!devis || devis.statut !== "Accepté") return null;
    const date = isoDate(new Date());
    const facture: Piece = {
      id: crypto.randomUUID(),
      type: "facture",
      numero: numeroter(db, "facture", date),
      projetId: devis.projetId,
      objet: `${devis.objet} (devis ${devis.numero})`,
      date,
      echeance: ajouterJours(date, 30),
      statut: "Brouillon",
      tauxTva: devis.tauxTva,
      lignes: devis.lignes.map((l) => ({ ...l })),
    };
    db.pieces.push(facture);
    return facture.id;
  });
  revalidatePath("/", "layout");
  if (nouvelleId) redirect(`/facturation/${nouvelleId}/modifier`);
}

export async function supprimerPiece(_: EtatAction, fd: FormData): Promise<EtatAction> {
  const id = String(fd.get("id"));
  try {
    await modifierDb((db) => {
      const p = db.pieces.find((x) => x.id === id);
      if (p?.type === "facture" && p.statut !== "Brouillon") {
        throw new ErreurMetier(
          "Une facture émise ne peut pas être supprimée (numérotation continue) : passez-la au statut « Annulée ».",
        );
      }
      db.pieces = db.pieces.filter((x) => x.id !== id);
    });
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
  revalidatePath("/", "layout");
  redirect("/facturation");
}
