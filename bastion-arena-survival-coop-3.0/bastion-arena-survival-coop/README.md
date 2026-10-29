# Bastion Arena Survival 3.0 — Jeu, comptes, classement et co-op 2 joueurs

Tout tourne sur Render : site + API (Web Service `bastion-arena`), serveur co-op (Web Service `bastion-coop-server`) et base PostgreSQL (`bastion-db`).

## Structure
- `index.html`, `styles.css`, `i18n.js`, `ui.js`, `game-*.js`, `*.glb` : jeu 3.0 (client)
- `account.js`, `api/*.js`, `lib/` : comptes, sauvegarde, présence, classement
- `server.js` : serveur Express (jeu + API)
- `multiplayer.js`, `multiplayer-server/` : co-op 2 joueurs (serveur WebSocket séparé)
- `database/bastion.sql` : schéma (comptes, sauvegardes, classement)
- `render.yaml` : Blueprint Render (base + 2 services)

## Routes API
- `auth`, `me`, `save`, `load` : comptes et sauvegarde (cookie de session)
- `presence` (POST) : compteur de joueurs en ligne (60 s de fenêtre, en mémoire)
- `leaderboard` (GET `?mode=`, POST) : meilleur score par joueur (GET public, POST réservé aux comptes)

## 1. Déploiement initial
1. Pousse ce dossier dans ton dépôt GitHub.
2. Sur Render : **New → Blueprint**, choisis le dépôt. Render crée `bastion-db`, `bastion-arena` et `bastion-coop-server`.
3. Crée le schéma une fois : ouvre `bastion-db` → **Connect** → **PSQL Command**, puis exécute `database/bastion.sql` dessus.
4. Vérifie que `window.BASTION_MULTIPLAYER_URL` dans `index.html` correspond à l'URL réelle de `bastion-coop-server` (en `wss://`).

## 2. Mise à jour depuis la 2.5
Ne recrée pas la base. Relance seulement la partie classement de `database/bastion.sql` (le script est idempotent) : la table `leaderboard_scores` s'ajoute sans toucher aux comptes existants.

## 3. Tests
- `https://TON-SITE.onrender.com/api/health` → `{"ok": true, ...}`
- `https://TON-COOP.onrender.com/health` → `{"ok": true, ...}`
- Ouvre le jeu : le compteur « en ligne » doit apparaître (sinon : affiche « hors ligne », le jeu reste jouable).
- Crée un compte, joue une partie, vérifie le score dans le classement.
- Deux fenêtres : crée une salle dans l'une, rejoins-la avec le code dans l'autre.

## 4. Limites connues
- **Plans gratuits** : la base expire après 30 jours et n'a pas de sauvegardes. Les services se mettent en veille.
- **Co-op** : ennemis, dégâts et loot sont simulés séparément sur chaque navigateur. Le serveur autoritaire n'est pas encore fait.
- **Présence** : le compteur est en mémoire d'une seule instance. Le fil d'activité (`recent`) est vide pour l'instant.
- **Classement** : pas de limite de débit ni de contrôle anti-triche des scores : un client peut envoyer n'importe quel score valide.
- **Mise en page** : le bouton « Coop en ligne » est placé sous la barre de compte en haut à droite. À vérifier sur mobile et sur l'écran de lobby.
