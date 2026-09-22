const crypto = require('crypto');

const TARGET_EMAIL = 'd.sakai@ad-cast.co.jp';

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
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch (_) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' });
  if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return json(res, 415, { ok: false, error: 'unsupported_media_type' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.error('consultation_service_not_configured');
    return json(res, 503, { ok: false, error: 'service_not_configured' });
  }

  const body = req.body || {};
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

    return json(res, 200, { ok: true, messageId: payload.id || null });
  } catch (error) {
    console.error('consultation_submit_error', error);
    return json(res, 502, { ok: false, error: 'delivery_failed' });
  }
};
