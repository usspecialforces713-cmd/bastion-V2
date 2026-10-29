const { db, send, method, requireUser } = require('../lib/bastion-api');

module.exports = async function handler(req, res) {
  if (!method(req, res, 'GET')) return;
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const result = await db().query(
      'SELECT profile_json, best_json, updated_at FROM player_saves WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    const row = result.rows[0];
    if (!row) return send(res, 200, { ok: true, save: null });
    return send(res, 200, {
      ok: true,
      save: {
        profile: row.profile_json || { runs: 0, kills: 0, highestLevel: 1 },
        best: row.best_json || { wave: 0, score: 0 },
        updatedAt: row.updated_at
      }
    });
  } catch (err) {
    console.error('[Bastion load]', err.message);
    return send(res, 500, { ok: false, message: 'Impossible de charger la sauvegarde. Vérifie la base de données.' });
  }
};
