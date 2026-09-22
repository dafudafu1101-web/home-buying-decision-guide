const fs = require('fs');
const path = require('path');

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`missing_marker:${label}`);
  return source.replace(from, to);
}

function buildHtml() {
  const filePath = path.join(process.cwd(), 'stress-test.html');
  let html = fs.readFileSync(filePath, 'utf8');

  html = replaceOnce(
    html,
    '下のボタンでメールアプリを開くと、入力した連絡先と診断結果が本文に入った状態になります。内容をご確認のうえ送信してください。',
    '下のボタンからブラウザ上でそのまま相談内容を送信できます。メールアプリやGmailは必要ありません。',
    'handoff_hint'
  );

  html = replaceOnce(
    html,
    'メールは送信前にご自身で内容を確認できます。入力内容・診断結果は、相談対応のために使用します。',
    '入力内容・診断結果は相談対応のために使用します。送信完了後、後日担当者よりメールでご連絡します。',
    'privacy_note'
  );

  html = replaceOnce(
    html,
    "$('#handoffGo').textContent=life?'無料相談メールを作成する →':'物件相談メールを作成する →';",
    "$('#handoffGo').textContent=life?'無料相談を送信する →':'物件相談を送信する →';",
    'handoff_button_copy'
  );

  html = replaceOnce(
    html,
    "function openMailToSakai(){if(!handoffMode||!validateIntake())return;const subject=mailSubject(handoffMode),body=summaryText(handoffMode);$('#handoffSummary').textContent=body;window.location.href=`mailto:${SAKAI_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}",
    "async function submitConsultation(){if(!handoffMode||!validateIntake())return;const c=contactValues(),body=summaryText(handoffMode),btn=$('#handoffGo');$('#handoffSummary').textContent=body;$('#copyState').textContent='送信中です…';btn.disabled=true;try{const r=await fetch('/api/consultation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:handoffMode,name:c.name,email:c.email,phone:c.phone,summary:body})});const data=await r.json().catch(()=>({}));if(!r.ok||!data.ok)throw new Error(data.error||'submit_failed');$('#copyState').textContent='送信しました。後日担当者よりメールでご連絡します。';btn.textContent='送信済み';btn.disabled=true;}catch(e){console.error(e);$('#copyState').textContent=e.message==='service_not_configured'?'現在、相談受付の送信設定を確認中です。恐れ入りますが、相談内容をコピーして担当者へお送りください。':'送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。';btn.disabled=false;}}",
    'submit_function'
  );

  html = replaceOnce(
    html,
    "$('#handoffGo').onclick=openMailToSakai;",
    "$('#handoffGo').onclick=submitConsultation;",
    'submit_binding'
  );

  return html.replace(
    "function openHandoff(mode){handoffMode=mode;",
    "function openHandoff(mode){handoffMode=mode;$('#handoffGo').disabled=false;"
  );
}

let renderedHtml;
try {
  renderedHtml = buildHtml();
} catch (error) {
  console.error('stress_test_build_error', error);
}

module.exports = function handler(req, res) {
  if (!renderedHtml) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('ページの読み込みに失敗しました。');
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.end(renderedHtml);
};
