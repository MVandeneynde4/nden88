"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Clock,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Menu,
  Receipt,
  Settings,
  Users,
  X,
} from "lucide-react";

const liens = [
  { href: "/", libelle: "Tableau de bord", icone: LayoutDashboard },
  { href: "/projets", libelle: "Affaires", icone: FolderKanban },
  { href: "/taches", libelle: "Tâches", icone: ListChecks },
  { href: "/temps", libelle: "Temps", icone: Clock },
  { href: "/facturation", libelle: "Facturation", icone: Receipt },
  { href: "/clients", libelle: "Clients", icone: Building2 },
  { href: "/equipe", libelle: "Équipe", icone: Users },
];

function estActif(chemin: string, href: string) {
  return href === "/" ? chemin === "/" : chemin === href || chemin.startsWith(`${href}/`);
}

function Liens({ onNaviguer }: { onNaviguer?: () => void }) {
  const chemin = usePathname();
  const lien = (href: string, libelle: string, Icone: typeof Settings) => {
    const actif = estActif(chemin, href);
    return (
      <Link
        key={href}
        href={href}
        onClick={onNaviguer}
        aria-current={actif ? "page" : undefined}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          actif ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icone className="size-4 shrink-0" aria-hidden />
        {libelle}
      </Link>
    );
  };
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {liens.map((l) => lien(l.href, l.libelle, l.icone))}
      <div className="mt-auto border-t border-white/10 pt-3">{lien("/parametres", "Paramètres", Settings)}</div>
    </nav>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-5 py-4">
      <span className="grid size-8 place-items-center rounded-md bg-blue-600 text-sm font-bold text-white">BE</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">Bureau d&apos;études</span>
        <span className="block text-xs text-slate-400">Gestion des affaires</span>
      </span>
    </Link>
  );
}

export function Navigation() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <>
      {/* Barre latérale fixe (écrans larges) */}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-60 flex-col bg-slate-900 lg:flex">
        <Logo />
        <Liens />
      </aside>

      {/* Barre supérieure + tiroir (mobile) */}
      <div className="no-print sticky top-0 z-30 flex items-center justify-between bg-slate-900 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="mr-3 rounded-md p-2 text-slate-300 hover:bg-white/10"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </button>
      </div>
      {ouvert && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOuvert(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOuvert(false)}
                className="mr-3 rounded-md p-2 text-slate-300 hover:bg-white/10"
                aria-label="Fermer le menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <Liens onNaviguer={() => setOuvert(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
