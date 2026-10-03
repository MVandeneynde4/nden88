"use client";

import { enregistrerClient } from "@/actions/clients";
import { TYPES_CLIENT, type Client } from "@/lib/types";
import { Champ, Liste, Saisie, Zone } from "../champs";
import { CadreFormulaire, useFormulaire } from "./commun";

export function FormulaireClient({ client }: { client?: Client }) {
  const { etat, formAction, v, e } = useFormulaire(enregistrerClient);
  return (
    <CadreFormulaire
      action={formAction}
      message={etat.message}
      annuler={client ? `/clients/${client.id}` : "/clients"}
    >
      {client && <input type="hidden" name="id" value={client.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ libelle="Raison sociale / nom" nom="nom" erreurs={e("nom")} className="sm:col-span-2">
          <Saisie name="nom" defaultValue={v("nom", client?.nom)} erreur={!!e("nom")} required />
        </Champ>
        <Champ libelle="Type de client" nom="type" erreurs={e("type")}>
          <Liste name="type" options={TYPES_CLIENT} defaultValue={v("type", client?.type ?? "Privé")} />
        </Champ>
        <Champ libelle="Interlocuteur" nom="contact" erreurs={e("contact")}>
          <Saisie name="contact" defaultValue={v("contact", client?.contact)} />
        </Champ>
        <Champ libelle="E-mail" nom="email" erreurs={e("email")}>
          <Saisie type="email" name="email" defaultValue={v("email", client?.email)} erreur={!!e("email")} />
        </Champ>
        <Champ libelle="Téléphone" nom="telephone" erreurs={e("telephone")}>
          <Saisie type="tel" name="telephone" defaultValue={v("telephone", client?.telephone)} />
        </Champ>
        <Champ libelle="Adresse" nom="adresse" erreurs={e("adresse")}>
          <Saisie name="adresse" defaultValue={v("adresse", client?.adresse)} />
        </Champ>
        <Champ libelle="Ville" nom="ville" erreurs={e("ville")}>
          <Saisie name="ville" defaultValue={v("ville", client?.ville)} />
        </Champ>
        <Champ libelle="Notes" nom="notes" erreurs={e("notes")} className="sm:col-span-2">
          <Zone name="notes" defaultValue={v("notes", client?.notes)} />
        </Champ>
      </div>
    </CadreFormulaire>
  );
}
