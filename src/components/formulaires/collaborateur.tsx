"use client";

import { enregistrerCollaborateur } from "@/actions/equipe";
import { POSTES, type Collaborateur } from "@/lib/types";
import { Champ, Liste, Saisie } from "../champs";
import { CadreFormulaire, useFormulaire } from "./commun";

export function FormulaireCollaborateur({ collaborateur: c }: { collaborateur?: Collaborateur }) {
  const { etat, formAction, v, e } = useFormulaire(enregistrerCollaborateur);
  const actif = etat.valeurs ? etat.valeurs.actif === "on" : (c?.actif ?? true);
  return (
    <CadreFormulaire action={formAction} message={etat.message} annuler={c ? `/equipe/${c.id}` : "/equipe"}>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ libelle="Prénom" nom="prenom" erreurs={e("prenom")}>
          <Saisie name="prenom" defaultValue={v("prenom", c?.prenom)} erreur={!!e("prenom")} />
        </Champ>
        <Champ libelle="Nom" nom="nom" erreurs={e("nom")}>
          <Saisie name="nom" defaultValue={v("nom", c?.nom)} erreur={!!e("nom")} />
        </Champ>
        <Champ libelle="Poste" nom="poste" erreurs={e("poste")}>
          <Liste name="poste" options={POSTES} defaultValue={v("poste", c?.poste ?? "Projeteur")} />
        </Champ>
        <Champ libelle="E-mail" nom="email" erreurs={e("email")}>
          <Saisie type="email" name="email" defaultValue={v("email", c?.email)} erreur={!!e("email")} />
        </Champ>
        <Champ libelle="Téléphone" nom="telephone" erreurs={e("telephone")}>
          <Saisie type="tel" name="telephone" defaultValue={v("telephone", c?.telephone)} />
        </Champ>
        <Champ
          libelle="Coût horaire chargé (€ HT)"
          nom="coutHoraire"
          erreurs={e("coutHoraire")}
          aide="Sert au calcul du coût de revient des affaires."
        >
          <Saisie
            type="number"
            step="0.01"
            min="0"
            name="coutHoraire"
            defaultValue={v("coutHoraire", c?.coutHoraire ?? 50)}
            erreur={!!e("coutHoraire")}
          />
        </Champ>
        <Champ libelle="Heures hebdomadaires" nom="heuresHebdo" erreurs={e("heuresHebdo")}>
          <Saisie
            type="number"
            step="0.5"
            min="1"
            name="heuresHebdo"
            defaultValue={v("heuresHebdo", c?.heuresHebdo ?? 35)}
            erreur={!!e("heuresHebdo")}
          />
        </Champ>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input type="checkbox" name="actif" defaultChecked={actif} className="size-4 rounded border-slate-300" />
          Collaborateur actif
        </label>
      </div>
    </CadreFormulaire>
  );
}
