import { notFound } from "next/navigation";
import { FormulairePiece } from "@/components/formulaires/piece";
import { Carte, EnTete, LienBouton } from "@/components/ui";
import { chargerDonnees, optionsProjets } from "@/lib/requetes";

export default async function ModifierPiece({ params }: PageProps<"/facturation/[id]/modifier">) {
  const { id } = await params;
  const { db } = await chargerDonnees();
  const p = db.pieces.find((x) => x.id === id);
  if (!p) notFound();
  const verrouillee = p.type === "facture" && p.statut !== "Brouillon";
  return (
    <>
      <EnTete titre={`Modifier ${p.numero}`} retour={{ href: `/facturation/${p.id}`, libelle: p.numero }} />
      {verrouillee ? (
        <Carte className="max-w-2xl">
          <p className="text-sm text-slate-700">
            Cette facture a été émise : elle n&apos;est plus modifiable. Pour la corriger, passez-la au statut
            « Annulée » et établissez une nouvelle facture.
          </p>
          <div className="mt-4">
            <LienBouton href={`/facturation/${p.id}`} variante="secondaire">
              Retour à la facture
            </LienBouton>
          </div>
        </Carte>
      ) : (
        <Carte className="max-w-5xl">
          <FormulairePiece
            piece={p}
            type={p.type}
            projets={optionsProjets(db, { ouvertes: true, inclure: p.projetId })}
            defauts={{ date: p.date, echeance: p.echeance }}
          />
        </Carte>
      )}
    </>
  );
}
