const TARGET_EMAIL = 'd.sakai@ad-cast.co.jp';

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(payload));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' });

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

  const params = new URLSearchParams();
  params.set('_subject', subject);
  params.set('_template', 'table');
  params.set('_captcha', 'false');
  params.set('_replyto', email);
  params.set('お名前', name);
  params.set('メールアドレス', email);
  if (phone) params.set('電話番号', phone);
  params.set('相談種別', mode === 'lifeplan' ? '詳細ライフプラン相談' : '物件・エリア相談');
  params.set('診断結果・相談内容', summary);

  try {
    const upstream = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TARGET_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    let payload = null;
    try { payload = await upstream.json(); } catch (_) {}

    if (!upstream.ok || (payload && payload.success === 'false')) {
      console.error('formsubmit_failed', upstream.status, payload);
      return json(res, 502, { ok: false, error: 'delivery_failed' });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('consultation_submit_error', error);
    return json(res, 502, { ok: false, error: 'delivery_failed' });
  }
};
