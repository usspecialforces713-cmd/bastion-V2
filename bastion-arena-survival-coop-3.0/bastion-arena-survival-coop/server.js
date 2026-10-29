const path = require('path');
const express = require('express');

const app = express();
const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1); // Render passe par un proxy HTTPS
app.use(express.json({ limit: '100kb' }));

// Routes API (comptes, sauvegarde, présence, classement)
const routes = {
  '/api/health': require('./api/health'),
  '/api/auth': require('./api/auth'),
  '/api/me': require('./api/me'),
  '/api/save': require('./api/save'),
  '/api/load': require('./api/load'),
  '/api/presence': require('./api/presence'),
  '/api/leaderboard': require('./api/leaderboard')
};
for (const [route, handler] of Object.entries(routes)) {
  app.all(route, async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[API]', route, err.message);
      if (!res.headersSent) res.status(500).json({ ok: false, message: 'Erreur serveur.' });
    }
  });
}

// Fichiers publics en liste blanche : pas de code serveur, pas de config, pas de .env
const PUBLIC_FILE = /^\/(index\.html|styles\.css|account\.js|ui\.js|i18n\.js|multiplayer\.js|game-(core|combat|boss|systems)\.js|bastion-arena-logo\.svg|[a-z_]+\.glb)$/;
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get(PUBLIC_FILE, (req, res) => {
  res.sendFile(req.path.slice(1), { root: ROOT }, (err) => {
    if (err && !res.headersSent) res.sendStatus(404);
  });
});

app.use((req, res) => res.status(404).send('Not found'));

app.listen(PORT, '0.0.0.0', () => console.log(`Bastion Arena lancé sur le port ${PORT}`));
