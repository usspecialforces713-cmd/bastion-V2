const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

function dbConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
    };
  }
  if (!process.env.DB_HOST) throw new Error('Configuration base manquante : DB_HOST');
  const sslmode = String(process.env.DB_SSLMODE || 'disable').toLowerCase();
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'bastion',
    ssl: sslmode === 'disable' ? false : { rejectUnauthorized: false }
  };
}

let pool;
function db() {
  if (!pool) {
    pool = new Pool({
      ...dbConfig(),
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000
    });
  }
  return pool;
}
function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}
function method(req, res, expected) {
  if (req.method !== expected) {
    res.setHeader('Allow', expected);
    send(res, 405, { ok: false, message: 'Méthode non autorisée.' });
    return false;
  }
  return true;
}
function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  return {};
}
function cookieMap(req) {
  const result = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) result[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return result;
}
function setSession(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `bastion_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
}
function clearSession(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `bastion_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}
function signSession(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return jwt.sign({ username: user.username }, process.env.JWT_SECRET, { subject: String(user.id), expiresIn: '7d', issuer: 'bastion-arena' });
}
function currentUser(req) {
  const token = cookieMap(req).bastion_session;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'bastion-arena' });
    if (!payload.sub || !payload.username) return null;
    return { id: String(payload.sub), username: String(payload.username) };
  } catch (_) { return null; }
}
function requireUser(req, res) {
  const user = currentUser(req);
  if (!user) send(res, 401, { ok: false, message: 'Connecte-toi pour synchroniser la sauvegarde.' });
  return user;
}
function clampInt(value, min, max, fallback = min) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}
module.exports = { db, send, method, body, setSession, clearSession, signSession, currentUser, requireUser, clampInt };
