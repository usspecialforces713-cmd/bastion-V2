const bcrypt = require('bcryptjs');
const { db, send, method, body, setSession, signSession } = require('../lib/bastion-api');

module.exports = async function handler(req, res) {
  if (!method(req, res, 'POST')) return;
  const data = body(req);
  const action = String(data.action || 'login');
  const username = String(data.username || '').trim();
  const password = String(data.password || '');
  if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) {
    return send(res, 422, { ok: false, message: 'Le nom doit contenir 3 à 24 caractères : lettres, chiffres ou _.' });
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return send(res, 422, { ok: false, message: 'Le mot de passe doit contenir au moins 8 caractères et au maximum 72 octets.' });
  }
  try {
    const pool = db();
    let user;
    if (action === 'register') {
      const hash = await bcrypt.hash(password, 12);
      try {
        const result = await pool.query(
          'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
          [username, hash]
        );
        user = result.rows[0];
      } catch (err) {
        if (err.code === '23505') return send(res, 409, { ok: false, message: 'Ce nom d’utilisateur est déjà utilisé.' });
        throw err;
      }
    } else if (action === 'login') {
      const result = await pool.query('SELECT id, username, password_hash FROM users WHERE lower(username) = lower($1) LIMIT 1', [username]);
      const found = result.rows[0];
      if (!found || !(await bcrypt.compare(password, found.password_hash))) {
        return send(res, 401, { ok: false, message: 'Nom d’utilisateur ou mot de passe incorrect.' });
      }
      user = { id: found.id, username: found.username };
      await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    } else {
      return send(res, 400, { ok: false, message: 'Action inconnue.' });
    }
    setSession(res, signSession(user));
    return send(res, 200, { ok: true, user: { id: String(user.id), username: user.username } });
  } catch (err) {
    console.error('[Bastion auth]', err.message);
    return send(res, 500, { ok: false, message: 'Erreur serveur/base de données. Vérifie la variable DATABASE_URL.' });
  }
};
