"use client";

import { useActionState, type ReactNode } from "react";
import { etatInitial, type EtatFormulaire } from "@/lib/formulaire";
import { BoutonEnvoi } from "../boutons";
import { MessageErreur } from "../champs";
import { LienBouton } from "../ui";

type Action = (etat: EtatFormulaire, fd: FormData) => Promise<EtatFormulaire>;

/**
 * Branche un formulaire sur une Server Action et fournit :
 * - `v(cle, defaut)` : valeur initiale d'un champ (saisie précédente si l'envoi a échoué) ;
 * - `e(cle)` : erreurs de validation du champ.
 */
export function useFormulaire(action: Action) {
  const [etat, formAction, enCours] = useActionState(action, etatInitial);
  const v = (cle: string, defaut: string | number | undefined = "") =>
    etat.valeurs?.[cle] ?? (defaut === undefined ? "" : String(defaut));
  const e = (cle: string) => etat.erreurs?.[cle];
  return { etat, formAction, enCours, v, e };
}

export function CadreFormulaire({
  action,
  message,
  annuler,
  libelleEnvoi = "Enregistrer",
  children,
}: {
  action: (fd: FormData) => void;
  message?: string;
  annuler: string;
  libelleEnvoi?: string;
  children: ReactNode;
}) {
  return (
    <form action={action} noValidate className="space-y-6">
      <MessageErreur message={message} />
      {children}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <LienBouton href={annuler} variante="secondaire">
          Annuler
        </LienBouton>
        <BoutonEnvoi>{libelleEnvoi}</BoutonEnvoi>
      </div>
    </form>
  );
}

export type Option = { valeur: string; libelle: string };
