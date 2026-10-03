import { notFound } from "next/navigation";
import { supprimerTache } from "@/actions/taches";
import { BoutonSupprimer } from "@/components/boutons";
import { FormulaireTache } from "@/components/formulaires/tache";
import { Carte, EnTete } from "@/components/ui";
import { chargerDonnees, optionsCollaborateurs, optionsProjets } from "@/lib/requetes";

export default async function ModifierTache({ params, searchParams }: PageProps<"/taches/[id]/modifier">) {
  const { id } = await params;
  const { retour: brut } = (await searchParams) as Record<string, string | undefined>;
  // Seules les redirections internes sont acceptées.
  const retour = brut && brut.startsWith("/") && !brut.startsWith("//") ? brut : "/taches";
  const { db } = await chargerDonnees();
  const t = db.taches.find((x) => x.id === id);
  if (!t) notFound();
  return (
    <>
      <EnTete
        titre="Modifier la tâche"
        sousTitre={t.titre}
        retour={{ href: retour, libelle: "Retour" }}
        actions={
          <BoutonSupprimer
            action={supprimerTache}
            id={t.id}
            champs={{ retour }}
            confirmation={`Supprimer la tâche « ${t.titre} » ?`}
          />
        }
      />
      <Carte className="max-w-3xl">
        <FormulaireTache
          tache={t}
          projets={optionsProjets(db, { ouvertes: true, inclure: t.projetId })}
          collaborateurs={optionsCollaborateurs(db, t.assigneId)}
          defauts={{ echeance: t.echeance }}
          retour={retour}
        />
      </Carte>
    </>
  );
}
