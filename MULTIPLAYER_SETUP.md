# Bastion Arena Survival — Co-op 2 joueurs (intégration initiale)

## Inclus
- Interface de création/rejoint de salle par code à 6 caractères.
- Serveur WebSocket Node.js avec limite stricte de 2 joueurs par salle.
- Synchronisation de position, rotation, pseudo, vie indicative et événements de vague.
- Avatar distant procédural dans la scène Three.js.
- Le mode solo, les commandes existantes, les arènes et le déclenchement de boss toutes les 5 vagues sont conservés.

## Démarrer le serveur en local
Prérequis : Node.js 20+.

```bash
cd multiplayer-server
npm install
npm start
```

Le serveur écoute sur `ws://localhost:8787`; `/health` vérifie qu'il répond. Ouvre ensuite le jeu depuis un serveur HTTP (pas `file://`) et clique sur **Coop en ligne**. Pour tester à deux sur le même PC, ouvre deux fenêtres; pour tester sur deux appareils du même réseau, utilise l'adresse IP locale du PC serveur.

## Déployer sur Render
1. Ajoute un **nouveau Web Service** dans Render lié au dépôt Git.
2. Root Directory : `multiplayer-server`.
3. Build Command : `npm install`. Start Command : `npm start`.
4. Déploie puis teste `https://TON-SERVICE.onrender.com/health`.
5. Dans `multiplayer.js`, remplace `ws://localhost:8787` par l'URL WebSocket sécurisée du service : `wss://TON-SERVICE.onrender.com`. Tu peux aussi définir `window.BASTION_MULTIPLAYER_URL` avant `multiplayer.js`.

## Limite importante de cette première version
C'est une **couche réseau initiale**, pas encore une simulation coopérative complète faisant autorité côté serveur. Elle synchronise la présence et les déplacements des joueurs ainsi que des événements de vague, mais les ennemis, dégâts, XP, loot, morts et combats de boss sont encore simulés séparément sur chaque navigateur. Ne présente pas cette version comme du co-op compétitif/anti-triche et ne l'ouvre pas au public sans compléter la synchronisation du combat. Étape suivante nécessaire : faire autorité au serveur sur les vagues, les ennemis, les dégâts et la fin de run, puis interpoler les états côté client.

## Sécurité et exploitation
- N'ajoute jamais de mots de passe, JWT ou identifiants de base de données au serveur WebSocket.
- Le serveur actuel ne requiert pas de compte et ne stocke pas de données personnelles.
- Configure une liste d'origines autorisées avant un lancement public et ajoute heartbeat/limites de fréquence et de connexions.
