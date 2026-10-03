"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { modifierDb } from "@/lib/db";
import { ErreurMetier, messageErreur, type EtatAction } from "@/lib/erreurs";
import { erreursZod, versObjet, type EtatFormulaire } from "@/lib/formulaire";
import { schemaProjet } from "@/lib/schemas";
import { prochainNumero } from "@/lib/calculs";
import type { Database } from "@/lib/types";

function verifierReferences(db: Database, clientId: string, chefProjetId: string) {
  if (!db.clients.some((c) => c.id === clientId)) throw new ErreurMetier("Client introuvable.");
  if (!db.collaborateurs.some((c) => c.id === chefProjetId)) {
    throw new ErreurMetier("Chef de projet introuvable.");
  }
}

export async function enregistrerProjet(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const valeurs = versObjet(fd);
  const r = schemaProjet.safeParse(valeurs);
  if (!r.success) return { erreurs: erreursZod(r.error), valeurs };

  let id: string;
  try {
    id = await modifierDb((db) => {
      verifierReferences(db, r.data.clientId, r.data.chefProjetId);
      if (valeurs.id) {
        const p = db.projets.find((x) => x.id === valeurs.id);
        if (!p) throw new ErreurMetier("Cette affaire n'existe plus.");
        Object.assign(p, r.data);
        return p.id;
      }
      const annee = Number(r.data.dateDebut.slice(0, 4));
      const code = prochainNumero("AFF", db.projets.map((p) => p.code), annee);
      const nouveau = { id: crypto.randomUUID(), code, ...r.data };
      db.projets.push(nouveau);
      return nouveau.id;
    });
  } catch (e) {
    return { message: messageErreur(e), valeurs };
  }
  revalidatePath("/", "layout");
  redirect(`/projets/${id}`);
}

export async function supprimerProjet(_: EtatAction, fd: FormData): Promise<EtatAction> {
  const id = String(fd.get("id"));
  try {
    await modifierDb((db) => {
      const factures = db.pieces.filter(
        (p) => p.projetId === id && p.type === "facture" && p.statut !== "Brouillon",
      );
      if (factures.length > 0) {
        throw new ErreurMetier(
          "Cette affaire a des factures émises : passez-la au statut « Annulé » plutôt que de la supprimer.",
        );
      }
      db.projets = db.projets.filter((p) => p.id !== id);
      db.taches = db.taches.filter((t) => t.projetId !== id);
      db.temps = db.temps.filter((t) => t.projetId !== id);
      db.pieces = db.pieces.filter((p) => p.projetId !== id);
    });
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
  revalidatePath("/", "layout");
  redirect("/projets");
}
