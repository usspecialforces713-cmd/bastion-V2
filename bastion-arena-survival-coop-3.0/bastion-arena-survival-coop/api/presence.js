const { send, method, body } = require('../lib/bastion-api');

// Présence en mémoire : un joueur est « en ligne » si son dernier battement date de moins de 60 s.
// Suffisant pour un seul serveur Render. Plusieurs instances verraient des compteurs différents.
const seen = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_ENTRIES = 20000;

function prune(now) {
  for (const [id, t] of seen) if (now - t > WINDOW_MS) seen.delete(id);
}

module.exports = async function handler(req, res) {
  if (!method(req, res, 'POST')) return;
  const id = String(body(req).id || '').slice(0, 64);
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) return send(res, 400, { ok: false, message: 'Identifiant invalide.' });
  const now = Date.now();
  prune(now);
  if (seen.size >= MAX_ENTRIES && !seen.has(id)) return send(res, 503, { ok: false, message: 'Trop de connexions.' });
  seen.set(id, now);
  return send(res, 200, { ok: true, online: seen.size, recent: [] });
};
