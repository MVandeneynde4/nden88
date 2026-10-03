"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { classesBouton, type Variante } from "./ui";
import type { EtatAction } from "@/lib/erreurs";

/** Bouton d'envoi désactivé pendant le traitement de l'action. */
export function BoutonEnvoi({
  children,
  variante = "primaire",
  taille = "md",
  name,
  value,
  title,
}: {
  children: ReactNode;
  variante?: Variante;
  taille?: "sm" | "md";
  name?: string;
  value?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      name={name}
      value={value}
      title={title}
      className={classesBouton(variante, taille)}
    >
      {children}
    </button>
  );
}

/** Suppression avec confirmation ; affiche l'éventuel refus renvoyé par le serveur. */
export function BoutonSupprimer({
  action,
  id,
  confirmation,
  libelle = "Supprimer",
  champs,
  taille = "md",
}: {
  action: (etat: EtatAction, fd: FormData) => Promise<EtatAction>;
  id: string;
  confirmation: string;
  libelle?: string;
  /** Champs cachés supplémentaires transmis à l'action. */
  champs?: Record<string, string>;
  taille?: "sm" | "md";
}) {
  const [etat, formAction, enCours] = useActionState(action, {});
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmation)) e.preventDefault();
      }}
      className="inline-flex flex-col items-end gap-1"
    >
      <input type="hidden" name="id" value={id} />
      {champs &&
        Object.entries(champs).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button
        type="submit"
        disabled={enCours}
        className={classesBouton("danger", taille)}
        aria-label={libelle}
        title={libelle}
      >
        <Trash2 className="size-4" aria-hidden />
        {taille === "md" && libelle}
      </button>
      {etat.erreur && (
        <p role="alert" className="max-w-xs text-right text-xs text-red-600">
          {etat.erreur}
        </p>
      )}
    </form>
  );
}
