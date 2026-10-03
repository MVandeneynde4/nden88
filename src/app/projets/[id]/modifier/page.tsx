import { notFound } from "next/navigation";
import { FormulaireProjet } from "@/components/formulaires/projet";
import { Carte, EnTete } from "@/components/ui";
import { chargerDonnees, optionsClients, optionsCollaborateurs } from "@/lib/requetes";

export default async function ModifierProjet({ params }: PageProps<"/projets/[id]/modifier">) {
  const { id } = await params;
  const { db, projet } = await chargerDonnees();
  const p = projet(id);
  if (!p) notFound();
  return (
    <>
      <EnTete titre={`Modifier ${p.code}`} retour={{ href: `/projets/${p.id}`, libelle: p.nom }} />
      <Carte className="max-w-4xl">
        <FormulaireProjet
          projet={p}
          clients={optionsClients(db)}
          collaborateurs={optionsCollaborateurs(db, p.chefProjetId)}
          defauts={{ dateDebut: p.dateDebut, dateFin: p.dateFin }}
        />
      </Carte>
    </>
  );
}
