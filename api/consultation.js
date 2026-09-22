const crypto = require('crypto');

const TARGET_EMAIL = 'd.sakai@ad-cast.co.jp';
const MAX_BODY_BYTES = 20_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 8;
const rateBuckets = globalThis.__consultationRateBuckets || new Map();
globalThis.__consultationRateBuckets = rateBuckets;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch (_) {
    return false;
  }
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
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' });
  if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  if (String(req.headers['sec-fetch-site'] || 'same-origin') === 'cross-site') {
    return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  }
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return json(res, 415, { ok: false, error: 'unsupported_media_type' });
  }
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) return json(res, 413, { ok: false, error: 'payload_too_large' });
  if (rateLimited(req)) return json(res, 429, { ok: false, error: 'rate_limited' });

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.error('consultation_service_not_configured');
    return json(res, 503, { ok: false, error: 'service_not_configured' });
  }

  const body = parseBody(req);
  if (!body) return json(res, 400, { ok: false, error: 'invalid_json' });

  const mode = body.mode === 'lifeplan' ? 'lifeplan' : body.mode === 'property' ? 'property' : '';
  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 240);
  const phone = String(body.phone || '').trim().slice(0, 80);
  const summary = String(body.summary || '').trim().slice(0, 12000);

  if (!mode || !name || !validEmail(email) || !summary) {
    return json(res, 400, { ok: false, error: 'invalid_input' });
  }

  const subject = mode === 'lifeplan'
    ? '【住宅予算チェック】無料・詳細ライフプラン相談希望'
    : '【住宅予算チェック】物件相談希望';

  const normalized = JSON.stringify({ mode, name, email, phone, summary });
  const digest = crypto.createHash('sha256').update(normalized).digest('hex');
  const idempotencyKey = `housing-consultation/${digest}`;

  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [TARGET_EMAIL],
        reply_to: email,
        subject,
        text: summary
      })
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('resend_delivery_failed', upstream.status, payload);
      return json(res, 502, { ok: false, error: 'delivery_failed' });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('consultation_submit_error', error);
    return json(res, 502, { ok: false, error: 'delivery_failed' });
  }
};
