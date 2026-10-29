const { db, send, method, body, currentUser } = require('../lib/bastion-api');

const MODE = /^[a-z0-9_-]{1,30}$/i;

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = String(req.query.mode || 'survival');
    if (!MODE.test(mode)) return send(res, 400, { ok: false, message: 'Mode inconnu.' });
    try {
      // Meilleur score par joueur, puis top 20 du mode.
      const result = await db().query(
        `SELECT username, mode, score, wave, squad, created_at FROM (
           SELECT DISTINCT ON (user_id) username, mode, score, wave, squad, created_at
           FROM public.leaderboard_scores WHERE mode = $1
           ORDER BY user_id, score DESC, created_at ASC
         ) best
         ORDER BY score DESC, created_at ASC
         LIMIT 20`,
        [mode]
      );
      return send(res, 200, { ok: true, rows: result.rows });
    } catch (err) {
      console.error('[Bastion leaderboard]', err.message);
      return send(res, 500, { ok: false, message: 'Classement indisponible.' });
    }
  }

  if (!method(req, res, 'POST')) return;
  const user = currentUser(req);
  if (!user) return send(res, 401, { ok: false, message: 'Connecte-toi pour publier ton score.' });

  const data = body(req);
  const mode = String(data.mode || '');
  const score = Math.floor(Number(data.score));
  const wave = Math.floor(Number(data.wave));
  const squad = String(data.squad || '').slice(0, 200);
  if (!MODE.test(mode) || !Number.isFinite(score) || score < 0 || score > 10000000 ||
      !Number.isFinite(wave) || wave < 0 || wave > 999) {
    return send(res, 400, { ok: false, message: 'Score invalide.' });
  }
  try {
    // Le pseudo vient de la base, pas du navigateur.
    await db().query(
      `INSERT INTO public.leaderboard_scores (user_id, username, mode, score, wave, squad)
       SELECT id, username, $2, $3, $4, $5 FROM public.users WHERE id = $1`,
      [user.id, mode, score, wave, squad]
    );
    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('[Bastion leaderboard]', err.message);
    return send(res, 500, { ok: false, message: 'Score non enregistré.' });
  }
};
