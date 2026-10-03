import { dateCourte, nombre } from "@/lib/calculs";

/**
 * Colonnes des heures saisies par semaine (une seule série, une seule teinte).
 * La semaine courante, incomplète, est en ton clair. Info-bulle au survol et au
 * focus clavier ; un tableau équivalent est fourni aux lecteurs d'écran.
 */
export function GraphiqueHeures({
  donnees,
  capaciteHebdo,
}: {
  donnees: { debut: string; heures: number; courante: boolean }[];
  capaciteHebdo: number;
}) {
  const max = Math.max(capaciteHebdo, ...donnees.map((d) => d.heures), 1);
  const pas = max > 400 ? 100 : max > 150 ? 50 : 20;
  const plafond = Math.ceil(max / pas) * pas;
  const graduations = Array.from({ length: plafond / pas + 1 }, (_, i) => i * pas);
  const hauteur = 176; // px
  const y = (v: number) => (v / plafond) * hauteur;

  return (
    <figure>
      <div className="flex gap-2" aria-hidden>
        {/* Axe vertical */}
        <div className="relative w-9 shrink-0 text-right text-[11px] text-slate-400" style={{ height: hauteur }}>
          {graduations.map((g) => (
            <span key={g} className="absolute right-0 translate-y-1/2 tabular-nums" style={{ bottom: y(g) }}>
              {nombre(g)}
            </span>
          ))}
        </div>
        <div className="flex-1">
          <div className="relative" style={{ height: hauteur }}>
            {graduations.map((g) => (
              <div key={g} className="absolute inset-x-0 border-t border-slate-100" style={{ bottom: y(g) }} />
            ))}
            {capaciteHebdo > 0 && (
              <div
                className="absolute inset-x-0 border-t border-slate-400"
                style={{ bottom: y(capaciteHebdo) }}
              >
                <span className="absolute right-0 -top-4 bg-white pl-1 text-[11px] text-slate-500">
                  Capacité {nombre(capaciteHebdo)} h
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-around">
              {donnees.map((d) => (
                <div
                  key={d.debut}
                  tabIndex={0}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                >
                  <div
                    className={`w-full max-w-6 rounded-t ${
                      d.courante ? "bg-blue-200" : "bg-blue-600"
                    } group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-blue-400`}
                    style={{ height: Math.max(y(d.heures), d.heures > 0 ? 2 : 0) }}
                  />
                  <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-visible:block">
                    Sem. du {dateCourte(d.debut)}
                    <br />
                    <span className="font-semibold">{nombre(d.heures)} h</span>
                    {d.courante && <span className="text-slate-300"> (en cours)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1.5 flex justify-around text-[11px] text-slate-500">
            {donnees.map((d) => (
              <span key={d.debut} className="flex-1 text-center">
                {dateCourte(d.debut).replace(/ \d{4}$/, "")}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-slate-500">
        Semaine courante en ton clair (saisie incomplète). Trait gris : capacité hebdomadaire de l&apos;équipe active.
      </figcaption>
      <table className="sr-only">
        <caption>Heures saisies par semaine</caption>
        <thead>
          <tr>
            <th>Semaine du</th>
            <th>Heures</th>
          </tr>
        </thead>
        <tbody>
          {donnees.map((d) => (
            <tr key={d.debut}>
              <td>{dateCourte(d.debut)}</td>
              <td>{nombre(d.heures)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
