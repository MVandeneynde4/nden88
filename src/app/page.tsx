import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { GraphiqueHeures } from "@/components/graphique-heures";
import { Badge, Carte, EnTete, LienBouton, Progression, Stat, Tableau, Td, Th, Vide } from "@/components/ui";
import { dateCourte, euros, eurosArrondis, heures, montantsPiece, nombre } from "@/lib/calculs";
import { heuresParSemaine, indicateurs } from "@/lib/indicateurs";
import { chargerDonnees } from "@/lib/requetes";
import { tonPriorite } from "@/lib/styles";

export default async function TableauDeBord() {
  const { db, aujourdhui, projet, client, nomCollaborateur } = await chargerDonnees();
  const k = indicateurs(db, aujourdhui);
  const semaines = heuresParSemaine(db, aujourdhui);
  const capaciteHebdo = db.collaborateurs.filter((c) => c.actif).reduce((s, c) => s + c.heuresHebdo, 0);

  return (
    <>
      <EnTete
        titre="Tableau de bord"
        sousTitre={new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date())}
        actions={
          <>
            <LienBouton href="/temps" variante="secondaire">
              Saisir mes temps
            </LienBouton>
            <LienBouton href="/projets/nouveau">Nouvelle affaire</LienBouton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          libelle="Affaires en cours"
          valeur={k.nbEnCours}
          detail={`${k.nbProspects} prospect(s) en attente`}
          href="/projets?statut=En+cours"
        />
        <Stat
          libelle={`CA facturé ${aujourdhui.slice(0, 4)}`}
          valeur={eurosArrondis(k.caAnnee)}
          detail={`Reste à facturer : ${eurosArrondis(k.resteAFacturer)} HT`}
          href="/facturation"
        />
        <Stat
          libelle="Encours clients"
          valeur={eurosArrondis(k.enAttenteTtc)}
          ton={k.retards.length > 0 ? "alerte" : undefined}
          detail={
            k.retards.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-red-700">
                <AlertTriangle className="size-3.5" aria-hidden />
                {k.retards.length} facture(s) en retard · {eurosArrondis(k.retardTtc)} TTC
              </span>
            ) : (
              `${k.nbEmises} facture(s) en attente de paiement`
            )
          }
          href="/facturation?type=facture&statut=Émise"
        />
        <Stat
          libelle="Taux de saisie (4 sem.)"
          valeur={`${nombre(Math.round(k.tauxSaisie))} %`}
          detail={`${heures(k.heuresPeriode)} saisies sur ${heures(k.capacite)} de capacité`}
          href="/temps"
        />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Carte
            titre="Avancement des affaires en cours"
            corps={false}
            actions={<Link href="/projets" className="text-blue-700 hover:underline">Toutes les affaires</Link>}
          >
            {k.affaires.length === 0 ? (
              <Vide>Aucune affaire en cours.</Vide>
            ) : (
              <Tableau>
                <thead>
                  <tr>
                    <Th>Affaire</Th>
                    <Th>Phase</Th>
                    <Th>Heures consommées</Th>
                    <Th>Facturé</Th>
                    <Th droite>Fin prévue</Th>
                  </tr>
                </thead>
                <tbody>
                  {k.affaires.map(({ projet: p, conso, pctFacture, enRetard }) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <Td>
                        <Link href={`/projets/${p.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                          {p.nom}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {p.code} · {client(p.clientId)?.nom}
                        </div>
                      </Td>
                      <Td>
                        <Badge ton="bleu">{p.phase}</Badge>
                      </Td>
                      <Td className="min-w-40">
                        <Progression valeur={conso.pctHeures} libelle={`Heures consommées ${p.code}`} />
                      </Td>
                      <Td className="min-w-40">
                        <Progression valeur={pctFacture} libelle={`Honoraires facturés ${p.code}`} />
                      </Td>
                      <Td droite className={`whitespace-nowrap ${enRetard ? "font-medium text-red-700" : "text-slate-600"}`}>
                        {enRetard && <AlertTriangle className="mr-1 inline size-3.5" aria-label="En retard" />}
                        {dateCourte(p.dateFin)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Tableau>
            )}
          </Carte>

          <Carte titre="Points de vigilance" corps={false}>
            {k.tachesEnRetard.length === 0 && k.retards.length === 0 && k.alertes.length === 0 ? (
              <Vide>Rien à signaler.</Vide>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {k.alertes.map(({ projet: p, conso, enRetard }) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
                    <span className="flex-1">
                      <Link href={`/projets/${p.id}`} className="font-medium hover:text-blue-700">
                        {p.code}
                      </Link>{" "}
                      {conso.pctHeures > 100 && `dépasse son budget d'heures (${Math.round(conso.pctHeures)} %)`}
                      {conso.pctHeures > 100 && enRetard && " et "}
                      {enRetard && `a dépassé sa date de fin prévue (${dateCourte(p.dateFin)})`}
                    </span>
                    <Badge ton="orange">Affaire</Badge>
                  </li>
                ))}
                {k.retards.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 px-5 py-3">
                    <AlertTriangle className="size-4 shrink-0 text-red-600" aria-hidden />
                    <span className="flex-1">
                      <Link href={`/facturation/${f.id}`} className="font-medium hover:text-blue-700">
                        {f.numero}
                      </Link>{" "}
                      échue le {dateCourte(f.echeance)} — {client(projet(f.projetId)?.clientId ?? "")?.nom}
                    </span>
                    <Badge ton="rouge">Impayé</Badge>
                  </li>
                ))}
                {k.tachesEnRetard.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
                    <span className="flex-1">
                      <Link href={`/taches/${t.id}/modifier`} className="font-medium hover:text-blue-700">
                        {t.titre}
                      </Link>{" "}
                      <span className="text-slate-500">
                        ({projet(t.projetId)?.code}, {nomCollaborateur(t.assigneId)}) — prévue le{" "}
                        {dateCourte(t.echeance)}
                      </span>
                    </span>
                    <Badge ton="orange">Tâche en retard</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Carte>

          <Carte titre="Dernières factures" corps={false}>
            <ul className="divide-y divide-slate-100 text-sm">
              {db.pieces
                .filter((p) => p.type === "facture")
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-2 px-5 py-2.5">
                    <Link href={`/facturation/${f.id}`} className="hover:text-blue-700">
                      <span className="font-medium">{f.numero}</span>
                      <span className="block text-xs text-slate-500">{projet(f.projetId)?.code}</span>
                    </Link>
                    <span className="text-right">
                      <span className="block tabular-nums">
                        {euros(montantsPiece(f).ht)} HT
                      </span>
                      <span className="text-xs text-slate-500">{f.statut}</span>
                    </span>
                  </li>
                ))}
            </ul>
          </Carte>
        </div>

        <div className="min-w-0 space-y-6">
          <Carte titre="Heures saisies par semaine">
            <GraphiqueHeures donnees={semaines} capaciteHebdo={capaciteHebdo} />
          </Carte>

          <Carte
            titre="Échéances des 7 prochains jours"
            corps={false}
            actions={<Link href="/taches" className="text-blue-700 hover:underline">Toutes les tâches</Link>}
          >
            {k.tachesProches.length === 0 ? (
              <Vide>Aucune échéance cette semaine.</Vide>
            ) : (
              <ul className="divide-y divide-slate-100">
                {k.tachesProches.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Link href={`/taches/${t.id}/modifier`} className="text-sm font-medium hover:text-blue-700">
                        {t.titre}
                      </Link>
                      <div className="truncate text-xs text-slate-500">
                        {projet(t.projetId)?.code} · {nomCollaborateur(t.assigneId)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-slate-600">{dateCourte(t.echeance)}</div>
                      <Badge ton={tonPriorite[t.priorite]}>{t.priorite}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Carte>
        </div>
      </div>
    </>
  );
}
