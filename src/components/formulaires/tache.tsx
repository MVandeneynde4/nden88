"use client";

import { enregistrerTache } from "@/actions/taches";
import { PRIORITES, STATUTS_TACHE, type Tache } from "@/lib/types";
import { Champ, Liste, Saisie, Zone } from "../champs";
import { CadreFormulaire, useFormulaire, type Option } from "./commun";

export function FormulaireTache({
  tache: t,
  projets,
  collaborateurs,
  defauts,
  retour,
}: {
  tache?: Tache;
  projets: Option[];
  collaborateurs: Option[];
  defauts: { projetId?: string; echeance: string };
  retour: string;
}) {
  const { etat, formAction, v, e } = useFormulaire(enregistrerTache);
  return (
    <CadreFormulaire action={formAction} message={etat.message} annuler={retour}>
      {t && <input type="hidden" name="id" value={t.id} />}
      <input type="hidden" name="retour" value={retour} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ libelle="Titre" nom="titre" erreurs={e("titre")} className="sm:col-span-2">
          <Saisie name="titre" defaultValue={v("titre", t?.titre)} erreur={!!e("titre")} />
        </Champ>
        <Champ libelle="Affaire" nom="projetId" erreurs={e("projetId")}>
          <Liste
            name="projetId"
            options={projets}
            vide="— Choisir une affaire —"
            defaultValue={v("projetId", t?.projetId ?? defauts.projetId)}
            erreur={!!e("projetId")}
          />
        </Champ>
        <Champ libelle="Responsable" nom="assigneId" erreurs={e("assigneId")}>
          <Liste
            name="assigneId"
            options={collaborateurs}
            vide="— Choisir —"
            defaultValue={v("assigneId", t?.assigneId)}
            erreur={!!e("assigneId")}
          />
        </Champ>
        <Champ libelle="Statut" nom="statut" erreurs={e("statut")}>
          <Liste name="statut" options={STATUTS_TACHE} defaultValue={v("statut", t?.statut ?? "À faire")} />
        </Champ>
        <Champ libelle="Priorité" nom="priorite" erreurs={e("priorite")}>
          <Liste name="priorite" options={PRIORITES} defaultValue={v("priorite", t?.priorite ?? "Normale")} />
        </Champ>
        <Champ libelle="Échéance" nom="echeance" erreurs={e("echeance")}>
          <Saisie
            type="date"
            name="echeance"
            defaultValue={v("echeance", t?.echeance ?? defauts.echeance)}
            erreur={!!e("echeance")}
          />
        </Champ>
        <Champ libelle="Heures estimées" nom="heuresEstimees" erreurs={e("heuresEstimees")}>
          <Saisie
            type="number"
            step="0.5"
            min="0"
            name="heuresEstimees"
            defaultValue={v("heuresEstimees", t?.heuresEstimees ?? 0)}
            erreur={!!e("heuresEstimees")}
          />
        </Champ>
        <Champ libelle="Description" nom="description" erreurs={e("description")} className="sm:col-span-2">
          <Zone name="description" defaultValue={v("description", t?.description)} />
        </Champ>
      </div>
    </CadreFormulaire>
  );
}
