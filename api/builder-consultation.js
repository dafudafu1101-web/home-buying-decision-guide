const crypto = require('crypto');

const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwkOAbxi5o7m8CQfRFim_qCTS6UTSJHAi23mspmtYWHzLK-xpjZJhMn8p-okILukdkdWA/exec';
const ALLOWED_ORIGINS = new Set([
  'https://jian-zhu-hui-she-bi-jiao-yi-lan.webflow.io'
]);
const MAX_BODY_BYTES = 20_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 8;
const rateBuckets = globalThis.__builderConsultationRateBuckets || new Map();
globalThis.__builderConsultationRateBuckets = rateBuckets;

function setCors(req, res) {
  const origin = String(req.headers.origin || '');
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return true;
  }
  return false;
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function rateLimited(req) {
  const now = Date.now();
  const ip = clientIp(req);
  const current = rateBuckets.get(ip);
  if (!current || now - current.startedAt > RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  if (rateBuckets.size > 500) {
    for (const [key, value] of rateBuckets) {
      if (now - value.startedAt > RATE_WINDOW_MS) rateBuckets.delete(key);
    }
  }
  return current.count > RATE_MAX_REQUESTS;
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return null; }
  }
  return null;
}

module.exports = async function handler(req, res) {
  const corsOk = setCors(req, res);
  if (req.method === 'OPTIONS') {
    if (!corsOk) return json(res, 403, { ok: false, error: 'origin_not_allowed' });
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' });
  if (!corsOk) return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return json(res, 415, { ok: false, error: 'unsupported_media_type' });
  }
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) return json(res, 413, { ok: false, error: 'payload_too_large' });
  if (rateLimited(req)) return json(res, 429, { ok: false, error: 'rate_limited' });

  const body = parseBody(req);
  if (!body) return json(res, 400, { ok: false, error: 'invalid_json' });

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 240);
  const summary = String(body.summary || '').trim().slice(0, 12000);
  const website = String(body.website || '').trim().slice(0, 200);

  // Honeypot: silently accept bots without sending mail.
  if (website) return json(res, 200, { ok: true });
  if (!name || !validEmail(email) || !summary) {
    return json(res, 400, { ok: false, error: 'invalid_input' });
  }

  const normalized = JSON.stringify({ name, email, summary });
  const requestId = crypto.createHash('sha256').update(normalized).digest('hex');

  try {
    const upstream = await fetch(process.env.APPS_SCRIPT_WEB_APP_URL || APPS_SCRIPT_WEB_APP_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        mode: 'property',
        name,
        email,
        phone: '',
        summary,
        requestId
      })
    });

    const text = await upstream.text();
    let payload = {};
    try { payload = JSON.parse(text); } catch (_) {}

    if (!upstream.ok || payload.ok !== true) {
      console.error('builder_consultation_delivery_failed', upstream.status, text.slice(0, 500));
      return json(res, 502, { ok: false, error: 'delivery_failed' });
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('builder_consultation_submit_error', error);
    return json(res, 502, { ok: false, error: 'delivery_failed' });
  }
};
