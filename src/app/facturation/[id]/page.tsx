import { notFound } from "next/navigation";
import { changerStatutPiece, facturerDevis, supprimerPiece } from "@/actions/facturation";
import { BoutonImprimer } from "@/components/bouton-imprimer";
import { BoutonEnvoi, BoutonSupprimer } from "@/components/boutons";
import { Badge, Carte, EnTete, LienBouton } from "@/components/ui";
import { dateCourte, euros, montantsPiece, nombre, totalLigne } from "@/lib/calculs";
import { ENTREPRISE } from "@/lib/entreprise";
import { estEnRetard } from "@/lib/indicateurs";
import { chargerDonnees } from "@/lib/requetes";
import { tonStatutPiece } from "@/lib/styles";
import type { Piece, StatutPiece } from "@/lib/types";

/** Transitions de statut proposées selon l'état courant. */
function transitions(p: Piece): { statut: StatutPiece; libelle: string; principal?: boolean }[] {
  if (p.type === "devis") {
    switch (p.statut) {
      case "Brouillon":
        return [{ statut: "Envoyé", libelle: "Marquer comme envoyé", principal: true }];
      case "Envoyé":
        return [
          { statut: "Accepté", libelle: "Accepté par le client", principal: true },
          { statut: "Refusé", libelle: "Refusé" },
        ];
      default:
        return [{ statut: "Envoyé", libelle: "Repasser en « Envoyé »" }];
    }
  }
  switch (p.statut) {
    case "Brouillon":
      return [{ statut: "Émise", libelle: "Émettre la facture", principal: true }];
    case "Émise":
      return [
        { statut: "Payée", libelle: "Marquer comme payée", principal: true },
        { statut: "Annulée", libelle: "Annuler" },
      ];
    case "Payée":
      return [{ statut: "Émise", libelle: "Annuler l'encaissement" }];
    default:
      return [];
  }
}

export default async function FichePiece({ params }: PageProps<"/facturation/[id]">) {
  const { id } = await params;
  const { db, projet, client, aujourdhui } = await chargerDonnees();
  const p = db.pieces.find((x) => x.id === id);
  if (!p) notFound();
  const prj = projet(p.projetId);
  const cli = client(prj?.clientId ?? "");
  const m = montantsPiece(p);
  const modifiable = p.type === "devis" || p.statut === "Brouillon";
  const libelleType = p.type === "devis" ? "Devis" : "Facture";
  const retard = estEnRetard(p, aujourdhui);

  return (
    <>
      <div className="no-print">
        <EnTete
          titre={`${libelleType} ${p.numero}`}
          sousTitre={
            <span className="flex items-center gap-2">
              <Badge ton={tonStatutPiece[p.statut]}>{p.statut}</Badge>
              {retard && <Badge ton="rouge">Échue le {dateCourte(p.echeance)}</Badge>}
            </span>
          }
          retour={{ href: "/facturation", libelle: "Facturation" }}
          actions={
            <>
              <BoutonImprimer />
              {modifiable && (
                <LienBouton href={`/facturation/${p.id}/modifier`} variante="secondaire">
                  Modifier
                </LienBouton>
              )}
              {modifiable && (
                <BoutonSupprimer
                  action={supprimerPiece}
                  id={p.id}
                  confirmation={`Supprimer ${libelleType.toLowerCase()} ${p.numero} ?`}
                />
              )}
            </>
          }
        />

        {(transitions(p).length > 0 || (p.type === "devis" && p.statut === "Accepté")) && (
          <Carte className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm text-slate-600">Actions :</span>
              <form action={changerStatutPiece} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={p.id} />
                {transitions(p).map((t) => (
                  <BoutonEnvoi key={t.statut} name="statut" value={t.statut} variante={t.principal ? "primaire" : "secondaire"}>
                    {t.libelle}
                  </BoutonEnvoi>
                ))}
              </form>
              {p.type === "devis" && p.statut === "Accepté" && (
                <form action={facturerDevis}>
                  <input type="hidden" name="id" value={p.id} />
                  <BoutonEnvoi>Créer la facture</BoutonEnvoi>
                </form>
              )}
            </div>
          </Carte>
        )}
      </div>

      {/* Document imprimable */}
      <article className="print-plein mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-xs sm:p-12">
        <header className="flex flex-wrap justify-between gap-6">
          <div className="text-sm leading-relaxed text-slate-600">
            <div className="text-lg font-semibold text-slate-900">{ENTREPRISE.nom}</div>
            <div>{ENTREPRISE.adresse}</div>
            <div>{ENTREPRISE.ville}</div>
            <div>{ENTREPRISE.telephone} · {ENTREPRISE.email}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold uppercase tracking-wide text-blue-800">{libelleType}</div>
            <div className="mt-1 font-mono text-sm">{p.numero}</div>
            <div className="mt-2 text-sm text-slate-600">Date : {dateCourte(p.date)}</div>
            <div className="text-sm text-slate-600">
              {p.type === "devis" ? "Valable jusqu'au" : "Échéance"} : {dateCourte(p.echeance)}
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Affaire</div>
            <div className="mt-1 font-medium">{prj?.code} — {prj?.nom}</div>
            <div className="text-slate-600">{prj?.ville}</div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Objet</div>
            <div className="mt-1">{p.objet}</div>
          </div>
          <div className="rounded-md bg-slate-50 p-4 text-sm leading-relaxed">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</div>
            <div className="mt-1 font-medium">{cli?.nom}</div>
            {cli?.contact && <div>À l&apos;attention de {cli.contact}</div>}
            <div>{cli?.adresse}</div>
            <div>{cli?.ville}</div>
          </div>
        </div>

        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-800 text-left text-xs uppercase tracking-wide text-slate-600">
              <th className="py-2 font-semibold">Désignation</th>
              <th className="w-20 py-2 text-right font-semibold">Qté</th>
              <th className="w-32 py-2 text-right font-semibold">PU HT</th>
              <th className="w-32 py-2 text-right font-semibold">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {p.lignes.map((l, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="py-2.5">{l.designation}</td>
                <td className="py-2.5 text-right tabular-nums">{nombre(l.quantite)}</td>
                <td className="py-2.5 text-right tabular-nums">{euros(l.prixUnitaire)}</td>
                <td className="py-2.5 text-right tabular-nums">{euros(totalLigne(l))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-6 grid max-w-xs grid-cols-2 gap-y-1.5 text-sm tabular-nums">
          <dt className="text-slate-600">Total HT</dt>
          <dd className="text-right">{euros(m.ht)}</dd>
          <dt className="text-slate-600">TVA {nombre(p.tauxTva)} %</dt>
          <dd className="text-right">{euros(m.tva)}</dd>
          <dt className="border-t border-slate-800 pt-1.5 font-semibold">Total TTC</dt>
          <dd className="border-t border-slate-800 pt-1.5 text-right font-semibold">{euros(m.ttc)}</dd>
        </dl>

        <footer className="mt-12 space-y-2 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
          {p.type === "facture" ? (
            <>
              <p>{ENTREPRISE.conditions}</p>
              <p>Règlement par virement — IBAN : {ENTREPRISE.iban}</p>
            </>
          ) : (
            <p>Bon pour accord — date, signature et cachet du client :</p>
          )}
          <p>
            {ENTREPRISE.nom} · SIRET {ENTREPRISE.siret} · TVA intracommunautaire {ENTREPRISE.tvaIntra}
          </p>
        </footer>
      </article>
    </>
  );
}
