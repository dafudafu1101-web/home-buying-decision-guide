const fs = require('fs');
const path = require('path');

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`missing_marker:${label}`);
  return source.replace(from, to);
}

module.exports = function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'stress-test.html');
    let html = fs.readFileSync(filePath, 'utf8');

    html = replaceOnce(
      html,
      '下のボタンでメールアプリを開くと、入力した連絡先と診断結果が本文に入った状態になります。内容をご確認のうえ送信してください。',
      '下のボタンからGmailの作成画面を開きます。会社端末などで標準メールアプリが制限されている場合でも利用できます。内容をご確認のうえ送信してください。',
      'handoff_hint'
    );

    html = replaceOnce(
      html,
      'メールは送信前にご自身で内容を確認できます。入力内容・診断結果は、相談対応のために使用します。',
      'Gmailの作成画面で送信前に内容をご確認いただけます。入力内容・診断結果は、相談対応のために使用します。',
      'privacy_note'
    );

    html = replaceOnce(
      html,
      "$('#handoffGo').textContent=life?'無料相談メールを作成する →':'物件相談メールを作成する →';",
      "$('#handoffGo').textContent=life?'Gmailで無料相談メールを作成する →':'Gmailで物件相談メールを作成する →';",
      'handoff_button_copy'
    );

    html = replaceOnce(
      html,
      "function openMailToSakai(){if(!handoffMode||!validateIntake())return;const subject=mailSubject(handoffMode),body=summaryText(handoffMode);$('#handoffSummary').textContent=body;window.location.href=`mailto:${SAKAI_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}",
      "function openGmailCompose(){if(!handoffMode||!validateIntake())return;const subject=mailSubject(handoffMode),body=summaryText(handoffMode);$('#handoffSummary').textContent=body;const url=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SAKAI_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;window.open(url,'_blank','noopener,noreferrer');$('#copyState').textContent='Gmailの作成画面を開きました。内容をご確認のうえ送信してください。';}",
      'gmail_function'
    );

    html = replaceOnce(
      html,
      "$('#handoffGo').onclick=openMailToSakai;",
      "$('#handoffGo').onclick=openGmailCompose;",
      'gmail_binding'
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(html);
  } catch (error) {
    console.error('stress_test_render_error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('ページの読み込みに失敗しました。');
  }
};
