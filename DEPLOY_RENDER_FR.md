# Bastion Arena Survival — déploiement Render (Docker/PHP + Node/WebSocket)

## Architecture
- `bastion-web` : Docker + Apache/PHP, sert le jeu et les API PHP.
- `bastion-coop-server` : Node.js + WebSocket pour les salles coop.
- PostgreSQL : utilise ta base Render existante, sans la supprimer.

## Avant de déployer
1. Fais un commit ou une copie du dépôt actuel. Ne supprime pas la base PostgreSQL.
2. Copie le contenu de ce dossier à la racine du dépôt GitHub prévu pour Bastion (ou adapte `rootDir`/`dockerfilePath` dans `render.yaml` si tu le places dans un sous-dossier).
3. Dans `index.html`, remplace `wss://bastion-coop-server.onrender.com` par l'URL réelle du nouveau service coop si le nom généré par Render diffère.
4. Vérifie que le fichier `render.yaml` est à la racine du dépôt et utilise **New + > Blueprint** sur Render pour créer les deux services. Si tu préfères ne pas utiliser Blueprint, crée les services séparément avec les réglages ci-dessous.

## Service Web (Docker + PHP)
- Runtime : Docker
- Dockerfile : `./Dockerfile`
- Health check : `/health.php`
- Variables d'environnement : `DATABASE_URL` = **Internal Database URL** de ta base PostgreSQL Render (si service et DB sont dans la même région). Ne mets jamais l'URL privée dans GitHub.
- Extensions PHP incluses : `pdo`, `pdo_pgsql`.

## Service Coop (Node.js)
- Runtime : Node
- Root Directory : `multiplayer-server`
- Build command : `npm install`
- Start command : `npm start`
- Health check : `/health`
- Variable facultative `ALLOWED_ORIGINS` : URL(s) du site, séparées par des virgules, ex. `https://bastion-clean.onrender.com`. Si elle est définie, seules ces origines seront acceptées quand le navigateur en envoie une.

## PostgreSQL — initialisation
Dans le SQL Editor de ta base Render, exécute une seule fois le contenu de `database/bastion.sql`. Les tables sont `users` et `player_saves`. Si ces tables existent déjà, le script utilise `CREATE TABLE IF NOT EXISTS`.

## Limite fonctionnelle importante
Cette version met en place le déploiement en deux services, les salles à deux joueurs et la synchronisation de position/événements simples. **Elle ne synchronise pas encore autoritairement le combat complet** : santé/dégâts des ennemis, apparitions, XP, mort/réanimation et état du boss ne sont pas partagés comme une simulation serveur. Ne présente pas le coop comme complet avant d'avoir ajouté/testé cette logique et réalisé un test à deux navigateurs.

## Vérification
- Ouvre `https://<service-web>.onrender.com/health.php` : doit renvoyer `{"ok":true,"service":"bastion-web"}`.
- Ouvre `https://<service-coop>.onrender.com/health` : doit renvoyer un JSON avec `ok: true`.
- Sur le jeu, ouvre **Coop en ligne**, crée une salle et rejoins-la dans un autre navigateur avec le code. Le statut doit afficher 2/2.
- Les services gratuits Render peuvent se mettre en veille et la première connexion peut être lente selon le plan.

## Retour arrière
Garde l'ancien commit GitHub. Si le nouveau déploiement échoue, restaure le commit précédent plutôt que de supprimer la base de données.
