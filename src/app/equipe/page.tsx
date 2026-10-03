import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Carte, EnTete, LienBouton, Progression, Tableau, Td, Th } from "@/components/ui";
import { ajouterJours, debutSemaine, euros, heures } from "@/lib/calculs";
import { chargerDonnees } from "@/lib/requetes";

export const metadata: Metadata = { title: "Équipe" };

export default async function PageEquipe() {
  const { db, aujourdhui } = await chargerDonnees();
  const fin = debutSemaine(aujourdhui);
  const debut = ajouterJours(fin, -28);
  const membres = [...db.collaborateurs].sort(
    (a, b) => Number(b.actif) - Number(a.actif) || a.nom.localeCompare(b.nom, "fr"),
  );

  return (
    <>
      <EnTete
        titre="Équipe"
        sousTitre={`${db.collaborateurs.filter((c) => c.actif).length} collaborateurs actifs`}
        actions={<LienBouton href="/equipe/nouveau">Nouveau collaborateur</LienBouton>}
      />
      <Carte corps={false}>
        <Tableau>
          <thead>
            <tr>
              <Th>Collaborateur</Th>
              <Th>Poste</Th>
              <Th droite>Coût horaire</Th>
              <Th>Taux de saisie (4 sem.)</Th>
              <Th droite>Tâches ouvertes</Th>
            </tr>
          </thead>
          <tbody>
            {membres.map((c) => {
              const h = db.temps
                .filter((t) => t.collaborateurId === c.id && t.date >= debut && t.date < fin)
                .reduce((s, t) => s + t.heures, 0);
              const ouvertes = db.taches.filter((t) => t.assigneId === c.id && t.statut !== "Terminé").length;
              return (
                <tr key={c.id} className={`hover:bg-slate-50 ${c.actif ? "" : "text-slate-400"}`}>
                  <Td>
                    <Link href={`/equipe/${c.id}`} className="flex items-center gap-3 font-medium hover:text-blue-700">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {c.prenom[0]}
                        {c.nom[0]}
                      </span>
                      <span>
                        {c.prenom} {c.nom}
                        {!c.actif && <span className="ml-2"><Badge>Inactif</Badge></span>}
                        <span className="block text-xs font-normal text-slate-500">{c.email}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td>{c.poste}</Td>
                  <Td droite>{euros(c.coutHoraire)}</Td>
                  <Td className="min-w-48">
                    {c.actif ? (
                      <>
                        <Progression valeur={(h / (c.heuresHebdo * 4)) * 100} libelle={`Taux de saisie ${c.prenom} ${c.nom}`} />
                        <span className="text-xs text-slate-500">{heures(h)} / {heures(c.heuresHebdo * 4)}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td droite>{ouvertes}</Td>
                </tr>
              );
            })}
          </tbody>
        </Tableau>
      </Carte>
    </>
  );
}
