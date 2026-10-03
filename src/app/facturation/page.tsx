import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Liste } from "@/components/champs";
import { Badge, Carte, EnTete, LienBouton, Stat, Tableau, Td, Th, Vide, classesBouton } from "@/components/ui";
import { dateCourte, euros, eurosArrondis, montantsPiece } from "@/lib/calculs";
import { estEnRetard } from "@/lib/indicateurs";
import { chargerDonnees } from "@/lib/requetes";
import { tonStatutPiece } from "@/lib/styles";
import { STATUTS_DEVIS, STATUTS_FACTURE } from "@/lib/types";

export const metadata: Metadata = { title: "Facturation" };

export default async function PageFacturation({ searchParams }: PageProps<"/facturation">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const type = sp.type === "devis" || sp.type === "facture" ? sp.type : "";
  const statut = sp.statut ?? "";
  const { db, projet, client, aujourdhui } = await chargerDonnees();

  const pieces = db.pieces
    .filter((p) => !type || p.type === type)
    .filter((p) => !statut || p.statut === statut)
    .sort((a, b) => b.date.localeCompare(a.date) || b.numero.localeCompare(a.numero));

  const devisEnAttente = db.pieces.filter((p) => p.type === "devis" && p.statut === "Envoyé");
  const emises = db.pieces.filter((p) => p.type === "facture" && p.statut === "Émise");
  const retards = emises.filter((p) => estEnRetard(p, aujourdhui));
  const somme = (l: typeof pieces, cle: "ht" | "ttc") => l.reduce((s, p) => s + montantsPiece(p)[cle], 0);
  const statuts = type === "devis" ? STATUTS_DEVIS : type === "facture" ? STATUTS_FACTURE : [...new Set([...STATUTS_DEVIS, ...STATUTS_FACTURE])];

  const onglet = (valeur: string, libelle: string) => (
    <Link
      href={valeur ? `/facturation?type=${valeur}` : "/facturation"}
      aria-current={type === valeur ? "page" : undefined}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        type === valeur ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {libelle}
    </Link>
  );

  return (
    <>
      <EnTete
        titre="Facturation"
        sousTitre="Devis et factures d'honoraires"
        actions={
          <>
            <LienBouton href="/facturation/nouveau?type=devis" variante="secondaire">
              Nouveau devis
            </LienBouton>
            <LienBouton href="/facturation/nouveau?type=facture">Nouvelle facture</LienBouton>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          libelle="Devis en attente de réponse"
          valeur={eurosArrondis(somme(devisEnAttente, "ht"))}
          detail={`${devisEnAttente.length} devis envoyé(s), HT`}
          href="/facturation?type=devis&statut=Envoyé"
        />
        <Stat
          libelle="Factures à encaisser"
          valeur={eurosArrondis(somme(emises, "ttc"))}
          detail={`${emises.length} facture(s) émise(s), TTC`}
          href="/facturation?type=facture&statut=Émise"
        />
        <Stat
          libelle="Dont en retard"
          valeur={eurosArrondis(somme(retards, "ttc"))}
          ton={retards.length > 0 ? "alerte" : "ok"}
          detail={`${retards.length} facture(s) échue(s)`}
        />
      </div>

      <Carte corps={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <nav className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {onglet("", "Tout")}
            {onglet("devis", "Devis")}
            {onglet("facture", "Factures")}
          </nav>
          <Form action="/facturation" className="flex gap-2">
            {type && <input type="hidden" name="type" value={type} />}
            <div className="w-44">
              <Liste name="statut" options={statuts} vide="Tous statuts" defaultValue={statut} aria-label="Statut" />
            </div>
            <button className={classesBouton("secondaire")}>Filtrer</button>
          </Form>
        </div>
        {pieces.length === 0 ? (
          <Vide>Aucune pièce ne correspond aux filtres.</Vide>
        ) : (
          <Tableau>
            <thead>
              <tr>
                <Th>Numéro</Th>
                <Th>Objet</Th>
                <Th>Client</Th>
                <Th>Date</Th>
                <Th>Échéance</Th>
                <Th>Statut</Th>
                <Th droite>Montant HT</Th>
                <Th droite>TTC</Th>
              </tr>
            </thead>
            <tbody>
              {pieces.map((p) => {
                const m = montantsPiece(p);
                const prj = projet(p.projetId);
                const retard = estEnRetard(p, aujourdhui);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td className="whitespace-nowrap">
                      <Link href={`/facturation/${p.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                        {p.numero}
                      </Link>
                      <div className="text-xs text-slate-500">{p.type === "devis" ? "Devis" : "Facture"}</div>
                    </Td>
                    <Td>
                      {p.objet}
                      <div className="text-xs text-slate-500">{prj?.code}</div>
                    </Td>
                    <Td className="max-w-48 truncate">{client(prj?.clientId ?? "")?.nom}</Td>
                    <Td className="whitespace-nowrap">{dateCourte(p.date)}</Td>
                    <Td className={`whitespace-nowrap ${retard ? "font-medium text-red-700" : ""}`}>
                      {dateCourte(p.echeance)}
                    </Td>
                    <Td>
                      <span className="flex flex-wrap gap-1">
                        <Badge ton={tonStatutPiece[p.statut]}>{p.statut}</Badge>
                        {retard && <Badge ton="rouge">En retard</Badge>}
                      </span>
                    </Td>
                    <Td droite>{euros(m.ht)}</Td>
                    <Td droite>{euros(m.ttc)}</Td>
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
