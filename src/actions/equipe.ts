"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { modifierDb } from "@/lib/db";
import { ErreurMetier, messageErreur, type EtatAction } from "@/lib/erreurs";
import { erreursZod, versObjet, type EtatFormulaire } from "@/lib/formulaire";
import { schemaCollaborateur } from "@/lib/schemas";

export async function enregistrerCollaborateur(
  _: EtatFormulaire,
  fd: FormData,
): Promise<EtatFormulaire> {
  const valeurs = versObjet(fd);
  const r = schemaCollaborateur.safeParse({ ...valeurs, actif: fd.get("actif") === "on" });
  if (!r.success) return { erreurs: erreursZod(r.error), valeurs };

  let id: string;
  try {
    id = await modifierDb((db) => {
      if (valeurs.id) {
        const c = db.collaborateurs.find((x) => x.id === valeurs.id);
        if (!c) throw new ErreurMetier("Ce collaborateur n'existe plus.");
        Object.assign(c, r.data);
        return c.id;
      }
      const nouveau = { id: crypto.randomUUID(), ...r.data };
      db.collaborateurs.push(nouveau);
      return nouveau.id;
    });
  } catch (e) {
    return { message: messageErreur(e), valeurs };
  }
  revalidatePath("/", "layout");
  redirect(`/equipe/${id}`);
}

export async function supprimerCollaborateur(_: EtatAction, fd: FormData): Promise<EtatAction> {
  const id = String(fd.get("id"));
  try {
    await modifierDb((db) => {
      const aDuTemps = db.temps.some((t) => t.collaborateurId === id);
      const estChef = db.projets.some((p) => p.chefProjetId === id);
      if (aDuTemps || estChef) {
        throw new ErreurMetier(
          "Ce collaborateur a des temps saisis ou pilote des affaires : désactivez-le plutôt que de le supprimer.",
        );
      }
      db.collaborateurs = db.collaborateurs.filter((c) => c.id !== id);
      db.taches = db.taches.filter((t) => t.assigneId !== id);
    });
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
  revalidatePath("/", "layout");
  redirect("/equipe");
}
