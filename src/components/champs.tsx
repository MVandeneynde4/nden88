// Champs de formulaire réutilisables. Sans état : utilisables partout.
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Champ({
  libelle,
  nom,
  erreurs,
  aide,
  className = "",
  children,
}: {
  libelle: string;
  nom: string;
  erreurs?: string[];
  aide?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={nom} className="mb-1 block text-sm font-medium text-slate-700">
        {libelle}
      </label>
      {children}
      {aide && !erreurs?.length && <p className="mt-1 text-xs text-slate-500">{aide}</p>}
      {erreurs?.map((e) => (
        <p key={e} id={`${nom}-erreur`} className="mt-1 text-xs text-red-600">
          {e}
        </p>
      ))}
    </div>
  );
}

type AvecErreur = { erreur?: boolean };

export function Saisie({ erreur, ...props }: InputHTMLAttributes<HTMLInputElement> & AvecErreur) {
  return (
    <input
      id={props.name}
      aria-invalid={erreur || undefined}
      aria-describedby={erreur ? `${props.name}-erreur` : undefined}
      className="champ"
      {...props}
    />
  );
}

export function Liste({
  erreur,
  options,
  vide,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> &
  AvecErreur & {
    options: readonly (string | { valeur: string; libelle: string })[];
    /** Libellé d'une première option vide (« — Choisir — »). */
    vide?: string;
  }) {
  return (
    <select
      id={props.name}
      aria-invalid={erreur || undefined}
      aria-describedby={erreur ? `${props.name}-erreur` : undefined}
      className="champ"
      {...props}
    >
      {vide !== undefined && <option value="">{vide}</option>}
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.valeur} value={o.valeur}>
            {o.libelle}
          </option>
        ),
      )}
    </select>
  );
}

export function Zone({ erreur, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & AvecErreur) {
  return (
    <textarea
      id={props.name}
      rows={3}
      aria-invalid={erreur || undefined}
      aria-describedby={erreur ? `${props.name}-erreur` : undefined}
      className="champ"
      {...props}
    />
  );
}

export function MessageErreur({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}
