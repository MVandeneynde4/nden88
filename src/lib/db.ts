// Persistance dans un fichier JSON (data/db.json par défaut, ou $DATA_FILE).
//
// Le fichier est la seule source de vérité : il est relu à chaque requête, ce qui
// évite toute incohérence entre instances de modules (rechargement à chaud,
// bundles distincts pour les pages et les Server Actions). Les écritures sont
// sérialisées par une file d'attente globale et rendues atomiques par
// écriture dans un fichier temporaire puis renommage.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { connection } from "next/server";
import { creerDonneesDemo } from "./seed";
import type { Database } from "./types";

const FICHIER = process.env.DATA_FILE ?? path.join(process.cwd(), "data", "db.json");

const g = globalThis as unknown as { __fileEcritureBe?: Promise<unknown> };

async function ecrire(db: Database): Promise<void> {
  await fs.mkdir(path.dirname(FICHIER), { recursive: true });
  const tmp = `${FICHIER}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, FICHIER);
}

async function lireFichier(): Promise<Database> {
  try {
    // Fichier de données lu à l'exécution : il ne doit pas être inclus dans le bundle.
    return JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ FICHIER, "utf8")) as Database;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const db = creerDonneesDemo();
    await ecrire(db);
    return db;
  }
}

function enFile<T>(travail: () => Promise<T>): Promise<T> {
  const precedent = g.__fileEcritureBe ?? Promise.resolve();
  const suivant = precedent.then(travail, travail);
  // La file ne doit pas rester bloquée sur une erreur : on avale le rejet ici,
  // il est propagé à l'appelant via `suivant`.
  g.__fileEcritureBe = suivant.catch(() => undefined);
  return suivant;
}

/** Lecture de toutes les données. Exclut la page du prérendu statique. */
export async function lireDb(): Promise<Database> {
  await connection();
  // On attend les écritures en cours pour garantir la lecture de ses propres écritures.
  await (g.__fileEcritureBe ?? Promise.resolve());
  return lireFichier();
}

/** Modifie les données de façon atomique. La fonction reçoit une copie modifiable. */
export function modifierDb<T>(fn: (db: Database) => T): Promise<T> {
  return enFile(async () => {
    const db = await lireFichier();
    const resultat = fn(db);
    await ecrire(db);
    return resultat;
  });
}

/** Remet les données de démonstration (utilisé depuis la page Paramètres). */
export function reinitialiserDb(): Promise<void> {
  return enFile(() => ecrire(creerDonneesDemo()));
}
