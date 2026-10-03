"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { modifierDb } from "@/lib/db";
import { ErreurMetier, messageErreur, type EtatAction } from "@/lib/erreurs";
import { erreursZod, versObjet, type EtatFormulaire } from "@/lib/formulaire";
import { schemaTache } from "@/lib/schemas";
import { STATUTS_TACHE, type StatutTache } from "@/lib/types";

/** N'autorise que les redirections internes (chemin relatif à l'application). */
function retourSur(valeur: string | undefined, defaut: string): string {
  return valeur && valeur.startsWith("/") && !valeur.startsWith("//") ? valeur : defaut;
}

export async function enregistrerTache(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const valeurs = versObjet(fd);
  const r = schemaTache.safeParse(valeurs);
  if (!r.success) return { erreurs: erreursZod(r.error), valeurs };

  try {
    await modifierDb((db) => {
      if (!db.projets.some((p) => p.id === r.data.projetId)) {
        throw new ErreurMetier("Affaire introuvable.");
      }
      if (!db.collaborateurs.some((c) => c.id === r.data.assigneId)) {
        throw new ErreurMetier("Responsable introuvable.");
      }
      if (valeurs.id) {
        const t = db.taches.find((x) => x.id === valeurs.id);
        if (!t) throw new ErreurMetier("Cette tâche n'existe plus.");
        Object.assign(t, r.data);
      } else {
        db.taches.push({ id: crypto.randomUUID(), ...r.data });
      }
    });
  } catch (e) {
    return { message: messageErreur(e), valeurs };
  }
  revalidatePath("/", "layout");
  redirect(retourSur(valeurs.retour, "/taches"));
}

export async function changerStatutTache(fd: FormData): Promise<void> {
  const id = String(fd.get("id"));
  const statut = String(fd.get("statut")) as StatutTache;
  if (!STATUTS_TACHE.includes(statut)) return;
  await modifierDb((db) => {
    const t = db.taches.find((x) => x.id === id);
    if (t) t.statut = statut;
  });
  revalidatePath("/", "layout");
}

export async function supprimerTache(_: EtatAction, fd: FormData): Promise<EtatAction> {
  const id = String(fd.get("id"));
  try {
    await modifierDb((db) => {
      db.taches = db.taches.filter((t) => t.id !== id);
    });
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
  revalidatePath("/", "layout");
  redirect(retourSur(String(fd.get("retour") ?? ""), "/taches"));
}
