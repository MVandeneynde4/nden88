import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Liste, Saisie } from "@/components/champs";
import { Badge, Carte, EnTete, LienBouton, Progression, Tableau, Td, Th, Vide, classesBouton } from "@/components/ui";
import { consommationProjet, dateCourte, eurosArrondis } from "@/lib/calculs";
import { chargerDonnees } from "@/lib/requetes";
import { tonStatutProjet } from "@/lib/styles";
import { DOMAINES, PHASES, STATUTS_PROJET } from "@/lib/types";

export const metadata: Metadata = { title: "Affaires" };

export default async function PageProjets({ searchParams }: PageProps<"/projets">) {
  const f = (await searchParams) as Record<string, string | undefined>;
  const { q = "", statut = "", phase = "", domaine = "" } = f;
  const { db, client, nomCollaborateur, aujourdhui } = await chargerDonnees();
  const recherche = q.trim().toLowerCase();

  const projets = db.projets
    .filter((p) => !statut || p.statut === statut)
    .filter((p) => !phase || p.phase === phase)
    .filter((p) => !domaine || p.domaine === domaine)
    .filter(
      (p) =>
        !recherche ||
        [p.nom, p.code, p.ville, client(p.clientId)?.nom ?? ""].some((x) => x.toLowerCase().includes(recherche)),
    )
    .sort((a, b) => b.code.localeCompare(a.code));

  const filtresActifs = Boolean(q || statut || phase || domaine);

  return (
    <>
      <EnTete
        titre="Affaires"
        sousTitre={`${projets.length} affaire(s)${filtresActifs ? " correspondant aux filtres" : ""}`}
        actions={<LienBouton href="/projets/nouveau">Nouvelle affaire</LienBouton>}
      />
      <Carte corps={false}>
        <Form action="/projets" className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <div className="min-w-56 flex-1">
            <Saisie name="q" defaultValue={q} placeholder="Code, intitulé, client, ville…" aria-label="Rechercher" />
          </div>
          <div className="w-40">
            <Liste name="statut" options={STATUTS_PROJET} vide="Tous statuts" defaultValue={statut} aria-label="Statut" />
          </div>
          <div className="w-36">
            <Liste name="phase" options={PHASES} vide="Toutes phases" defaultValue={phase} aria-label="Phase" />
          </div>
          <div className="w-52">
            <Liste name="domaine" options={DOMAINES} vide="Tous domaines" defaultValue={domaine} aria-label="Domaine" />
          </div>
          <button className={classesBouton("secondaire")}>Filtrer</button>
          {filtresActifs && (
            <Link href="/projets" className={classesBouton("discret")}>
              Réinitialiser
            </Link>
          )}
        </Form>
        {projets.length === 0 ? (
          <Vide>Aucune affaire ne correspond aux filtres.</Vide>
        ) : (
          <Tableau>
            <thead>
              <tr>
                <Th>Affaire</Th>
                <Th>Client</Th>
                <Th>Chef de projet</Th>
                <Th>Phase</Th>
                <Th>Statut</Th>
                <Th>Heures</Th>
                <Th droite>Honoraires HT</Th>
                <Th droite>Fin prévue</Th>
              </tr>
            </thead>
            <tbody>
              {projets.map((p) => {
                const conso = consommationProjet(p, db.temps, db.collaborateurs);
                const enRetard = p.dateFin < aujourdhui && (p.statut === "En cours" || p.statut === "En pause");
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td>
                      <Link href={`/projets/${p.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                        {p.nom}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {p.code} · {p.domaine}
                      </div>
                    </Td>
                    <Td className="max-w-48 truncate">{client(p.clientId)?.nom}</Td>
                    <Td className="whitespace-nowrap">{nomCollaborateur(p.chefProjetId)}</Td>
                    <Td><Badge ton="bleu">{p.phase}</Badge></Td>
                    <Td><Badge ton={tonStatutProjet[p.statut]}>{p.statut}</Badge></Td>
                    <Td className="min-w-36">
                      <Progression valeur={conso.pctHeures} libelle={`Heures consommées ${p.code}`} />
                    </Td>
                    <Td droite>{eurosArrondis(p.budgetHonoraires)}</Td>
                    <Td droite className={enRetard ? "font-medium text-red-700" : "text-slate-600"}>
                      {dateCourte(p.dateFin)}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Tableau>
        )}
      </Carte>
    </>
  );
}
