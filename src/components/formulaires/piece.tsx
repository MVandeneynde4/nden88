"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { enregistrerPiece } from "@/actions/facturation";
import { euros, montantsPiece } from "@/lib/calculs";
import { STATUTS_DEVIS, STATUTS_FACTURE, type Piece, type TypePiece } from "@/lib/types";
import { Champ, Liste, Saisie } from "../champs";
import { classesBouton } from "../ui";
import { CadreFormulaire, useFormulaire, type Option } from "./commun";

interface LigneSaisie {
  cle: number;
  designation: string;
  quantite: string;
  prixUnitaire: string;
}

let compteur = 0;
const nouvelleLigne = (l?: Partial<LigneSaisie>): LigneSaisie => ({
  cle: ++compteur,
  designation: l?.designation ?? "",
  quantite: l?.quantite ?? "1",
  prixUnitaire: l?.prixUnitaire ?? "",
});

export function FormulairePiece({
  piece: p,
  type,
  projets,
  defauts,
}: {
  piece?: Piece;
  type: TypePiece;
  projets: Option[];
  defauts: { projetId?: string; date: string; echeance: string };
}) {
  const { etat, formAction, v, e } = useFormulaire(enregistrerPiece);
  const [lignes, setLignes] = useState<LigneSaisie[]>(() =>
    p
      ? p.lignes.map((l) =>
          nouvelleLigne({ designation: l.designation, quantite: String(l.quantite), prixUnitaire: String(l.prixUnitaire) }),
        )
      : [nouvelleLigne()],
  );
  const [tva, setTva] = useState(v("tauxTva", p?.tauxTva ?? 20));

  const maj = (cle: number, champ: keyof Omit<LigneSaisie, "cle">, valeur: string) =>
    setLignes((ls) => ls.map((l) => (l.cle === cle ? { ...l, [champ]: valeur } : l)));

  const totaux = montantsPiece({
    tauxTva: Number(tva) || 0,
    lignes: lignes.map((l) => ({
      designation: l.designation,
      quantite: Number(l.quantite) || 0,
      prixUnitaire: Number(l.prixUnitaire) || 0,
    })),
  });
  const statuts = type === "devis" ? STATUTS_DEVIS : STATUTS_FACTURE;
  const erreursLignes = Object.entries(etat.erreurs ?? {}).filter(([k]) => k.startsWith("lignes"));

  return (
    <CadreFormulaire
      action={formAction}
      message={etat.message}
      annuler={p ? `/facturation/${p.id}` : "/facturation"}
    >
      {p && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ libelle="Affaire" nom="projetId" erreurs={e("projetId")}>
          <Liste
            name="projetId"
            options={projets}
            vide="— Choisir une affaire —"
            defaultValue={v("projetId", p?.projetId ?? defauts.projetId)}
            erreur={!!e("projetId")}
          />
        </Champ>
        <Champ libelle="Objet" nom="objet" erreurs={e("objet")}>
          <Saisie name="objet" defaultValue={v("objet", p?.objet)} erreur={!!e("objet")} />
        </Champ>
        <Champ libelle={type === "devis" ? "Date du devis" : "Date de facture"} nom="date" erreurs={e("date")}>
          <Saisie type="date" name="date" defaultValue={v("date", p?.date ?? defauts.date)} erreur={!!e("date")} />
        </Champ>
        <Champ
          libelle={type === "devis" ? "Validité jusqu'au" : "Échéance de paiement"}
          nom="echeance"
          erreurs={e("echeance")}
        >
          <Saisie
            type="date"
            name="echeance"
            defaultValue={v("echeance", p?.echeance ?? defauts.echeance)}
            erreur={!!e("echeance")}
          />
        </Champ>
        <Champ libelle="Statut" nom="statut" erreurs={e("statut")}>
          <Liste name="statut" options={statuts} defaultValue={v("statut", p?.statut ?? "Brouillon")} />
        </Champ>
        <Champ libelle="Taux de TVA (%)" nom="tauxTva" erreurs={e("tauxTva")}>
          <Saisie
            type="number"
            step="0.1"
            min="0"
            max="100"
            name="tauxTva"
            value={tva}
            onChange={(ev) => setTva(ev.target.value)}
            erreur={!!e("tauxTva")}
          />
        </Champ>
      </div>

      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-medium text-slate-700">Prestations</legend>
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Désignation</th>
                <th className="w-24 px-3 py-2 text-right font-semibold">Qté</th>
                <th className="w-36 px-3 py-2 text-right font-semibold">PU HT (€)</th>
                <th className="w-32 px-3 py-2 text-right font-semibold">Total HT</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={l.cle} className="border-t border-slate-100">
                  <td className="px-2 py-1.5">
                    <input
                      name="designation"
                      aria-label={`Désignation ligne ${i + 1}`}
                      className="champ"
                      value={l.designation}
                      onChange={(ev) => maj(l.cle, "designation", ev.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      name="quantite"
                      type="number"
                      step="0.01"
                      aria-label={`Quantité ligne ${i + 1}`}
                      className="champ text-right"
                      value={l.quantite}
                      onChange={(ev) => maj(l.cle, "quantite", ev.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      name="prixUnitaire"
                      type="number"
                      step="0.01"
                      aria-label={`Prix unitaire ligne ${i + 1}`}
                      className="champ text-right"
                      value={l.prixUnitaire}
                      onChange={(ev) => maj(l.cle, "prixUnitaire", ev.target.value)}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">
                    {euros((Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0))}
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => setLignes((ls) => ls.filter((x) => x.cle !== l.cle))}
                      disabled={lignes.length === 1}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                      aria-label={`Supprimer la ligne ${i + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {erreursLignes.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-xs text-red-600">
            {erreursLignes.map(([k, msgs]) => (
              <li key={k}>
                {k === "lignes" ? "" : `Ligne ${Number(k.split(".")[1]) + 1} : `}
                {msgs?.join(", ")}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => setLignes((ls) => [...ls, nouvelleLigne()])}
            className={classesBouton("secondaire", "sm")}
          >
            <Plus className="size-4" aria-hidden /> Ajouter une ligne
          </button>
          <dl className="grid min-w-56 grid-cols-2 gap-x-6 gap-y-1 text-sm tabular-nums">
            <dt className="text-slate-500">Total HT</dt>
            <dd className="text-right">{euros(totaux.ht)}</dd>
            <dt className="text-slate-500">TVA {Number(tva) || 0} %</dt>
            <dd className="text-right">{euros(totaux.tva)}</dd>
            <dt className="font-semibold">Total TTC</dt>
            <dd className="text-right font-semibold">{euros(totaux.ttc)}</dd>
          </dl>
        </div>
      </fieldset>
    </CadreFormulaire>
  );
}
