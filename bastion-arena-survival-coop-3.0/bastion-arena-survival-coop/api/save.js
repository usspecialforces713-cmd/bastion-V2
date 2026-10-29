const { db, send, method, body, requireUser, clampInt } = require('../lib/bastion-api');

module.exports = async function handler(req, res) {
  if (!method(req, res, 'POST')) return;
  const user = requireUser(req, res);
  if (!user) return;
  const data = body(req);
  if (!data.profile || typeof data.profile !== 'object' || Array.isArray(data.profile) || !data.best || typeof data.best !== 'object' || Array.isArray(data.best)) {
    return send(res, 422, { ok: false, message: 'Format de sauvegarde invalide.' });
  }
  const profile = {
    runs: clampInt(data.profile.runs, 0, 100000000, 0),
    kills: clampInt(data.profile.kills, 0, 1000000000, 0),
    highestLevel: clampInt(data.profile.highestLevel, 1, 100000, 1)
  };
  let best = {
    wave: clampInt(data.best.wave, 0, 100000, 0),
    score: clampInt(data.best.score, 0, 1000000000, 0)
  };
  let client;
  try {
    client = await db().connect();
    await client.query('BEGIN');
    const oldResult = await client.query('SELECT profile_json, best_json FROM player_saves WHERE user_id = $1 FOR UPDATE', [user.id]);
    const old = oldResult.rows[0];
    if (old) {
      const op = old.profile_json || {};
      const ob = old.best_json || {};
      profile.runs = Math.max(profile.runs, Number(op.runs) || 0);
      profile.kills = Math.max(profile.kills, Number(op.kills) || 0);
      profile.highestLevel = Math.max(profile.highestLevel, Number(op.highestLevel) || 1);
      if ((Number(ob.score) || 0) > best.score) best = { score: Number(ob.score) || 0, wave: Number(ob.wave) || 0 };
    }
    await client.query(
      `INSERT INTO player_saves (user_id, profile_json, best_json)
       VALUES ($1, $2::jsonb, $3::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET
         profile_json = EXCLUDED.profile_json,
         best_json = EXCLUDED.best_json,
         updated_at = CURRENT_TIMESTAMP`,
      [user.id, JSON.stringify(profile), JSON.stringify(best)]
    );
    await client.query('COMMIT');
    return send(res, 200, { ok: true, profile, best, savedAt: new Date().toISOString() });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('[Bastion save]', err.message);
    return send(res, 500, { ok: false, message: 'Impossible de sauvegarder sur le serveur. Vérifie la base de données.' });
  } finally {
    if (client) client.release();
  }
};
