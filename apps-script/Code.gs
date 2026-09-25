const TARGET_EMAIL = 'd.sakai@ad-cast.co.jp';
const MAX_SUMMARY_LENGTH = 12000;
const DEDUPE_TTL_SECONDS = 21600;

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (!raw || raw.length > 20000) return jsonResponse({ ok: false, error: 'invalid_request' });

    let body;
    try {
      body = JSON.parse(raw);
    } catch (_) {
      return jsonResponse({ ok: false, error: 'invalid_json' });
    }

    const mode = body.mode === 'lifeplan' ? 'lifeplan' : body.mode === 'property' ? 'property' : body.mode === 'loan' ? 'loan' : '';
    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 240);
    const phone = String(body.phone || '').trim().slice(0, 80);
    const summary = String(body.summary || '').trim().slice(0, MAX_SUMMARY_LENGTH);
    const requestId = String(body.requestId || '').trim().slice(0, 128);

    if (!mode || !name || !validEmail(email) || !summary || !requestId) {
      return jsonResponse({ ok: false, error: 'invalid_input' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      const cache = CacheService.getScriptCache();
      const cacheKey = 'consultation_' + requestId;
      if (cache.get(cacheKey)) return jsonResponse({ ok: true, duplicate: true });

      const subject = mode === 'lifeplan'
        ? '【住宅予算チェック】無料・詳細ライフプラン相談希望'
        : mode === 'loan'
          ? '【住宅予算チェック】ローン専門スタッフ無料相談希望'
          : '【住宅予算チェック】物件相談希望';

      MailApp.sendEmail({
        to: TARGET_EMAIL,
        subject: subject,
        body: summary,
        replyTo: email,
        name: '住宅予算チェック'
      });

      cache.put(cacheKey, 'sent', DEDUPE_TTL_SECONDS);
      return jsonResponse({ ok: true });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: 'delivery_failed' });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'housing-consultation' });
}
