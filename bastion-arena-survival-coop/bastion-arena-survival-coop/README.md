# Bastion Arena Survival 2.5 — Jeu, comptes et co-op 2 joueurs

Tout tourne sur Render : site + API (Web Service), serveur co-op (Web Service séparé) et base PostgreSQL (`bastion-db`).

## Structure
- `index.html`, `styles.css`, `game-*.js`, `*.glb` : jeu (client)
- `account.js`, `api/*.js`, `lib/` : comptes et sauvegardes (Node/Express)
- `server.js` : serveur Express qui sert le jeu et l'API
- `multiplayer.js`, `multiplayer-server/` : co-op 2 joueurs (serveur WebSocket séparé)
- `database/bastion.sql` : schéma de la base
- `render.yaml` : Blueprint Render (base + 2 services)

## 1. Déploiement
1. Pousse ce dossier dans ton dépôt GitHub.
2. Sur Render : **New → Blueprint**, choisis le dépôt. Render crée `bastion-db`, `bastion-arena` et `bastion-coop-server`.
3. Attends que `bastion-db` soit prête, puis crée le schéma (une seule fois) : ouvre `bastion-db` → **Connect** → copie la commande **PSQL Command**, et lance-la depuis un terminal avec `-f database/bastion.sql` à la fin, par exemple :
   ```
   psql "<PSQL Command>" -f database/bastion.sql
   ```
   Si `psql` n'est pas installé, colle le contenu de `database/bastion.sql` dans le shell de la base, si Render le propose.
4. Quand `bastion-coop-server` est déployé, copie son URL et vérifie `window.BASTION_MULTIPLAYER_URL` dans `index.html` (`wss://…onrender.com`).

`DATABASE_URL` et `JWT_SECRET` sont fournis automatiquement par le Blueprint. Ne les mets pas dans le code.

## 2. Tests
- `https://TON-SITE.onrender.com/api/health` → `{"ok": true, ...}`
- `https://TON-COOP.onrender.com/health` → `{"ok": true, ...}`
- Crée un compte dans le jeu, puis vérifie la sauvegarde.
- Deux fenêtres : crée une salle dans l'une, rejoins-la avec le code dans l'autre.

## 3. Limites à connaître
- **Plans gratuits** : la base expire après 30 jours et n'a pas de sauvegardes. Les services se mettent en veille après une période sans trafic. Pour un vrai lancement, passe la base et le serveur co-op en plan payant.
- **Co-op** : les ennemis, dégâts et loot sont encore simulés séparément sur chaque navigateur. Le mode serveur autoritaire est prévu mais pas encore fait.

## 4. Local (optionnel)
Copie `.env.example` en `.env`, lance `npm install`, puis `npm start`. Le site est sur `http://localhost:3000`.
