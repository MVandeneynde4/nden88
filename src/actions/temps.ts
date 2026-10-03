"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { modifierDb } from "@/lib/db";
import { ErreurMetier, messageErreur, type EtatAction } from "@/lib/erreurs";
import { erreursZod, versObjet, type EtatFormulaire } from "@/lib/formulaire";
import { schemaTemps } from "@/lib/schemas";
import { debutSemaine } from "@/lib/calculs";

export async function enregistrerTemps(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const valeurs = versObjet(fd);
  const r = schemaTemps.safeParse(valeurs);
  if (!r.success) return { erreurs: erreursZod(r.error), valeurs };

  try {
    await modifierDb((db) => {
      const projet = db.projets.find((p) => p.id === r.data.projetId);
      if (!projet) throw new ErreurMetier("Affaire introuvable.");
      if (projet.statut === "Terminé" || projet.statut === "Annulé") {
        throw new ErreurMetier(`L'affaire ${projet.code} est clôturée : la saisie n'est plus possible.`);
      }
      if (!db.collaborateurs.some((c) => c.id === r.data.collaborateurId)) {
        throw new ErreurMetier("Collaborateur introuvable.");
      }
      if (valeurs.id) {
        const t = db.temps.find((x) => x.id === valeurs.id);
        if (!t) throw new ErreurMetier("Cette saisie n'existe plus.");
        Object.assign(t, r.data);
      } else {
        db.temps.push({ id: crypto.randomUUID(), ...r.data });
      }
    });
  } catch (e) {
    return { message: messageErreur(e), valeurs };
  }
  revalidatePath("/", "layout");
  const params = new URLSearchParams({
    semaine: debutSemaine(r.data.date),
    collaborateur: r.data.collaborateurId,
  });
  redirect(`/temps?${params}`);
}

export async function supprimerTemps(_: EtatAction, fd: FormData): Promise<EtatAction> {
  const id = String(fd.get("id"));
  try {
    await modifierDb((db) => {
      db.temps = db.temps.filter((t) => t.id !== id);
    });
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
  revalidatePath("/", "layout");
  return {};
}
