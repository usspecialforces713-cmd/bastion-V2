const { db, send, method, body, clearSession, currentUser } = require('../lib/bastion-api');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const user = currentUser(req);
    if (!user) return send(res, 200, { ok: true, user: null });
    try {
      const result = await db().query('SELECT id, username FROM users WHERE id = $1 LIMIT 1', [user.id]);
      if (!result.rows[0]) {
        clearSession(res);
        return send(res, 200, { ok: true, user: null });
      }
      return send(res, 200, { ok: true, user: { id: String(result.rows[0].id), username: result.rows[0].username } });
    } catch (err) {
      console.error('[Bastion me]', err.message);
      return send(res, 500, { ok: false, message: 'Impossible de vérifier la session. Vérifie la base de données.' });
    }
  }
  if (!method(req, res, 'POST')) return;
  if (body(req).action !== 'logout') return send(res, 400, { ok: false, message: 'Action inconnue.' });
  clearSession(res);
  return send(res, 200, { ok: true });
};
