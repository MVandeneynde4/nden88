"use client";

import { enregistrerTemps } from "@/actions/temps";
import type { SaisieTemps } from "@/lib/types";
import { BoutonEnvoi } from "../boutons";
import { Champ, Liste, MessageErreur, Saisie } from "../champs";
import { CadreFormulaire, useFormulaire, type Option } from "./commun";

interface Props {
  saisie?: SaisieTemps;
  projets: Option[];
  collaborateurs: Option[];
  defauts: { collaborateurId?: string; date: string };
}

function Champs({ saisie: s, projets, collaborateurs, defauts, v, e }: Props & Pick<ReturnType<typeof useFormulaire>, "v" | "e">) {
  return (
    <>
      {s && <input type="hidden" name="id" value={s.id} />}
      <Champ libelle="Collaborateur" nom="collaborateurId" erreurs={e("collaborateurId")}>
        <Liste
          name="collaborateurId"
          options={collaborateurs}
          vide="— Choisir —"
          defaultValue={v("collaborateurId", s?.collaborateurId ?? defauts.collaborateurId)}
          erreur={!!e("collaborateurId")}
        />
      </Champ>
      <Champ libelle="Affaire" nom="projetId" erreurs={e("projetId")}>
        <Liste
          name="projetId"
          options={projets}
          vide="— Choisir —"
          defaultValue={v("projetId", s?.projetId)}
          erreur={!!e("projetId")}
        />
      </Champ>
      <Champ libelle="Date" nom="date" erreurs={e("date")}>
        <Saisie type="date" name="date" defaultValue={v("date", s?.date ?? defauts.date)} erreur={!!e("date")} />
      </Champ>
      <Champ libelle="Heures" nom="heures" erreurs={e("heures")}>
        <Saisie
          type="number"
          step="0.25"
          min="0.25"
          max="24"
          name="heures"
          defaultValue={v("heures", s?.heures ?? 7)}
          erreur={!!e("heures")}
        />
      </Champ>
      <Champ libelle="Description" nom="description" erreurs={e("description")}>
        <Saisie name="description" placeholder="Calculs, plans, réunion…" defaultValue={v("description", s?.description)} />
      </Champ>
    </>
  );
}

/** Formulaire compact d'ajout, affiché au-dessus de la feuille de temps. */
export function SaisieRapideTemps(props: Props) {
  const { etat, formAction, v, e } = useFormulaire(enregistrerTemps);
  return (
    <form action={formAction} noValidate className="space-y-3">
      <MessageErreur message={etat.message} />
      <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_auto_6rem_1.4fr_auto]">
        <Champs {...props} v={v} e={e} />
        <div className="lg:pt-6">
          <BoutonEnvoi>Ajouter</BoutonEnvoi>
        </div>
      </div>
    </form>
  );
}

export function FormulaireTemps(props: Props & { annuler: string }) {
  const { etat, formAction, v, e } = useFormulaire(enregistrerTemps);
  return (
    <CadreFormulaire action={formAction} message={etat.message} annuler={props.annuler}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Champs {...props} v={v} e={e} />
      </div>
    </CadreFormulaire>
  );
}
