"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { modifierDb } from "@/lib/db";
import { ErreurMetier, messageErreur, type EtatAction } from "@/lib/erreurs";
import { erreursZod, versObjet, type EtatFormulaire } from "@/lib/formulaire";
import { schemaClient } from "@/lib/schemas";
import { isoDate } from "@/lib/calculs";

export async function enregistrerClient(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const valeurs = versObjet(fd);
  const r = schemaClient.safeParse(valeurs);
  if (!r.success) return { erreurs: erreursZod(r.error), valeurs };

  let id: string;
  try {
    id = await modifierDb((db) => {
      if (valeurs.id) {
        const c = db.clients.find((x) => x.id === valeurs.id);
        if (!c) throw new ErreurMetier("Ce client n'existe plus.");
        Object.assign(c, r.data);
        return c.id;
      }
      const nouveau = { id: crypto.randomUUID(), creeLe: isoDate(new Date()), ...r.data };
      db.clients.push(nouveau);
      return nouveau.id;
    });
  } catch (e) {
    return { message: messageErreur(e), valeurs };
  }
  revalidatePath("/", "layout");
  redirect(`/clients/${id}`);
}

export async function supprimerClient(_: EtatAction, fd: FormData): Promise<EtatAction> {
  const id = String(fd.get("id"));
  try {
    await modifierDb((db) => {
      const n = db.projets.filter((p) => p.clientId === id).length;
      if (n > 0) {
        throw new ErreurMetier(
          `Impossible de supprimer ce client : ${n} affaire(s) lui sont rattachées.`,
        );
      }
      db.clients = db.clients.filter((c) => c.id !== id);
    });
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
  revalidatePath("/", "layout");
  redirect("/clients");
}
