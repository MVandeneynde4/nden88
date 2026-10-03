import { notFound } from "next/navigation";
import { FormulaireTemps } from "@/components/formulaires/temps";
import { Carte, EnTete } from "@/components/ui";
import { debutSemaine } from "@/lib/calculs";
import { chargerDonnees, optionsCollaborateurs, optionsProjets } from "@/lib/requetes";

export default async function ModifierTemps({ params }: PageProps<"/temps/[id]/modifier">) {
  const { id } = await params;
  const { db } = await chargerDonnees();
  const s = db.temps.find((t) => t.id === id);
  if (!s) notFound();
  const retour = `/temps?semaine=${debutSemaine(s.date)}&collaborateur=${s.collaborateurId}`;
  return (
    <>
      <EnTete titre="Modifier la saisie" retour={{ href: retour, libelle: "Feuille de temps" }} />
      <Carte className="max-w-3xl">
        <FormulaireTemps
          saisie={s}
          projets={optionsProjets(db, { ouvertes: true, inclure: s.projetId })}
          collaborateurs={optionsCollaborateurs(db, s.collaborateurId)}
          defauts={{ date: s.date }}
          annuler={retour}
        />
      </Carte>
    </>
  );
}
