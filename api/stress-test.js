const fs = require('fs');
const path = require('path');

const missingMarkers = [];
function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) {
    missingMarkers.push(label);
    console.warn('stress_test_missing_marker', label);
    return source;
  }
  return source.replace(from, to);
}

function buildHtml() {
  const root = process.cwd();
  let html = fs.readFileSync(path.join(root, 'stress-test.html'), 'utf8');
  const bridgeCss = fs.readFileSync(path.join(root, 'lifeplan-bridge.css'), 'utf8');
  const bridgeHtml = fs.readFileSync(path.join(root, 'lifeplan-bridge.html'), 'utf8');

  html = replaceOnce(html, '</style>', bridgeCss + '\n</style>', 'bridge_css');
  html = replaceOnce(html, '<div class="cta">', bridgeHtml + '\n<div class="cta">', 'bridge_markup');

  const loanAmountOrderPattern = /(\s*<div class="loanHelpCard">[\s\S]*?<p class="loanHelpFoot">[\s\S]*?<\/p>\s*<\/div>)\s*(<div class="helperBtns">[\s\S]*?<\/div>\s*<div class="hint" id="loanRefHint">[\s\S]*?<\/div>)/;
  if (loanAmountOrderPattern.test(html)) {
    html = html.replace(loanAmountOrderPattern, '\n        $2\n        $1');
  } else {
    missingMarkers.push('loan_amount_controls_order');
    console.warn('stress_test_missing_marker', 'loan_amount_controls_order');
  }

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
    "function maxLongTermByAge(age){return Math.max(35,Math.min(50,80-age))}\nfunction updateTermAgeNote(message){const note=$('#termAgeNote');if(!note)return;const age=+$('#age').value,term=+$('#term').value||35;if(message){note.textContent=message;return}if(!(age>=20&&age<=75)){note.textContent='35年を基準に試算します。35年超は年齢・金融機関・商品条件を確認して調整します。';return}const max=maxLongTermByAge(age);note.textContent=term>35?'現在'+age+'歳の場合、この簡易診断では完済80歳を目安に最長'+max+'年として試算します。':'35年を基準に試算中です。35年超を選ぶ場合、現在'+age+'歳では最長'+max+'年を目安に調整します。'}\nfunction normalizeTermForAge(){const age=+$('#age').value,el=$('#term');if(!el)return;let term=+el.value||35;term=Math.max(1,Math.min(50,Math.round(term)));if(term>35&&age>=20&&age<=75){const max=maxLongTermByAge(age);if(term>max){const requested=term;term=max;el.value=term;updateTermAgeNote('希望'+requested+'年に対し、現在'+age+'歳では完済80歳を目安に'+term+'年へ調整しました。');return}}el.value=term;updateTermAgeNote()}\nfunction inputs(){return {",
    'age_term_helpers'
  );
  html = replaceOnce(
    html,
    'if(n===2){syncChildStage();syncBorrowMethod();liveCalc()}',
    'if(n===2){syncChildStage();syncBorrowMethod();updateTermAgeNote();liveCalc()}',
    'age_term_step_sync'
  );
  html = replaceOnce(
    html,
    "$('#children').addEventListener('input',syncChildStage);",
    "$('#age').addEventListener('input',()=>{if((+$('#term').value||35)>35)normalizeTermForAge();else updateTermAgeNote();liveCalc()});$('#term').addEventListener('change',normalizeTermForAge);$('#children').addEventListener('input',syncChildStage);",
    'age_term_events'
  );

  html = replaceOnce(
    html,
    "if(v.netOverride>v.gross*1.05)arr.push('年間手取りが額面年収を上回っています。入力値をご確認ください。');",
    "if(v.netOverride>v.gross*1.05)arr.push('年間手取りが額面年収を上回っています。入力値をご確認ください。');if(!(v.term>=1&&v.term<=50))arr.push('返済期間は1〜50年の範囲で入力してください。');if(v.term>35&&v.age>=20&&v.age<=75&&v.term>maxLongTermByAge(v.age))arr.push('35年を超える返済期間は、完済80歳を目安にすると現在の年齢では'+maxLongTermByAge(v.age)+'年までです。');",
    'term_validation'
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
    "$('#handoffGo').textContent=life?'無料相談メールを作成する →':loan?'無料ローン相談を申し込む →':'物件相談メールを作成する →';",
    "$('#handoffGo').textContent=life?'無料相談を送信する →':loan?'無料ローン相談を送信する →':'物件相談を送信する →';",
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

  html = html.replace(
    'function openHandoff(mode){handoffMode=mode;',
    "function openHandoff(mode){handoffMode=mode;$('#handoffGo').disabled=false;"
  );
  return html;
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
  res.setHeader('Cache-Control', 'no-store');
  if (missingMarkers.length) res.setHeader('X-Stress-Test-Warnings', missingMarkers.join(',').slice(0, 900));
  res.end(renderedHtml);
};
