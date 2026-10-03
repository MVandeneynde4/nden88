"use client";

import { classesBouton } from "@/components/ui";

export default function Erreur({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-slate-500">
        {error.digest ? `Référence : ${error.digest}` : "Veuillez réessayer."}
      </p>
      <button type="button" onClick={() => retry()} className={`mt-6 ${classesBouton()}`}>
        Réessayer
      </button>
    </div>
  );
}
