"use client";

import { enregistrerProjet } from "@/actions/projets";
import { DOMAINES, PHASES, PHASE_LIBELLES, STATUTS_PROJET, type Projet } from "@/lib/types";
import { Champ, Liste, Saisie, Zone } from "../champs";
import { CadreFormulaire, useFormulaire, type Option } from "./commun";

const optionsPhases = PHASES.map((p) => ({ valeur: p, libelle: `${p} — ${PHASE_LIBELLES[p]}` }));

export function FormulaireProjet({
  projet: p,
  clients,
  collaborateurs,
  defauts,
}: {
  projet?: Projet;
  clients: Option[];
  collaborateurs: Option[];
  defauts: { clientId?: string; dateDebut: string; dateFin: string };
}) {
  const { etat, formAction, v, e } = useFormulaire(enregistrerProjet);
  return (
    <CadreFormulaire action={formAction} message={etat.message} annuler={p ? `/projets/${p.id}` : "/projets"}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ libelle="Intitulé de l'affaire" nom="nom" erreurs={e("nom")} className="sm:col-span-2">
          <Saisie name="nom" defaultValue={v("nom", p?.nom)} erreur={!!e("nom")} />
        </Champ>
        <Champ libelle="Client (maître d'ouvrage)" nom="clientId" erreurs={e("clientId")}>
          <Liste
            name="clientId"
            options={clients}
            vide="— Choisir un client —"
            defaultValue={v("clientId", p?.clientId ?? defauts.clientId)}
            erreur={!!e("clientId")}
          />
        </Champ>
        <Champ libelle="Chef de projet" nom="chefProjetId" erreurs={e("chefProjetId")}>
          <Liste
            name="chefProjetId"
            options={collaborateurs}
            vide="— Choisir —"
            defaultValue={v("chefProjetId", p?.chefProjetId)}
            erreur={!!e("chefProjetId")}
          />
        </Champ>
        <Champ libelle="Domaine" nom="domaine" erreurs={e("domaine")}>
          <Liste name="domaine" options={DOMAINES} defaultValue={v("domaine", p?.domaine ?? "Structure")} />
        </Champ>
        <Champ libelle="Ville / lieu" nom="ville" erreurs={e("ville")}>
          <Saisie name="ville" defaultValue={v("ville", p?.ville)} />
        </Champ>
        <Champ libelle="Phase en cours" nom="phase" erreurs={e("phase")}>
          <Liste name="phase" options={optionsPhases} defaultValue={v("phase", p?.phase ?? "ESQ")} />
        </Champ>
        <Champ libelle="Statut" nom="statut" erreurs={e("statut")}>
          <Liste name="statut" options={STATUTS_PROJET} defaultValue={v("statut", p?.statut ?? "Prospect")} />
        </Champ>
        <Champ libelle="Date de début" nom="dateDebut" erreurs={e("dateDebut")}>
          <Saisie
            type="date"
            name="dateDebut"
            defaultValue={v("dateDebut", p?.dateDebut ?? defauts.dateDebut)}
            erreur={!!e("dateDebut")}
          />
        </Champ>
        <Champ libelle="Date de fin prévue" nom="dateFin" erreurs={e("dateFin")}>
          <Saisie
            type="date"
            name="dateFin"
            defaultValue={v("dateFin", p?.dateFin ?? defauts.dateFin)}
            erreur={!!e("dateFin")}
          />
        </Champ>
        <Champ libelle="Honoraires (€ HT)" nom="budgetHonoraires" erreurs={e("budgetHonoraires")}>
          <Saisie
            type="number"
            step="100"
            min="0"
            name="budgetHonoraires"
            defaultValue={v("budgetHonoraires", p?.budgetHonoraires ?? 0)}
            erreur={!!e("budgetHonoraires")}
          />
        </Champ>
        <Champ libelle="Budget heures" nom="budgetHeures" erreurs={e("budgetHeures")}>
          <Saisie
            type="number"
            step="1"
            min="0"
            name="budgetHeures"
            defaultValue={v("budgetHeures", p?.budgetHeures ?? 0)}
            erreur={!!e("budgetHeures")}
          />
        </Champ>
        <Champ libelle="Description de la mission" nom="description" erreurs={e("description")} className="sm:col-span-2">
          <Zone name="description" rows={4} defaultValue={v("description", p?.description)} />
        </Champ>
      </div>
    </CadreFormulaire>
  );
}
