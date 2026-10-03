import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { changerStatutTache } from "@/actions/taches";
import { BoutonEnvoi } from "@/components/boutons";
import { Liste } from "@/components/champs";
import { Badge, EnTete, LienBouton, classesBouton } from "@/components/ui";
import { dateCourte, heures } from "@/lib/calculs";
import { chargerDonnees, optionsCollaborateurs, optionsProjets } from "@/lib/requetes";
import { tonPriorite } from "@/lib/styles";
import { PRIORITES, STATUTS_TACHE } from "@/lib/types";

export const metadata: Metadata = { title: "Tâches" };

export default async function PageTaches({ searchParams }: PageProps<"/taches">) {
  const { projet: projetId = "", assigne = "" } = (await searchParams) as Record<string, string | undefined>;
  const { db, projet, nomCollaborateur, aujourdhui } = await chargerDonnees();

  const taches = db.taches
    .filter((t) => !projetId || t.projetId === projetId)
    .filter((t) => !assigne || t.assigneId === assigne)
    .sort(
      (a, b) =>
        PRIORITES.indexOf(b.priorite) - PRIORITES.indexOf(a.priorite) || a.echeance.localeCompare(b.echeance),
    );
  const nouvelleHref = projetId ? `/taches/nouvelle?projet=${projetId}` : "/taches/nouvelle";

  return (
    <>
      <EnTete
        titre="Tâches"
        sousTitre={`${taches.filter((t) => t.statut !== "Terminé").length} tâche(s) ouverte(s)`}
        actions={<LienBouton href={nouvelleHref}>Nouvelle tâche</LienBouton>}
      />

      <Form action="/taches" className="mb-5 flex flex-wrap gap-3">
        <div className="w-full sm:w-80">
          <Liste
            name="projet"
            options={optionsProjets(db, { ouvertes: true, inclure: projetId })}
            vide="Toutes les affaires"
            defaultValue={projetId}
            aria-label="Affaire"
          />
        </div>
        <div className="w-full sm:w-56">
          <Liste
            name="assigne"
            options={optionsCollaborateurs(db, assigne)}
            vide="Tous les responsables"
            defaultValue={assigne}
            aria-label="Responsable"
          />
        </div>
        <button className={classesBouton("secondaire")}>Filtrer</button>
        {(projetId || assigne) && (
          <Link href="/taches" className={classesBouton("discret")}>
            Réinitialiser
          </Link>
        )}
      </Form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUTS_TACHE.map((statut, col) => {
          const liste = taches.filter((t) => t.statut === statut);
          return (
            <section key={statut} className="flex min-w-0 flex-col rounded-lg bg-slate-100/80 p-3">
              <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-slate-700">
                {statut}
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">{liste.length}</span>
              </h2>
              <ul className="flex flex-col gap-2">
                {liste.length === 0 && <li className="px-1 py-4 text-center text-xs text-slate-400">Aucune tâche</li>}
                {liste.map((t) => {
                  const p = projet(t.projetId);
                  const retard = t.statut !== "Terminé" && t.echeance < aujourdhui;
                  return (
                    <li key={t.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/taches/${t.id}/modifier`} className="text-sm font-medium leading-snug hover:text-blue-700">
                          {t.titre}
                        </Link>
                        <Badge ton={tonPriorite[t.priorite]}>{t.priorite}</Badge>
                      </div>
                      {p && (
                        <Link href={`/projets/${p.id}`} className="mt-1 block truncate text-xs text-slate-500 hover:text-blue-700">
                          {p.code} — {p.nom}
                        </Link>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                        <span>{nomCollaborateur(t.assigneId)}</span>
                        <span className={retard ? "font-medium text-red-700" : ""}>
                          {retard && "En retard · "}
                          {dateCourte(t.echeance)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-xs text-slate-400">{t.heuresEstimees > 0 && `${heures(t.heuresEstimees)} estimées`}</span>
                        <form action={changerStatutTache} className="flex gap-1">
                          <input type="hidden" name="id" value={t.id} />
                          {col > 0 && (
                            <BoutonEnvoi
                              variante="discret"
                              taille="sm"
                              name="statut"
                              value={STATUTS_TACHE[col - 1]}
                              title={`Passer à « ${STATUTS_TACHE[col - 1]} »`}
                            >
                              <ChevronLeft className="size-4" aria-hidden />
                              <span className="sr-only">Passer à « {STATUTS_TACHE[col - 1]} »</span>
                            </BoutonEnvoi>
                          )}
                          {col < STATUTS_TACHE.length - 1 && (
                            <BoutonEnvoi
                              variante="discret"
                              taille="sm"
                              name="statut"
                              value={STATUTS_TACHE[col + 1]}
                              title={`Passer à « ${STATUTS_TACHE[col + 1]} »`}
                            >
                              <ChevronRight className="size-4" aria-hidden />
                              <span className="sr-only">Passer à « {STATUTS_TACHE[col + 1]} »</span>
                            </BoutonEnvoi>
                          )}
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
