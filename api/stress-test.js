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

  html = replaceOnce(
    html,
    '.cta{background:linear-gradient(135deg,#151515,#282828);color:#fff;border-radius:19px;padding:20px;margin:18px 0}',
    '.lifeplanPreview{border:1px solid #dfd3b7;border-radius:20px;padding:18px;margin:24px 0 14px;background:linear-gradient(180deg,#fffdf8,#fbf6e9)}.lifeplanPreview .lpEyebrow{font-size:11px;font-weight:900;letter-spacing:.11em;color:#9b7426}.lifeplanPreview h3{font-size:20px;margin:7px 0 8px}.lifeplanPreview .lpLead{font-size:12.5px;line-height:1.75;color:#4c463d;margin:0 0 13px}.lpQuestions{display:grid;gap:7px;margin:12px 0}.lpQuestion{display:flex;gap:9px;align-items:flex-start;background:#fff;border:1px solid #e7dfcf;border-radius:11px;padding:9px 10px;font-size:11.5px;line-height:1.55;color:#3e3932}.lpQuestion b{color:#9b7426}.lpChart{background:#fff;border:1px solid #e0d8ca;border-radius:14px;padding:11px;margin-top:13px}.lpChartHead{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.lpChartHead b{font-size:12px}.lpChartHead span{font-size:9.5px;color:#7b7469;background:#f4f0e7;border-radius:999px;padding:4px 7px}.lpChart svg{display:block;width:100%;height:auto}.lpChartNote{font-size:10px;line-height:1.55;color:#797267;margin:8px 1px 0}.lpBridge{font-size:12px;line-height:1.75;color:#3f3a33;margin:12px 0 0;font-weight:700}.cta{background:linear-gradient(135deg,#151515,#282828);color:#fff;border-radius:19px;padding:20px;margin:14px 0 18px}',
    'lifeplan_preview_css'
  );

  const lifeplanPreview = `
      <div class="lifeplanPreview">
        <div class="lpEyebrow">簡易診断の、その先へ</div>
        <h3>この予算で、将来のお金がどう動くかまで見える化できます</h3>
        <p class="lpLead">ここまでの診断は、現在の家計・資産から見た「住宅への配分」の整理です。詳細ライフプランでは、住宅を購入した後の家計を時間軸で確認します。</p>
        <div class="lpQuestions">
          <div class="lpQuestion"><b>01</b><span>教育費が重なる時期にも、家計は無理なく続く？</span></div>
          <div class="lpQuestion"><b>02</b><span>住宅購入後、老後まで金融資産はいくら残る？</span></div>
          <div class="lpQuestion"><b>03</b><span>予算を上げる／自己資金を残すと、将来はどう変わる？</span></div>
        </div>
        <div class="lpChart" aria-label="詳細ライフプランで作成する金融資産推移グラフのイメージ">
          <div class="lpChartHead"><b>金融資産の推移｜ライフプラン例</b><span>グラフイメージ</span></div>
          <svg viewBox="0 0 560 230" role="img" aria-label="年齢と金融資産の推移を表したサンプルグラフ">
            <defs>
              <linearGradient id="lpArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#c8a450" stop-opacity=".28"/>
                <stop offset="100%" stop-color="#c8a450" stop-opacity=".03"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="560" height="230" rx="10" fill="#fff"/>
            <g stroke="#ece7dc" stroke-width="1">
              <line x1="48" y1="34" x2="535" y2="34"/><line x1="48" y1="78" x2="535" y2="78"/><line x1="48" y1="122" x2="535" y2="122"/><line x1="48" y1="166" x2="535" y2="166"/>
            </g>
            <g fill="#8b8478" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
              <text x="9" y="38">4,000</text><text x="9" y="82">3,000</text><text x="9" y="126">2,000</text><text x="9" y="170">1,000</text>
              <text x="47" y="210">35歳</text><text x="154" y="210">45歳</text><text x="262" y="210">55歳</text><text x="370" y="210">65歳</text><text x="480" y="210">75歳</text>
            </g>
            <path d="M50 100 C90 88,120 79,158 88 C195 98,214 135,264 146 C309 155,338 126,372 104 C410 80,451 64,532 45 L532 184 L50 184 Z" fill="url(#lpArea)"/>
            <path d="M50 100 C90 88,120 79,158 88 C195 98,214 135,264 146 C309 155,338 126,372 104 C410 80,451 64,532 45" fill="none" stroke="#b88a2e" stroke-width="4" stroke-linecap="round"/>
            <g fill="#b88a2e"><circle cx="50" cy="100" r="4"/><circle cx="158" cy="88" r="4"/><circle cx="264" cy="146" r="4"/><circle cx="372" cy="104" r="4"/><circle cx="532" cy="45" r="4"/></g>
            <g font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="10">
              <rect x="188" y="151" width="122" height="27" rx="7" fill="#fff7e4" stroke="#ead39e"/><text x="201" y="168" fill="#6f5823">教育費ピークなどを確認</text>
              <line x1="246" y1="151" x2="264" y2="146" stroke="#c8a450"/>
            </g>
          </svg>
          <p class="lpChartNote">※上のグラフは表示イメージです。実際はご家族の教育費・生活費・住宅費・資産運用・老後などを入力し、ご家庭ごとの推移を作成します。</p>
        </div>
        <p class="lpBridge">「今買えるか」だけでなく、<b>この家を買っても将来やりたいことを続けられるか</b>を確認するためのライフプランです。</p>
      </div>
`;

  html = replaceOnce(
    html,
    '      <div class="cta">\n        <div class="kicker">NEXT STEP｜無料 詳細ライフプラン相談</div>',
    `${lifeplanPreview}\n      <div class="cta">\n        <div class="kicker">NEXT STEP｜無料 詳細ライフプラン相談</div>`,
    'lifeplan_preview_block'
  );

  html = replaceOnce(
    html,
    "const title='この予算で将来まで無理がないか確認する';\n  const base='教育費・旅行・車・保険・資産運用・老後・収入変化などまで含め、この住宅予算が人生全体でも成立するか確認します。';",
    "const title='この予算で、将来のお金がどう動くか見える化する';\n  const base='教育費・旅行・車・保険・資産運用・老後・収入変化まで含め、住宅購入後の金融資産の推移をグラフで確認します。';",
    'lifeplan_cta_copy'
  );

  html = replaceOnce(
    html,
    '教育費・旅行・車・保険・資産運用・老後・収入変化などまで含め、この住宅予算が人生全体でも成立するか確認します。',
    '教育費・旅行・車・保険・資産運用・老後・収入変化まで含め、住宅購入後の金融資産の推移をグラフで確認します。',
    'lifeplan_initial_copy'
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
