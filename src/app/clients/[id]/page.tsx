import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerClient } from "@/actions/clients";
import { BoutonSupprimer } from "@/components/boutons";
import { Badge, Carte, EnTete, Info, LienBouton, Stat, Tableau, Td, Th, Vide } from "@/components/ui";
import { dateCourte, euros, eurosArrondis, montantsPiece } from "@/lib/calculs";
import { estEnRetard, factureHtProjet } from "@/lib/indicateurs";
import { chargerDonnees } from "@/lib/requetes";
import { tonStatutPiece, tonStatutProjet } from "@/lib/styles";

export default async function FicheClient({ params }: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const { db, client, aujourdhui } = await chargerDonnees();
  const c = client(id);
  if (!c) notFound();

  const projets = db.projets.filter((p) => p.clientId === c.id).sort((a, b) => b.code.localeCompare(a.code));
  const ids = new Set(projets.map((p) => p.id));
  const factures = db.pieces
    .filter((p) => p.type === "facture" && ids.has(p.projetId))
    .sort((a, b) => b.date.localeCompare(a.date));
  const totalFacture = projets.reduce((s, p) => s + factureHtProjet(db, p.id), 0);
  const encours = factures.filter((f) => f.statut === "Émise").reduce((s, f) => s + montantsPiece(f).ttc, 0);

  return (
    <>
      <EnTete
        titre={c.nom}
        sousTitre={<Badge ton={c.type === "Public" ? "violet" : "bleu"}>{c.type}</Badge>}
        retour={{ href: "/clients", libelle: "Clients" }}
        actions={
          <>
            <LienBouton href={`/projets/nouveau?client=${c.id}`} variante="secondaire">
              Nouvelle affaire
            </LienBouton>
            <LienBouton href={`/clients/${c.id}/modifier`} variante="secondaire">
              Modifier
            </LienBouton>
            <BoutonSupprimer
              action={supprimerClient}
              id={c.id}
              confirmation={`Supprimer définitivement le client « ${c.nom} » ?`}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat libelle="Affaires" valeur={projets.length} detail={`${projets.filter((p) => p.statut === "En cours").length} en cours`} />
        <Stat libelle="Total facturé" valeur={eurosArrondis(totalFacture)} detail="HT, factures émises et payées" />
        <Stat libelle="Encours" valeur={eurosArrondis(encours)} detail="TTC, en attente de paiement" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Carte titre="Coordonnées">
          <dl className="space-y-3">
            <Info libelle="Interlocuteur">{c.contact}</Info>
            <Info libelle="E-mail">{c.email && <a className="text-blue-700 hover:underline" href={`mailto:${c.email}`}>{c.email}</a>}</Info>
            <Info libelle="Téléphone">{c.telephone}</Info>
            <Info libelle="Adresse">
              {c.adresse}
              {c.adresse && c.ville && ", "}
              {c.ville}
            </Info>
            <Info libelle="Client depuis">{dateCourte(c.creeLe)}</Info>
            {c.notes && <Info libelle="Notes"><span className="whitespace-pre-line">{c.notes}</span></Info>}
          </dl>
        </Carte>

        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Carte titre="Affaires" corps={false}>
            {projets.length === 0 ? (
              <Vide action={<LienBouton href={`/projets/nouveau?client=${c.id}`} taille="sm">Créer une affaire</LienBouton>}>
                Aucune affaire pour ce client.
              </Vide>
            ) : (
              <Tableau>
                <thead>
                  <tr>
                    <Th>Affaire</Th>
                    <Th>Phase</Th>
                    <Th>Statut</Th>
                    <Th droite>Honoraires HT</Th>
                  </tr>
                </thead>
                <tbody>
                  {projets.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <Td>
                        <Link href={`/projets/${p.id}`} className="font-medium hover:text-blue-700">{p.nom}</Link>
                        <div className="text-xs text-slate-500">{p.code}</div>
                      </Td>
                      <Td>{p.phase}</Td>
                      <Td><Badge ton={tonStatutProjet[p.statut]}>{p.statut}</Badge></Td>
                      <Td droite>{eurosArrondis(p.budgetHonoraires)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Tableau>
            )}
          </Carte>

          <Carte titre="Factures" corps={false}>
            {factures.length === 0 ? (
              <Vide>Aucune facture.</Vide>
            ) : (
              <Tableau>
                <thead>
                  <tr>
                    <Th>Numéro</Th>
                    <Th>Date</Th>
                    <Th>Échéance</Th>
                    <Th>Statut</Th>
                    <Th droite>Montant TTC</Th>
                  </tr>
                </thead>
                <tbody>
                  {factures.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <Td><Link href={`/facturation/${f.id}`} className="font-medium hover:text-blue-700">{f.numero}</Link></Td>
                      <Td>{dateCourte(f.date)}</Td>
                      <Td className={estEnRetard(f, aujourdhui) ? "font-medium text-red-700" : ""}>{dateCourte(f.echeance)}</Td>
                      <Td><Badge ton={tonStatutPiece[f.statut]}>{f.statut}</Badge></Td>
                      <Td droite>{euros(montantsPiece(f).ttc)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Tableau>
            )}
          </Carte>
        </div>
      </div>
    </>
  );
}
