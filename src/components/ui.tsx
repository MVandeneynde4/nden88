import Link from "next/link";
import type { ReactNode } from "react";
import type { Ton } from "@/lib/styles";

export function EnTete({
  titre,
  sousTitre,
  actions,
  retour,
}: {
  titre: ReactNode;
  sousTitre?: ReactNode;
  actions?: ReactNode;
  retour?: { href: string; libelle: string };
}) {
  return (
    <div className="mb-6">
      {retour && (
        <Link href={retour.href} className="no-print mb-2 inline-block text-sm text-slate-500 hover:text-slate-800">
          ← {retour.libelle}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{titre}</h1>
          {sousTitre && <div className="mt-1 text-sm text-slate-500">{sousTitre}</div>}
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Carte({
  titre,
  actions,
  children,
  className = "",
  corps = true,
}: {
  titre?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Ajoute la marge intérieure au contenu (désactiver pour les tableaux pleine largeur). */
  corps?: boolean;
}) {
  return (
    <section className={`min-w-0 rounded-lg border border-slate-200 bg-white shadow-xs ${className}`}>
      {(titre || actions) && (
        <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">{titre}</h2>
          {actions && <div className="no-print flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">{actions}</div>}
        </header>
      )}
      <div className={corps ? "p-5" : ""}>{children}</div>
    </section>
  );
}

const tons: Record<Ton, string> = {
  gris: "bg-slate-100 text-slate-700 ring-slate-200",
  bleu: "bg-blue-50 text-blue-700 ring-blue-200",
  vert: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  orange: "bg-amber-50 text-amber-800 ring-amber-200",
  rouge: "bg-red-50 text-red-700 ring-red-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function Badge({ ton = "gris", children }: { ton?: Ton; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tons[ton]}`}
    >
      {children}
    </span>
  );
}

const variantes = {
  primaire: "bg-blue-700 text-white hover:bg-blue-800 shadow-xs",
  secondaire: "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 shadow-xs",
  danger: "bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50",
  discret: "text-slate-600 hover:bg-slate-100",
};
export type Variante = keyof typeof variantes;

export function classesBouton(variante: Variante = "primaire", taille: "sm" | "md" = "md") {
  const t = taille === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm";
  return `inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${t} ${variantes[variante]}`;
}

export function LienBouton({
  href,
  children,
  variante = "primaire",
  taille = "md",
}: {
  href: string;
  children: ReactNode;
  variante?: Variante;
  taille?: "sm" | "md";
}) {
  return (
    <Link href={href} className={classesBouton(variante, taille)}>
      {children}
    </Link>
  );
}

export function Stat({
  libelle,
  valeur,
  detail,
  ton,
  href,
}: {
  libelle: string;
  valeur: ReactNode;
  detail?: ReactNode;
  ton?: "alerte" | "ok";
  href?: string;
}) {
  const contenu = (
    <>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{libelle}</div>
      <div
        className={`mt-2 text-2xl font-semibold ${
          ton === "alerte" ? "text-red-700" : ton === "ok" ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {valeur}
      </div>
      {detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}
    </>
  );
  const cls = "block rounded-lg border border-slate-200 bg-white p-5 shadow-xs";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-blue-300`}>
      {contenu}
    </Link>
  ) : (
    <div className={cls}>{contenu}</div>
  );
}

/**
 * Jauge de consommation : bleu jusqu'à 85 %, orange jusqu'à 100 %, rouge au-delà.
 * La piste est un ton clair de la même teinte que le remplissage.
 */
export function Progression({ valeur, libelle }: { valeur: number; libelle?: string }) {
  const [piste, rempli] =
    valeur > 100 ? ["bg-red-100", "bg-red-600"] : valeur > 85 ? ["bg-amber-100", "bg-amber-500"] : ["bg-blue-100", "bg-blue-600"];
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 flex-1 overflow-hidden rounded-full ${piste}`}
        role="meter"
        aria-valuenow={Math.round(valeur)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={libelle}
      >
        <div className={`h-full rounded-full ${rempli}`} style={{ width: `${Math.min(valeur, 100)}%` }} />
      </div>
      <span className="w-12 text-right text-xs tabular-nums text-slate-600">{Math.round(valeur)} %</span>
    </div>
  );
}

export function Vide({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-slate-500">
      <p>{children}</p>
      {action}
    </div>
  );
}

export function Tableau({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, droite }: { children?: ReactNode; droite?: boolean }) {
  return (
    <th
      className={`border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-slate-500 ${
        droite ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  droite,
  className = "",
}: {
  children?: ReactNode;
  droite?: boolean;
  className?: string;
}) {
  return (
    <td className={`border-b border-slate-100 px-4 py-3 align-middle ${droite ? "text-right tabular-nums" : ""} ${className}`}>
      {children}
    </td>
  );
}

export function Info({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{libelle}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{children || "—"}</dd>
    </div>
  );
}
