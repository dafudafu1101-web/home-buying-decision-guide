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

  const shareCode = String.raw`
const SHARE_DAYS=90;
function shareSummary(){
  if(!last)return 'ADCAST｜3分 住宅予算の決め方チェック';
  const v=last.v;
  const zoneName={safe:'月々の返済を抑える配分',balance:'住宅と返済のバランスを取る配分',housing:'住宅条件を優先する配分',over:'比較ラインより上'}[last.zone]||'住宅予算チェック';
  return ['ADCAST｜3分 住宅予算の決め方チェック','現在の検討価格：'+money(v.price),'診断結果：'+zoneName,'同じ診断結果をリンクから確認できます（90日間有効）。'].join('\\n');
}
function encShareNum(v){const n=Number(v||0);return Math.round(n*100).toString(36)}
function decShareNum(v){const n=parseInt(v||'0',36);return Number.isFinite(n)?n/100:0}
function compactShareToken(){
  const i=inputs();
  const stageMap={none:'0',preschool:'1',primary:'2',teen:'3',college:'4',mixed:'5',future:'6'};
  const expHour=Math.floor((Date.now()+SHARE_DAYS*86400000)/3600000).toString(36);
  return ['3',expHour,encShareNum(i.age),encShareNum(i.children),stageMap[i.childStage]||'0',i.borrowMethod==='pair'?'1':'0',encShareNum(i.gross),encShareNum(i.cash),encShareNum(i.investments),encShareNum(i.price),encShareNum(i.loanAmount),encShareNum(i.living),encShareNum(i.rate),encShareNum(i.term),encShareNum(i.netOverride),i.rateType==='fixed'?'1':'0'].join('~');
}
function unpackCompactShare(token){
  const p=String(token||'').split('~');
  if(p.length<16||p[0]!=='3')return null;
  const exp=parseInt(p[1],36)*3600000;
  if(!Number.isFinite(exp))return null;
  if(Date.now()>exp)return {expired:true};
  const stages=['none','preschool','primary','teen','college','mixed','future'];
  return {age:decShareNum(p[2]),children:decShareNum(p[3]),childStage:stages[parseInt(p[4],10)]||'none',borrowMethod:p[5]==='1'?'pair':'single',gross:decShareNum(p[6]),cash:decShareNum(p[7]),investments:decShareNum(p[8]),price:decShareNum(p[9]),loanAmount:decShareNum(p[10]),living:decShareNum(p[11]),rate:decShareNum(p[12]),term:decShareNum(p[13]),netOverride:decShareNum(p[14]),rateType:p[15]==='1'?'fixed':'variable'};
}
function makeShareUrl(){return location.origin+location.pathname+'#s='+compactShareToken()}
function applySharedInputs(v){
  const set=(id,val)=>{const el=$(id);if(el)el.value=val};
  set('#age',v.age);set('#children',v.children);set('#childStage',v.childStage);set('#grossIncome',v.gross);set('#cash',v.cash);set('#investments',v.investments);set('#price',v.price);set('#loanAmount',v.loanAmount);set('#living',v.living);set('#rate',v.rate);set('#term',v.term);set('#netOverride',v.netOverride);
  const bm=$('input[name=borrowMethod][value="'+v.borrowMethod+'"]');if(bm)bm.checked=true;
  const rt=$('input[name=rateType][value="'+v.rateType+'"]');if(rt)rt.checked=true;
  try{syncChildStage();syncBorrowMethod();normalizeTermForAge();liveCalc()}catch(e){}
}
function restoreSharedResult(){
  if(!location.hash.startsWith('#s=')){show(1);return}
  const shared=unpackCompactShare(location.hash.slice(3));
  if(!shared){show(1);return}
  if(shared.expired){show(1);setTimeout(()=>alert('この共有結果は90日間の有効期限を過ぎています。新しく診断してください。'),50);return}
  applySharedInputs(shared);
  const errs=validate(inputs());
  if(errs.length){show(1);return}
  show(3);
}
async function nativeShare(){
  const text=shareSummary();
  const url=makeShareUrl();
  if(navigator.share){
    try{await navigator.share({title:'ADCAST｜住宅予算チェック結果',text,url});return true}catch(e){if(e&&e.name==='AbortError')return true}
  }
  return false;
}
async function shareToLine(){
  if(await nativeShare())return;
  const payload=shareSummary()+'\\n'+makeShareUrl();
  window.location.href='https://line.me/R/share?text='+encodeURIComponent(payload);
}
async function shareByMail(){
  const text=shareSummary();
  const url=makeShareUrl();
  if(navigator.share){
    try{await navigator.share({title:'ADCAST｜住宅予算チェック結果',text,url});return}catch(e){if(e&&e.name==='AbortError')return}
  }
  const subject='住宅予算チェックの診断結果';
  const body=text+'\\n\\n診断ページ：'+url;
  window.location.href='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
$('#shareLine').onclick=shareToLine;$('#shareMail').onclick=shareByMail;
$('#again').onclick=()=>{selectedChoice=null;history.replaceState(null,'',location.pathname+location.search);show(1)};
`;
  html = replaceOnce(
    html,
    "$('#again').onclick=()=>{selectedChoice=null;show(1)};",
    shareCode,
    'share_bindings'
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

  html = html.replace(
    'function openHandoff(mode){handoffMode=mode;',
    "function openHandoff(mode){handoffMode=mode;$('#handoffGo').disabled=false;"
  );
  html = html.replace('show(1);\\n</script>', 'restoreSharedResult();\\n</script>');
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
