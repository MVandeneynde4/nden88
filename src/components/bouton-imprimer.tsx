"use client";

import { Printer } from "lucide-react";
import { classesBouton } from "./ui";

export function BoutonImprimer() {
  return (
    <button type="button" onClick={() => window.print()} className={classesBouton("secondaire")}>
      <Printer className="size-4" aria-hidden /> Imprimer / PDF
    </button>
  );
}
