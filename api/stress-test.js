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
    '</style>',
    `.lifeplanPreview{margin:18px 0 16px;padding:16px;border:1px solid #6f6247;border-radius:16px;background:rgba(255,255,255,.06)}
.lifeplanPreviewHead{font-size:13px;font-weight:900;color:#e1bf6e;margin-bottom:6px}.lifeplanPreviewLead{font-size:12px;line-height:1.7;color:#e6e3dc;margin:0 0 14px}.lifeplanGraph{display:grid;gap:9px;margin:12px 0}.lifeplanRow{display:grid;grid-template-columns:72px 1fr;gap:9px;align-items:center}.lifeplanRow span{font-size:10.5px;color:#cfc9bd}.lifeplanTrack{height:12px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}.lifeplanBar{height:100%;border-radius:999px;background:linear-gradient(90deg,#a8781f,#e1bf6e)}.lifeplanBar.b2{width:72%}.lifeplanBar.b3{width:58%}.lifeplanBar.b4{width:84%}.lifeplanPreviewNote{font-size:10.5px;line-height:1.6;color:#aaa398;margin:11px 0 0}.lifeplanChecks{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.lifeplanCheck{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:9px 10px;font-size:10.5px;line-height:1.45;color:#eee9dd;background:rgba(255,255,255,.035)}
@media(max-width:430px){.lifeplanChecks{grid-template-columns:1fr}.lifeplanRow{grid-template-columns:64px 1fr}}
</style>`,
    'lifeplan_preview_css'
  );

  html = replaceOnce(
    html,
    '<p id="ctaText">教育費・旅行・車・保険・資産運用・老後・収入変化などまで含め、この住宅予算が人生全体でも成立するか確認します。</p>\n        <ul>',
    `<p id="ctaText">教育費・旅行・車・保険・資産運用・老後・収入変化などまで含め、この住宅予算が人生全体でも成立するか確認します。</p>
        <div class="lifeplanPreview">
          <div class="lifeplanPreviewHead">簡易診断の次に、ここまで確認できます</div>
          <p class="lifeplanPreviewLead">住宅だけでなく、将来の支出と資産残高の動きを同じ時間軸で見て、「この住宅予算を選んだ場合に何が残るか」を確認します。</p>
          <div class="lifeplanGraph" aria-label="詳細ライフプランの確認イメージ">
            <div class="lifeplanRow"><span>住宅費</span><div class="lifeplanTrack"><div class="lifeplanBar" style="width:78%"></div></div></div>
            <div class="lifeplanRow"><span>教育費</span><div class="lifeplanTrack"><div class="lifeplanBar b2"></div></div></div>
            <div class="lifeplanRow"><span>老後資金</span><div class="lifeplanTrack"><div class="lifeplanBar b3"></div></div></div>
            <div class="lifeplanRow"><span>資産残高</span><div class="lifeplanTrack"><div class="lifeplanBar b4"></div></div></div>
          </div>
          <div class="lifeplanChecks">
            <div class="lifeplanCheck">教育費のピーク時も家計が回るか</div>
            <div class="lifeplanCheck">旅行・車・修繕費を入れても余裕が残るか</div>
            <div class="lifeplanCheck">現金と運用資産をどれだけ残すか</div>
            <div class="lifeplanCheck">退職前後まで資産がどう推移するか</div>
          </div>
          <p class="lifeplanPreviewNote">※グラフは確認項目のイメージです。実際のライフプランはご家庭ごとの収入・支出条件を反映して作成します。</p>
        </div>
        <ul>`,
    'lifeplan_preview_markup'
  );

  html = replaceOnce(
    html,
    "const title='この予算で将来まで無理がないか確認する';",
    "const title='今の住宅予算、本当に人生全体でも「ちょうどいい」？';",
    'lifeplan_cta_title'
  );

  html = replaceOnce(
    html,
    "const base='教育費・旅行・車・保険・資産運用・老後・収入変化などまで含め、この住宅予算が人生全体でも成立するか確認します。';",
    "const base='簡易診断では見えない教育費・レジャー費・老後・資産運用・収入変化まで重ね、この住宅予算を選んだ後も家計と資産がどう推移するか確認します。';",
    'lifeplan_cta_base'
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
