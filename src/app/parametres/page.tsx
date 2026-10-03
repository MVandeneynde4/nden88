import type { Metadata } from "next";
import { reinitialiserDonnees } from "@/actions/parametres";
import { BoutonEnvoi } from "@/components/boutons";
import { Carte, EnTete, Info } from "@/components/ui";
import { ENTREPRISE } from "@/lib/entreprise";
import { chargerDonnees } from "@/lib/requetes";

export const metadata: Metadata = { title: "Paramètres" };

export default async function Parametres() {
  const { db } = await chargerDonnees();
  return (
    <>
      <EnTete titre="Paramètres" />
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <Carte titre="Entreprise">
          <dl className="space-y-3">
            <Info libelle="Raison sociale">{ENTREPRISE.nom}</Info>
            <Info libelle="Adresse">{ENTREPRISE.adresse}, {ENTREPRISE.ville}</Info>
            <Info libelle="SIRET">{ENTREPRISE.siret}</Info>
            <Info libelle="IBAN">{ENTREPRISE.iban}</Info>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Ces informations figurent sur les devis et factures. Modifiez-les dans{" "}
            <code className="rounded bg-slate-100 px-1">src/lib/entreprise.ts</code>.
          </p>
        </Carte>
        <Carte titre="Données">
          <dl className="grid grid-cols-2 gap-3">
            <Info libelle="Clients">{db.clients.length}</Info>
            <Info libelle="Collaborateurs">{db.collaborateurs.length}</Info>
            <Info libelle="Affaires">{db.projets.length}</Info>
            <Info libelle="Tâches">{db.taches.length}</Info>
            <Info libelle="Saisies de temps">{db.temps.length}</Info>
            <Info libelle="Devis et factures">{db.pieces.length}</Info>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Les données sont stockées dans <code className="rounded bg-slate-100 px-1">data/db.json</code>{" "}
            (chemin modifiable avec la variable d&apos;environnement <code className="rounded bg-slate-100 px-1">DATA_FILE</code>).
          </p>
          <form action={reinitialiserDonnees} className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-sm text-slate-600">
              Remplace toutes les données par le jeu de démonstration. Action irréversible.
            </p>
            <BoutonEnvoi variante="danger">Réinitialiser les données de démonstration</BoutonEnvoi>
          </form>
        </Carte>
      </div>
    </>
  );
}
