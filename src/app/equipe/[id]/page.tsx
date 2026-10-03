import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerCollaborateur } from "@/actions/equipe";
import { BoutonSupprimer } from "@/components/boutons";
import { Badge, Carte, EnTete, Info, LienBouton, Stat, Tableau, Td, Th, Vide } from "@/components/ui";
import { ajouterJours, arrondi2, dateCourte, debutSemaine, euros, heures } from "@/lib/calculs";
import { chargerDonnees } from "@/lib/requetes";
import { tonPriorite, tonStatutTache } from "@/lib/styles";

export default async function FicheCollaborateur({ params }: PageProps<"/equipe/[id]">) {
  const { id } = await params;
  const { db, collaborateur, projet, aujourdhui } = await chargerDonnees();
  const c = collaborateur(id);
  if (!c) notFound();

  const semaine = debutSemaine(aujourdhui);
  const temps = db.temps.filter((t) => t.collaborateurId === c.id);
  const hSemaine = temps.filter((t) => t.date >= semaine).reduce((s, t) => s + t.heures, 0);
  const debut4 = ajouterJours(semaine, -28);
  const h4 = temps.filter((t) => t.date >= debut4 && t.date < semaine).reduce((s, t) => s + t.heures, 0);
  const taches = db.taches
    .filter((t) => t.assigneId === c.id && t.statut !== "Terminé")
    .sort((a, b) => a.echeance.localeCompare(b.echeance));

  // Répartition des heures par affaire sur les 4 dernières semaines.
  const parProjet = new Map<string, number>();
  for (const t of temps) {
    if (t.date >= debut4 && t.date < semaine) parProjet.set(t.projetId, (parProjet.get(t.projetId) ?? 0) + t.heures);
  }
  const repartition = [...parProjet.entries()].sort((a, b) => b[1] - a[1]);
  const pilotees = db.projets.filter((p) => p.chefProjetId === c.id && p.statut === "En cours");

  return (
    <>
      <EnTete
        titre={`${c.prenom} ${c.nom}`}
        sousTitre={
          <span className="flex items-center gap-2">
            {c.poste} {!c.actif && <Badge>Inactif</Badge>}
          </span>
        }
        retour={{ href: "/equipe", libelle: "Équipe" }}
        actions={
          <>
            <LienBouton href={`/temps?collaborateur=${c.id}`} variante="secondaire">
              Feuille de temps
            </LienBouton>
            <LienBouton href={`/equipe/${c.id}/modifier`} variante="secondaire">
              Modifier
            </LienBouton>
            <BoutonSupprimer
              action={supprimerCollaborateur}
              id={c.id}
              confirmation={`Supprimer définitivement ${c.prenom} ${c.nom} ?`}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat libelle="Cette semaine" valeur={heures(arrondi2(hSemaine))} detail={`sur ${heures(c.heuresHebdo)} contractuelles`} />
        <Stat
          libelle="4 dernières semaines"
          valeur={heures(arrondi2(h4))}
          detail={`Taux de saisie ${Math.round((h4 / (c.heuresHebdo * 4)) * 100)} %`}
        />
        <Stat libelle="Tâches ouvertes" valeur={taches.length} detail={`${pilotees.length} affaire(s) pilotée(s)`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Carte titre="Informations">
          <dl className="space-y-3">
            <Info libelle="E-mail">{c.email && <a className="text-blue-700 hover:underline" href={`mailto:${c.email}`}>{c.email}</a>}</Info>
            <Info libelle="Téléphone">{c.telephone}</Info>
            <Info libelle="Coût horaire chargé">{euros(c.coutHoraire)} HT</Info>
            <Info libelle="Temps de travail">{heures(c.heuresHebdo)} / semaine</Info>
            <Info libelle="Chef de projet sur">
              {pilotees.length === 0
                ? "—"
                : pilotees.map((p) => (
                    <Link key={p.id} href={`/projets/${p.id}`} className="block text-blue-700 hover:underline">
                      {p.code} — {p.nom}
                    </Link>
                  ))}
            </Info>
          </dl>
        </Carte>

        <Carte titre="Tâches ouvertes" corps={false} className="lg:col-span-2">
          {taches.length === 0 ? (
            <Vide>Aucune tâche en cours.</Vide>
          ) : (
            <Tableau>
              <thead>
                <tr>
                  <Th>Tâche</Th>
                  <Th>Statut</Th>
                  <Th>Priorité</Th>
                  <Th droite>Échéance</Th>
                </tr>
              </thead>
              <tbody>
                {taches.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <Td>
                      <Link href={`/taches/${t.id}/modifier?retour=/equipe/${c.id}`} className="font-medium hover:text-blue-700">{t.titre}</Link>
                      <div className="text-xs text-slate-500">{projet(t.projetId)?.code}</div>
                    </Td>
                    <Td><Badge ton={tonStatutTache[t.statut]}>{t.statut}</Badge></Td>
                    <Td><Badge ton={tonPriorite[t.priorite]}>{t.priorite}</Badge></Td>
                    <Td droite className={t.echeance < aujourdhui ? "font-medium text-red-700" : ""}>{dateCourte(t.echeance)}</Td>
                  </tr>
                ))}
              </tbody>
            </Tableau>
          )}
        </Carte>

        <Carte titre="Répartition des heures (4 dernières semaines)" corps={false} className="lg:col-span-3">
          {repartition.length === 0 ? (
            <Vide>Aucune saisie sur la période.</Vide>
          ) : (
            <Tableau>
              <thead>
                <tr>
                  <Th>Affaire</Th>
                  <Th droite>Heures</Th>
                  <Th droite>Part</Th>
                </tr>
              </thead>
              <tbody>
                {repartition.map(([pid, h]) => (
                  <tr key={pid}>
                    <Td>
                      <Link href={`/projets/${pid}`} className="hover:text-blue-700">
                        {projet(pid)?.code} — {projet(pid)?.nom}
                      </Link>
                    </Td>
                    <Td droite>{heures(arrondi2(h))}</Td>
                    <Td droite>{Math.round((h / h4) * 100)} %</Td>
                  </tr>
                ))}
              </tbody>
            </Tableau>
          )}
        </Carte>
      </div>
    </>
  );
}
