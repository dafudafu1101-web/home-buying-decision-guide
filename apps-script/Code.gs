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
    const kind = body.kind === 'result_email' ? 'result_email' : body.kind === 'click' ? 'click' : 'consultation';

    if (kind === 'result_email') {
      const email = String(body.email || '').trim().slice(0, 240);
      const customerBody = String(body.customerBody || '').trim().slice(0, MAX_SUMMARY_LENGTH);
      const ownerBody = String(body.ownerBody || '').trim().slice(0, MAX_SUMMARY_LENGTH);
      const requestId = String(body.requestId || '').trim().slice(0, 128);
      if (!validEmail(email) || !customerBody || !ownerBody || !requestId) {
        return jsonResponse({ ok: false, error: 'invalid_input' });
      }

      const lock = LockService.getScriptLock();
      lock.waitLock(5000);
      try {
        const cache = CacheService.getScriptCache();
        const cacheKey = 'result_email_' + requestId;
        if (cache.get(cacheKey)) return jsonResponse({ ok: true, duplicate: true });

        MailApp.sendEmail({
          to: email,
          subject: '【ADCAST】住宅予算チェックの診断結果',
          body: customerBody,
          name: 'ADCAST 住宅予算チェック'
        });
        MailApp.sendEmail({
          to: TARGET_EMAIL,
          subject: '【住宅予算チェック｜結果送信通知】' + email,
          body: ownerBody,
          replyTo: email,
          name: '住宅予算チェック'
        });

        cache.put(cacheKey, 'sent', DEDUPE_TTL_SECONDS);
        return jsonResponse({ ok: true });
      } finally {
        lock.releaseLock();
      }
    }

    if (kind === 'click') {
      const source = String(body.source || '').trim().slice(0, 80);
      const age = Number(body.age) || 0;
      const children = Number(body.children) || 0;
      const childStage = String(body.childStage || '').trim().slice(0, 80);
      const borrowMethod = String(body.borrowMethod || '').trim().slice(0, 120);
      const grossIncome = Number(body.grossIncome) || 0;
      const cash = Number(body.cash) || 0;
      const investments = Number(body.investments) || 0;
      const price = Number(body.price) || 0;
      const loanAmount = Number(body.loanAmount) || 0;
      const living = Number(body.living) || 0;
      const rate = Number(body.rate) || 0;
      const term = Number(body.term) || 0;
      const netOverride = Number(body.netOverride) || 0;
      const rateType = String(body.rateType || '').trim().slice(0, 80);
      const zone = String(body.zone || '').trim().slice(0, 120);
      const margin = String(body.margin || '').trim().slice(0, 160);
      const ref = String(body.ref || '').trim().slice(0, 160);
      const requestId = String(body.requestId || '').trim().slice(0, 128);
      if (!mode || !source || !requestId) return jsonResponse({ ok: false, error: 'invalid_input' });

      const lock = LockService.getScriptLock();
      lock.waitLock(5000);
      try {
        const cache = CacheService.getScriptCache();
        const cacheKey = 'cta_click_' + requestId;
        if (cache.get(cacheKey)) return jsonResponse({ ok: true, duplicate: true });

        const label = mode === 'lifeplan' ? '詳細ライフプラン相談' : mode === 'loan' ? 'ローン相談' : '物件・予算相談';
        const subject = '【住宅予算ツール｜クリック通知】' + label;
        const lines = [
          '【クリック通知｜まだ相談申込みは完了していません】',
          '',
          'クリック：' + label,
          '場所：' + source,
          '',
          '【入力された基本項目】',
          age ? '主な借入予定者の年齢：' + age + '歳' : '主な借入予定者の年齢：未入力',
          'お子さまの人数：' + children + '人',
          childStage ? 'お子さまの年齢帯：' + childStage : 'お子さまの年齢帯：未入力',
          borrowMethod ? '借入方法：' + borrowMethod : '借入方法：未入力',
          grossIncome ? '世帯年収：' + Math.round(grossIncome).toLocaleString('ja-JP') + '万円' : '世帯年収：未入力',
          cash ? '現金・預金：' + Math.round(cash).toLocaleString('ja-JP') + '万円' : '現金・預金：未入力',
          investments ? '投資資産：' + Math.round(investments).toLocaleString('ja-JP') + '万円' : '投資資産：未入力',
          price ? '現在検討している物件価格：' + Math.round(price).toLocaleString('ja-JP') + '万円' : '現在検討している物件価格：未入力',
          loanAmount ? '借入予定額：' + Math.round(loanAmount).toLocaleString('ja-JP') + '万円' : '借入予定額：未入力',
          living ? '住宅費を除く月間生活費：' + living.toLocaleString('ja-JP') + '万円' : '住宅費を除く月間生活費：未入力',
          rate ? '現在金利：' + rate + '%' : '現在金利：未入力',
          term ? '返済期間：' + term + '年' : '返済期間：未入力',
          netOverride ? '実際の年間手取り：' + Math.round(netOverride).toLocaleString('ja-JP') + '万円' : '実際の年間手取り：自動推計',
          rateType ? '金利タイプ：' + rateType : '金利タイプ：未入力',
          '',
          '【診断結果】',
          zone ? '診断ゾーン：' + zone : '',
          margin ? '比較ライン：' + margin : '',
          ref ? '受付ID：' + ref : '',
          '',
          '※CTAが開かれた段階の通知です。正式な相談申込みとは分けて確認してください。'
        ].filter(function(line){ return line !== ''; });
        MailApp.sendEmail({
          to: TARGET_EMAIL,
          subject: subject,
          body: lines.join('\n'),
          name: '住宅予算チェック'
        });
        cache.put(cacheKey, 'sent', DEDUPE_TTL_SECONDS);
        return jsonResponse({ ok: true });
      } finally {
        lock.releaseLock();
      }
    }

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
