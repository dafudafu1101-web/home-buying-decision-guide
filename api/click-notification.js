const crypto = require('crypto');

const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwkOAbxi5o7m8CQfRFim_qCTS6UTSJHAi23mspmtYWHzLK-xpjZJhMn8p-okILukdkdWA/exec';
const MAX_BODY_BYTES = 8_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 12;
const rateBuckets = globalThis.__clickNotifyRateBuckets || new Map();
globalThis.__clickNotifyRateBuckets = rateBuckets;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch (_) { return false; }
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
  return current.count > RATE_MAX_REQUESTS;
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return null; }
  }
  return null;
}

function validAppsScriptUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'script.google.com' && /\/macros\/s\/[^/]+\/exec$/.test(url.pathname);
  } catch (_) { return false; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' });
  if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  if (String(req.headers['sec-fetch-site'] || 'same-origin') === 'cross-site') return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) return json(res, 415, { ok: false, error: 'unsupported_media_type' });
  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) return json(res, 413, { ok: false, error: 'payload_too_large' });
  if (rateLimited(req)) return json(res, 429, { ok: false, error: 'rate_limited' });

  const body = parseBody(req);
  if (!body) return json(res, 400, { ok: false, error: 'invalid_json' });

  const mode = ['loan','lifeplan','property'].includes(body.mode) ? body.mode : '';
  const source = String(body.source || '').trim().slice(0, 80);
  const price = Math.max(0, Math.min(100000, Number(body.price) || 0));
  const loanAmount = Math.max(0, Math.min(100000, Number(body.loanAmount) || 0));
  const zone = String(body.zone || '').trim().slice(0, 120);
  const margin = String(body.margin || '').trim().slice(0, 160);
  const ref = String(body.ref || '').trim().slice(0, 160);
  const eventId = String(body.eventId || '').trim().slice(0, 128);
  if (!mode || !source || !eventId) return json(res, 400, { ok: false, error: 'invalid_input' });

  const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL || APPS_SCRIPT_WEB_APP_URL;
  if (!validAppsScriptUrl(appsScriptUrl)) return json(res, 503, { ok: false, error: 'service_not_configured' });

  const requestId = crypto.createHash('sha256').update('click|'+eventId+'|'+mode).digest('hex');
  try {
    const upstream = await fetch(appsScriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        kind: 'click',
        mode,
        source,
        price,
        loanAmount,
        zone,
        margin,
        ref,
        requestId
      })
    });
    const text = await upstream.text();
    let payload = {};
    try { payload = JSON.parse(text); } catch (_) {}
    if (!upstream.ok || payload.ok !== true) {
      console.error('click_notification_delivery_failed', upstream.status, text.slice(0, 300));
      return json(res, 502, { ok: false, error: 'delivery_failed' });
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('click_notification_error', error);
    return json(res, 502, { ok: false, error: 'delivery_failed' });
  }
};
