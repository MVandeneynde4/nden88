# Gestion de bureau d'études

Application web Next.js pour piloter l'activité d'un bureau d'études techniques
(structure, fluides, VRD, thermique…) : affaires, phases de mission, tâches,
feuilles de temps, devis et factures d'honoraires.

## Fonctionnalités

| Module | Contenu |
|---|---|
| **Tableau de bord** | Affaires en cours, CA facturé de l'année, encours clients et factures en retard, taux de saisie des temps, avancement heures/facturation par affaire, heures saisies par semaine, échéances à 7 jours, points de vigilance |
| **Affaires** | Code d'affaire automatique (`AFF-2026-001`), client, chef de projet, domaine, phase de mission loi MOP (ESQ → AOR), budget honoraires et heures, coût de revient calculé à partir des temps, marge prévisionnelle, reste à facturer |
| **Tâches** | Tableau Kanban (À faire / En cours / En revue / Terminé), priorités, échéances, filtres par affaire et responsable |
| **Temps** | Feuille de temps hebdomadaire (grille affaires × jours), saisie rapide, navigation par semaine, filtre par collaborateur ; saisie impossible sur une affaire clôturée |
| **Facturation** | Devis et factures numérotés par année (`D-2026-001`, `F-2026-001`), lignes de prestations avec totaux HT/TVA/TTC, cycle de statuts, transformation d'un devis accepté en facture, document imprimable / export PDF via le navigateur |
| **Clients** | Maîtres d'ouvrage publics, privés ou particuliers, historique des affaires et des factures |
| **Équipe** | Collaborateurs, coût horaire chargé, taux de saisie sur 4 semaines, tâches ouvertes, répartition des heures par affaire |

Règles métier appliquées côté serveur :

- une facture émise n'est plus modifiable ni supprimable (numérotation continue) : on l'annule ;
- une affaire ayant des factures émises ne peut pas être supprimée ;
- un client rattaché à des affaires ne peut pas être supprimé ;
- un collaborateur ayant saisi des temps ou pilotant une affaire se désactive au lieu d'être supprimé.

## Démarrage

Prérequis : Node.js 20.9 ou plus récent.

```bash
npm install
npm run dev
```

Puis ouvrir <http://localhost:3000>. Au premier lancement, un jeu de données de
démonstration est créé (6 clients, 7 collaborateurs, 8 affaires, 10 semaines de
temps saisis, devis et factures). Il peut être régénéré depuis la page **Paramètres**.

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm start` | Build et serveur de production |
| `npm test` | Tests unitaires (Vitest) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |

## Configuration

- **Données** : stockées dans `data/db.json` (ignoré par git). Le chemin peut être
  changé avec la variable d'environnement `DATA_FILE`.
- **Coordonnées de l'entreprise** sur les devis et factures : `src/lib/entreprise.ts`.

## Architecture

- **Next.js 16** (App Router, Server Components, Server Actions), **React 19**,
  **TypeScript**, **Tailwind CSS 4**, **Zod** pour la validation, **lucide-react** pour les icônes.
- Les pages lisent les données côté serveur ; toutes les écritures passent par des
  Server Actions (`src/actions/`) qui valident les saisies et appliquent les règles métier.
- Les formulaires fonctionnent sans JavaScript côté client et conservent la saisie
  en cas d'erreur de validation.

```
src/
├── actions/         Server Actions (création, modification, suppression)
├── app/             Pages (tableau de bord, projets, taches, temps, facturation, clients, equipe, parametres)
├── components/      Interface (UI de base, navigation, formulaires, graphique)
└── lib/
    ├── types.ts       Modèle de données
    ├── db.ts          Persistance JSON (écritures atomiques et sérialisées)
    ├── calculs.ts     Montants, numérotation, consommation budgétaire, dates, formatage
    ├── indicateurs.ts Indicateurs du tableau de bord
    ├── schemas.ts     Validation Zod
    └── seed.ts        Données de démonstration
```

### Limites actuelles

- **Pas d'authentification** : l'application est prévue pour un usage en réseau
  local ou derrière un accès protégé. À ajouter avant toute exposition publique.
- **Stockage fichier JSON** : adapté à une petite équipe sur un seul serveur. Pour
  plusieurs instances ou un volume important, remplacer `src/lib/db.ts` par une
  base de données (PostgreSQL, SQLite…) ; le reste de l'application n'en dépend pas.
- Le numéro d'une facture est attribué dès sa création en brouillon : supprimer un
  brouillon qui n'est pas le dernier crée un trou dans la numérotation.

## À propos

I am student at University. my name is Miguel Vandeneynde... hi
