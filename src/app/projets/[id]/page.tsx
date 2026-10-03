import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { supprimerProjet } from "@/actions/projets";
import { BoutonSupprimer } from "@/components/boutons";
import { Badge, Carte, EnTete, Info, LienBouton, Progression, Stat, Tableau, Td, Th, Vide } from "@/components/ui";
import { arrondi2, consommationProjet, dateCourte, euros, eurosArrondis, heures, montantsPiece } from "@/lib/calculs";
import { factureHtProjet } from "@/lib/indicateurs";
import { chargerDonnees } from "@/lib/requetes";
import { tonPriorite, tonStatutPiece, tonStatutProjet, tonStatutTache } from "@/lib/styles";
import { PHASES, PHASE_LIBELLES } from "@/lib/types";

export default async function FicheProjet({ params }: PageProps<"/projets/[id]">) {
  const { id } = await params;
  const { db, projet, client, nomCollaborateur, aujourdhui } = await chargerDonnees();
  const p = projet(id);
  if (!p) notFound();

  const cli = client(p.clientId);
  const conso = consommationProjet(p, db.temps, db.collaborateurs);
  const facture = factureHtProjet(db, p.id);
  const pctFacture = p.budgetHonoraires > 0 ? (facture / p.budgetHonoraires) * 100 : 0;
  const taches = db.taches
    .filter((t) => t.projetId === p.id)
    .sort((a, b) => Number(a.statut === "Terminé") - Number(b.statut === "Terminé") || a.echeance.localeCompare(b.echeance));
  const pieces = db.pieces.filter((x) => x.projetId === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const indexPhase = PHASES.indexOf(p.phase);
  const enRetard = p.dateFin < aujourdhui && (p.statut === "En cours" || p.statut === "En pause");

  // Heures et coût par collaborateur.
  const parCollab = new Map<string, { heures: number; cout: number }>();
  for (const t of db.temps) {
    if (t.projetId !== p.id) continue;
    const taux = db.collaborateurs.find((c) => c.id === t.collaborateurId)?.coutHoraire ?? 0;
    const e = parCollab.get(t.collaborateurId) ?? { heures: 0, cout: 0 };
    e.heures += t.heures;
    e.cout += t.heures * taux;
    parCollab.set(t.collaborateurId, e);
  }
  const equipe = [...parCollab.entries()].sort((a, b) => b[1].heures - a[1].heures);
  const derniersTemps = db.temps
    .filter((t) => t.projetId === p.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <>
      <EnTete
        titre={p.nom}
        sousTitre={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{p.code}</span>
            <Badge ton={tonStatutProjet[p.statut]}>{p.statut}</Badge>
            <span>·</span>
            {cli && <Link href={`/clients/${cli.id}`} className="hover:text-blue-700">{cli.nom}</Link>}
          </span>
        }
        retour={{ href: "/projets", libelle: "Affaires" }}
        actions={
          <>
            <LienBouton href={`/taches/nouvelle?projet=${p.id}`} variante="secondaire">
              Ajouter une tâche
            </LienBouton>
            <LienBouton href={`/facturation/nouveau?type=facture&projet=${p.id}`} variante="secondaire">
              Facturer
            </LienBouton>
            <LienBouton href={`/projets/${p.id}/modifier`} variante="secondaire">
              Modifier
            </LienBouton>
            <BoutonSupprimer
              action={supprimerProjet}
              id={p.id}
              confirmation={`Supprimer l'affaire ${p.code} ainsi que ses tâches, temps, devis et factures brouillon ?`}
            />
          </>
        }
      />

      {/* Avancement des phases de la mission (loi MOP) */}
      <Carte className="mb-6">
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-9" aria-label="Phases de la mission">
          {PHASES.map((ph, i) => {
            const etat = i < indexPhase ? "faite" : i === indexPhase ? "courante" : "a-venir";
            return (
              <li key={ph} title={PHASE_LIBELLES[ph]} aria-current={etat === "courante" ? "step" : undefined}>
                <div
                  className={`h-1.5 rounded-full ${
                    etat === "faite" ? "bg-blue-600" : etat === "courante" ? "bg-blue-300" : "bg-slate-200"
                  }`}
                />
                <div className={`mt-1.5 text-xs ${etat === "courante" ? "font-semibold text-blue-800" : "text-slate-500"}`}>
                  {ph}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-sm text-slate-600">
          Phase en cours : <strong>{PHASE_LIBELLES[p.phase]}</strong>
        </p>
      </Carte>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat libelle="Honoraires" valeur={eurosArrondis(p.budgetHonoraires)} detail="HT, montant de la mission" />
        <Stat
          libelle="Heures consommées"
          valeur={heures(conso.heures)}
          ton={conso.pctHeures > 100 ? "alerte" : undefined}
          detail={`${Math.round(conso.pctHeures)} % de ${heures(p.budgetHeures)} budgétées`}
        />
        <Stat
          libelle="Marge prévisionnelle"
          valeur={eurosArrondis(conso.marge)}
          ton={conso.marge < 0 ? "alerte" : undefined}
          detail={`Coût de revient ${eurosArrondis(conso.cout)} · ${Math.round(conso.pctMarge)} %`}
        />
        <Stat
          libelle="Facturé"
          valeur={eurosArrondis(facture)}
          detail={`${Math.round(pctFacture)} % · reste ${eurosArrondis(Math.max(0, p.budgetHonoraires - facture))} HT`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Carte titre="Informations">
          <dl className="space-y-3">
            <Info libelle="Chef de projet">
              <Link href={`/equipe/${p.chefProjetId}`} className="text-blue-700 hover:underline">
                {nomCollaborateur(p.chefProjetId)}
              </Link>
            </Info>
            <Info libelle="Domaine">{p.domaine}</Info>
            <Info libelle="Lieu">{p.ville}</Info>
            <Info libelle="Période">
              {dateCourte(p.dateDebut)} → {dateCourte(p.dateFin)}
              {enRetard && (
                <span className="mt-1 flex items-center gap-1 text-xs font-medium text-red-700">
                  <AlertTriangle className="size-3.5" aria-hidden /> Date de fin dépassée
                </span>
              )}
            </Info>
            <Info libelle="Budget heures">
              <Progression valeur={conso.pctHeures} libelle="Heures consommées" />
            </Info>
            <Info libelle="Honoraires facturés">
              <Progression valeur={pctFacture} libelle="Honoraires facturés" />
            </Info>
            {p.description && (
              <Info libelle="Description">
                <span className="whitespace-pre-line">{p.description}</span>
              </Info>
            )}
          </dl>
        </Carte>

        <Carte
          titre={`Tâches (${taches.filter((t) => t.statut !== "Terminé").length} ouvertes)`}
          corps={false}
          className="lg:col-span-2"
          actions={<Link href={`/taches/nouvelle?projet=${p.id}`} className="text-blue-700 hover:underline">Ajouter</Link>}
        >
          {taches.length === 0 ? (
            <Vide>Aucune tâche planifiée.</Vide>
          ) : (
            <Tableau>
              <thead>
                <tr>
                  <Th>Tâche</Th>
                  <Th>Responsable</Th>
                  <Th>Statut</Th>
                  <Th>Priorité</Th>
                  <Th droite>Échéance</Th>
                </tr>
              </thead>
              <tbody>
                {taches.map((t) => (
                  <tr key={t.id} className={`hover:bg-slate-50 ${t.statut === "Terminé" ? "text-slate-400" : ""}`}>
                    <Td>
                      <Link href={`/taches/${t.id}/modifier?retour=/projets/${p.id}`} className="font-medium hover:text-blue-700">
                        {t.titre}
                      </Link>
                    </Td>
                    <Td className="whitespace-nowrap">{nomCollaborateur(t.assigneId)}</Td>
                    <Td><Badge ton={tonStatutTache[t.statut]}>{t.statut}</Badge></Td>
                    <Td><Badge ton={tonPriorite[t.priorite]}>{t.priorite}</Badge></Td>
                    <Td droite className={t.statut !== "Terminé" && t.echeance < aujourdhui ? "font-medium text-red-700" : ""}>
                      {dateCourte(t.echeance)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tableau>
          )}
        </Carte>

        <Carte titre="Temps passés par collaborateur" corps={false}>
          {equipe.length === 0 ? (
            <Vide>Aucun temps saisi.</Vide>
          ) : (
            <Tableau>
              <thead>
                <tr>
                  <Th>Collaborateur</Th>
                  <Th droite>Heures</Th>
                  <Th droite>Coût</Th>
                </tr>
              </thead>
              <tbody>
                {equipe.map(([cid, v]) => (
                  <tr key={cid}>
                    <Td>{nomCollaborateur(cid)}</Td>
                    <Td droite>{heures(arrondi2(v.heures))}</Td>
                    <Td droite>{eurosArrondis(v.cout)}</Td>
                  </tr>
                ))}
              </tbody>
            </Tableau>
          )}
        </Carte>

        <Carte
          titre="Dernières saisies"
          corps={false}
          actions={<Link href="/temps" className="text-blue-700 hover:underline">Saisir</Link>}
        >
          {derniersTemps.length === 0 ? (
            <Vide>Aucune saisie.</Vide>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {derniersTemps.map((t) => (
                <li key={t.id} className="flex justify-between gap-2 px-5 py-2.5">
                  <span>
                    {nomCollaborateur(t.collaborateurId)}
                    <span className="block text-xs text-slate-500">
                      {dateCourte(t.date)} · {t.description || "—"}
                    </span>
                  </span>
                  <span className="tabular-nums">{heures(t.heures)}</span>
                </li>
              ))}
            </ul>
          )}
        </Carte>

        <Carte
          titre="Devis et factures"
          corps={false}
          actions={
            <Link href={`/facturation/nouveau?type=devis&projet=${p.id}`} className="text-blue-700 hover:underline">
              Nouveau devis
            </Link>
          }
        >
          {pieces.length === 0 ? (
            <Vide>Aucune pièce.</Vide>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {pieces.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-2 px-5 py-2.5">
                  <Link href={`/facturation/${x.id}`} className="hover:text-blue-700">
                    <span className="font-medium">{x.numero}</span>
                    <span className="block text-xs text-slate-500">
                      {x.type === "devis" ? "Devis" : "Facture"} · {dateCourte(x.date)}
                    </span>
                  </Link>
                  <span className="text-right">
                    <span className="block tabular-nums">{euros(montantsPiece(x).ht)} HT</span>
                    <Badge ton={tonStatutPiece[x.statut]}>{x.statut}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
    </>
  );
}
