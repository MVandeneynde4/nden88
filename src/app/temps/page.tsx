import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { supprimerTemps } from "@/actions/temps";
import { BoutonSupprimer } from "@/components/boutons";
import { Liste } from "@/components/champs";
import { SaisieRapideTemps } from "@/components/formulaires/temps";
import { Carte, EnTete, Tableau, Td, Th, Vide, classesBouton } from "@/components/ui";
import { ajouterJours, arrondi2, dateCourte, debutSemaine, nombre, parseIso } from "@/lib/calculs";
import { chargerDonnees, optionsCollaborateurs, optionsProjets } from "@/lib/requetes";

export const metadata: Metadata = { title: "Temps" };

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function PageTemps({ searchParams }: PageProps<"/temps">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const { db, projet, nomCollaborateur, aujourdhui, collaborateur } = await chargerDonnees();

  const semaine = /^\d{4}-\d{2}-\d{2}$/.test(sp.semaine ?? "") ? debutSemaine(sp.semaine!) : debutSemaine(aujourdhui);
  const collabId = sp.collaborateur && collaborateur(sp.collaborateur) ? sp.collaborateur : "";
  const jours = JOURS.map((_, i) => ajouterJours(semaine, i));
  const finSemaine = ajouterJours(semaine, 7);

  const saisies = db.temps
    .filter((t) => t.date >= semaine && t.date < finSemaine)
    .filter((t) => !collabId || t.collaborateurId === collabId)
    .sort((a, b) => a.date.localeCompare(b.date) || nomCollaborateur(a.collaborateurId).localeCompare(nomCollaborateur(b.collaborateurId)));

  // Grille affaire × jour.
  const grille = new Map<string, number[]>();
  for (const t of saisies) {
    const ligne = grille.get(t.projetId) ?? Array(7).fill(0);
    ligne[(parseIso(t.date).getDay() + 6) % 7] += t.heures;
    grille.set(t.projetId, ligne);
  }
  const lignes = [...grille.entries()].sort((a, b) =>
    (projet(a[0])?.code ?? "").localeCompare(projet(b[0])?.code ?? ""),
  );
  const totauxJour = jours.map((_, i) => arrondi2(lignes.reduce((s, [, l]) => s + l[i], 0)));
  const total = arrondi2(totauxJour.reduce((a, b) => a + b, 0));
  const cible = collabId
    ? collaborateur(collabId)!.heuresHebdo
    : db.collaborateurs.filter((c) => c.actif).reduce((s, c) => s + c.heuresHebdo, 0);

  const lien = (s: string) => {
    const q = new URLSearchParams({ semaine: s });
    if (collabId) q.set("collaborateur", collabId);
    return `/temps?${q}`;
  };
  const dateDefaut = aujourdhui >= semaine && aujourdhui < finSemaine ? aujourdhui : semaine;

  return (
    <>
      <EnTete
        titre="Feuille de temps"
        sousTitre={`Semaine du ${dateCourte(semaine)} au ${dateCourte(ajouterJours(semaine, 6))}`}
        actions={
          <div className="flex items-center gap-1">
            <Link href={lien(ajouterJours(semaine, -7))} className={classesBouton("secondaire")} aria-label="Semaine précédente">
              <ChevronLeft className="size-4" />
            </Link>
            <Link href={lien(debutSemaine(aujourdhui))} className={classesBouton("secondaire")}>
              Cette semaine
            </Link>
            <Link href={lien(ajouterJours(semaine, 7))} className={classesBouton("secondaire")} aria-label="Semaine suivante">
              <ChevronRight className="size-4" />
            </Link>
          </div>
        }
      />

      <Form action="/temps" className="mb-5 flex flex-wrap items-center gap-3">
        <input type="hidden" name="semaine" value={semaine} />
        <div className="w-full sm:w-64">
          <Liste
            name="collaborateur"
            options={optionsCollaborateurs(db, collabId)}
            vide="Toute l'équipe"
            defaultValue={collabId}
            aria-label="Collaborateur"
          />
        </div>
        <button className={classesBouton("secondaire")}>Afficher</button>
      </Form>

      <Carte titre="Nouvelle saisie" className="mb-6">
        <SaisieRapideTemps
          // Remonté à chaque changement de filtre pour reprendre les valeurs par défaut.
          key={`${semaine}-${collabId}`}
          projets={optionsProjets(db, { ouvertes: true })}
          collaborateurs={optionsCollaborateurs(db)}
          defauts={{ collaborateurId: collabId || undefined, date: dateDefaut }}
        />
      </Carte>

      <Carte
        titre={collabId ? `Synthèse — ${nomCollaborateur(collabId)}` : "Synthèse — toute l'équipe"}
        corps={false}
        className="mb-6"
        actions={
          <span className={total < cible ? "text-amber-700" : "text-emerald-700"}>
            {nombre(total)} h / {nombre(cible)} h
          </span>
        }
      >
        {lignes.length === 0 ? (
          <Vide>Aucune saisie sur cette semaine.</Vide>
        ) : (
          <Tableau>
            <thead>
              <tr>
                <Th>Affaire</Th>
                {jours.map((j, i) => (
                  <Th key={j} droite>
                    <span className={j === aujourdhui ? "text-blue-700" : ""}>
                      {JOURS[i]} {parseIso(j).getDate()}
                    </span>
                  </Th>
                ))}
                <Th droite>Total</Th>
              </tr>
            </thead>
            <tbody>
              {lignes.map(([pid, l]) => (
                <tr key={pid}>
                  <Td>
                    <Link href={`/projets/${pid}`} className="hover:text-blue-700">
                      <span className="font-medium">{projet(pid)?.code}</span>
                      <span className="block max-w-64 truncate text-xs text-slate-500">{projet(pid)?.nom}</span>
                    </Link>
                  </Td>
                  {l.map((h, i) => (
                    <Td key={i} droite className={i >= 5 ? "bg-slate-50" : ""}>
                      {h ? nombre(arrondi2(h)) : <span className="text-slate-300">·</span>}
                    </Td>
                  ))}
                  <Td droite className="font-semibold">{nombre(arrondi2(l.reduce((a, b) => a + b, 0)))}</Td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold">
                <Td>Total</Td>
                {totauxJour.map((h, i) => (
                  <Td key={i} droite>{h ? nombre(h) : ""}</Td>
                ))}
                <Td droite>{nombre(total)}</Td>
              </tr>
            </tbody>
          </Tableau>
        )}
      </Carte>

      <Carte titre={`Détail des saisies (${saisies.length})`} corps={false}>
        {saisies.length === 0 ? (
          <Vide>Aucune saisie.</Vide>
        ) : (
          <Tableau>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Collaborateur</Th>
                <Th>Affaire</Th>
                <Th>Description</Th>
                <Th droite>Heures</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {saisies.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <Td className="whitespace-nowrap">{dateCourte(t.date)}</Td>
                  <Td className="whitespace-nowrap">{nomCollaborateur(t.collaborateurId)}</Td>
                  <Td className="whitespace-nowrap">{projet(t.projetId)?.code}</Td>
                  <Td className="text-slate-600">{t.description}</Td>
                  <Td droite>{nombre(t.heures)}</Td>
                  <Td droite>
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/temps/${t.id}/modifier`}
                        className={classesBouton("discret", "sm")}
                        aria-label="Modifier la saisie"
                        title="Modifier"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <BoutonSupprimer
                        action={supprimerTemps}
                        id={t.id}
                        taille="sm"
                        confirmation="Supprimer cette saisie de temps ?"
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tableau>
        )}
      </Carte>
    </>
  );
}
