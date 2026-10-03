import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Liste, Saisie } from "@/components/champs";
import { Badge, Carte, EnTete, LienBouton, Tableau, Td, Th, Vide, classesBouton } from "@/components/ui";
import { eurosArrondis } from "@/lib/calculs";
import { factureHtProjet } from "@/lib/indicateurs";
import { chargerDonnees } from "@/lib/requetes";
import { TYPES_CLIENT } from "@/lib/types";

export const metadata: Metadata = { title: "Clients" };

export default async function PageClients({ searchParams }: PageProps<"/clients">) {
  const { q = "", type = "" } = (await searchParams) as Record<string, string | undefined>;
  const { db } = await chargerDonnees();
  const recherche = q.trim().toLowerCase();
  const clients = db.clients
    .filter((c) => !type || c.type === type)
    .filter(
      (c) =>
        !recherche ||
        [c.nom, c.contact, c.ville, c.email].some((x) => x.toLowerCase().includes(recherche)),
    )
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return (
    <>
      <EnTete
        titre="Clients"
        sousTitre={`${db.clients.length} maîtres d'ouvrage`}
        actions={<LienBouton href="/clients/nouveau">Nouveau client</LienBouton>}
      />
      <Carte corps={false}>
        <Form action="/clients" className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <div className="min-w-56 flex-1">
            <Saisie name="q" defaultValue={q} placeholder="Rechercher (nom, contact, ville…)" aria-label="Rechercher" />
          </div>
          <div className="w-44">
            <Liste name="type" options={TYPES_CLIENT} vide="Tous les types" defaultValue={type} aria-label="Type" />
          </div>
          <button className={classesBouton("secondaire")}>Filtrer</button>
        </Form>
        {clients.length === 0 ? (
          <Vide>Aucun client ne correspond à la recherche.</Vide>
        ) : (
          <Tableau>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Type</Th>
                <Th>Interlocuteur</Th>
                <Th>Ville</Th>
                <Th droite>Affaires</Th>
                <Th droite>Facturé HT</Th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const projets = db.projets.filter((p) => p.clientId === c.id);
                const facture = projets.reduce((s, p) => s + factureHtProjet(db, p.id), 0);
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <Td>
                      <Link href={`/clients/${c.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                        {c.nom}
                      </Link>
                    </Td>
                    <Td>
                      <Badge ton={c.type === "Public" ? "violet" : c.type === "Privé" ? "bleu" : "gris"}>{c.type}</Badge>
                    </Td>
                    <Td>
                      {c.contact}
                      {c.email && <div className="text-xs text-slate-500">{c.email}</div>}
                    </Td>
                    <Td>{c.ville}</Td>
                    <Td droite>{projets.length}</Td>
                    <Td droite>{eurosArrondis(facture)}</Td>
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
