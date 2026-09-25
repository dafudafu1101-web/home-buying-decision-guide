const fs = require('fs');
const path = require('path');

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`missing_marker:${label}`);
  return source.replace(from, to);
}

function buildHtml() {
  const root = process.cwd();
  let html = fs.readFileSync(path.join(root, 'stress-test.html'), 'utf8');
  const bridgeCss = fs.readFileSync(path.join(root, 'lifeplan-bridge.css'), 'utf8');
  const bridgeHtml = fs.readFileSync(path.join(root, 'lifeplan-bridge.html'), 'utf8');

  html = replaceOnce(html, '</style>', bridgeCss + '\n</style>', 'bridge_css');
  html = replaceOnce(html, '<div class="cta">', bridgeHtml + '\n<div class="cta">', 'bridge_markup');

  html = replaceOnce(
    html,
    '<h2 id="ctaTitle">この予算で将来まで無理がないか確認する</h2>',
    '<h2 id="ctaTitle">自分に合った「住宅への余白」を見える化する</h2>',
    'cta_heading'
  );
  html = replaceOnce(
    html,
    '<button class="primary" id="ctaBtn">無料で詳細ライフプランを相談する →</button>',
    '<button class="primary" id="ctaBtn">自分の場合を無料で確認する →</button>',
    'cta_button'
  );
  html = replaceOnce(
    html,
    "const title='この予算で将来まで無理がないか確認する';",
    "const title='自分に合った「住宅への余白」を見える化する';",
    'cta_dynamic_title'
  );

  html = replaceOnce(
    html,
    'function inputs(){return {',
    "let termManuallyEdited=false;\nfunction suggestedTermByAge(age){return Math.min(50,Math.max(1,80-age))}\nfunction syncTermFromAge(){const age=+$('#age').value;if(termManuallyEdited||!(age>=20&&age<=75))return;$('#term').value=suggestedTermByAge(age)}\nfunction inputs(){return {",
    'age_term_helpers'
  );
  html = replaceOnce(
    html,
    'if(n===2){syncChildStage();syncBorrowMethod();liveCalc()}',
    'if(n===2){syncChildStage();syncBorrowMethod();syncTermFromAge();liveCalc()}',
    'age_term_step_sync'
  );
  html = replaceOnce(
    html,
    "$('#children').addEventListener('input',syncChildStage);",
    "$('#age').addEventListener('input',()=>{syncTermFromAge();liveCalc()});$('#term').addEventListener('input',()=>{termManuallyEdited=true});$('#children').addEventListener('input',syncChildStage);",
    'age_term_events'
  );

  const shareCode = [
    "function shareSummary(){",
    "  if(!last)return 'ADCAST｜3分 住宅予算の決め方チェック';",
    "  const v=last.v;",
    "  const zoneName={safe:'月々の返済を抑える配分',balance:'住宅と返済のバランスを取る配分',housing:'住宅条件を優先する配分',over:'比較ラインより上'}[last.zone]||'住宅予算チェック';",
    "  return ['ADCAST｜3分 住宅予算の決め方チェック','現在の検討価格：'+money(v.price),'診断結果：'+zoneName,'家族ごとの住宅・現金・資産運用の配分を比較する簡易診断です。'].join('\\n');",
    "}",
    "function cleanShareUrl(){const u=new URL(window.location.href);u.searchParams.delete('utm_source');u.searchParams.delete('utm_medium');u.searchParams.delete('utm_campaign');return u.toString()}",
    "function shareToLine(){const text=shareSummary()+'\\n'+cleanShareUrl();window.location.href='https://line.me/R/msg/text/?'+encodeURIComponent(text)}",
    "function shareByMail(){const subject='住宅予算チェックの診断結果';const body=shareSummary()+'\\n\\n診断ページ：'+cleanShareUrl();window.location.href='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}",
    "$('#shareLine').onclick=shareToLine;$('#shareMail').onclick=shareByMail;",
    "$('#again').onclick=()=>{selectedChoice=null;show(1)};"
  ].join('\n');
  html = replaceOnce(
    html,
    "$('#again').onclick=()=>{selectedChoice=null;show(1)};",
    shareCode,
    'share_bindings'
  );

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
    'function openHandoff(mode){handoffMode=mode;',
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
