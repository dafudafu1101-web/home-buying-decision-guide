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
    `.lifeplanBridge{margin:22px 0;padding:20px 18px;border:1px solid #d8c9a6;border-radius:22px;background:#fbf7ec}.lifeplanBridge .bridgeKicker{font-size:12px;font-weight:900;letter-spacing:.12em;color:#9b741e;margin-bottom:8px}.lifeplanBridge h2{font-size:27px;margin:.2em 0 .55em}.lifeplanBridge>.lead{margin-bottom:14px}.bridgeIntro{border:1px solid #ddd4c3;border-radius:16px;background:#fff;padding:15px 14px;margin:14px 0}.bridgeIntro b{display:block;font-size:14px;margin-bottom:7px}.bridgeIntro p{font-size:12.5px;line-height:1.75;color:#4d4942;margin:0}.bridgeIntro strong{color:#9a6b13}.bridgeGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 16px}.bridgeItem{border:1px solid #ddd4c3;border-radius:14px;background:#fff;padding:12px}.bridgeItem em{display:block;font-style:normal;font-size:11px;font-weight:900;color:#a8781f;margin-bottom:4px}.bridgeItem b{display:block;font-size:14px;margin-bottom:3px}.bridgeItem span{display:block;font-size:11.5px;line-height:1.5;color:#625d55}.assetChart{border:1px solid #ddd4c3;border-radius:16px;background:#fff;padding:14px;margin:14px 0}.assetChartHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.assetChartHead b{font-size:14px}.chartBadge{font-size:10px;color:#766f63;background:#f1ede4;border-radius:999px;padding:5px 8px;white-space:nowrap}.assetChart p{font-size:11.5px;line-height:1.6;color:#625d55;margin:6px 0 10px}.chartLegend{display:grid;gap:5px;margin:8px 0 6px;font-size:10.5px;color:#625d55}.legendRow{display:flex;align-items:center;gap:7px}.legendLine{width:24px;height:4px;border-radius:99px;background:#b78a2d}.legendLine.dashed{height:0;border-top:3px dashed #777;background:none}.chartNote{font-size:10.5px!important;margin-top:8px!important}.allocationCard{border:1px solid #ddd4c3;border-radius:16px;background:#fff;padding:15px 14px;margin:14px 0}.allocationCard h3{font-family:inherit;font-size:15px;margin:0 0 7px}.allocationCard>p{font-size:11.5px;line-height:1.65;color:#625d55;margin:0 0 10px}.allocationChoices{display:grid;gap:9px}.allocationChoice{border:1px solid #ddd4c3;border-radius:13px;padding:11px;background:#fff}.allocationChoice b{display:block;font-size:13px;margin-bottom:3px}.allocationChoice strong{display:block;font-size:12px;color:#9a6b13;margin-bottom:3px}.allocationChoice span{font-size:11px;line-height:1.55;color:#625d55}.bridgeFoot{font-size:11.5px;line-height:1.65;color:#5b564e;margin:10px 2px 0}.bridgeQuestion{font-size:14px;font-weight:900;line-height:1.6;margin:16px 2px 0}.cta ul{display:none!important}
@media(max-width:430px){.bridgeGrid{grid-template-columns:1fr 1fr}.lifeplanBridge{padding:18px 16px}.lifeplanBridge h2{font-size:26px}}
</style>`,
    'lifeplan_bridge_css'
  );

  html = replaceOnce(
    html,
    '<div class="cta">',
    `<section class="lifeplanBridge" aria-label="詳細ライフプランで確認する内容">
        <div class="bridgeKicker">簡易診断の、その先へ</div>
        <h2>同じ年収でも、住宅に使える余白は家庭ごとに変わります</h2>
        <p class="lead">簡易シミュレーションでは、現在の年収・資産・物件価格・借入条件から住宅への大枠の配分を比較しています。</p>

        <div class="bridgeIntro">
          <b>まだ反映していない、家庭ごとの差があります</b>
          <p><strong>教育、車、旅行、住まいの維持費、働き方、保険、老後、資産運用</strong>などは詳細ライフプランで反映します。「住宅への余白」は、他の希望を圧迫しにくい範囲で住宅に配分できる金額です。</p>
        </div>

        <div class="bridgeGrid">
          <div class="bridgeItem"><em>01</em><b>教育・習い事</b><span>私立、塾、大学、留学など</span></div>
          <div class="bridgeItem"><em>02</em><b>車・交通</b><span>保有、買い替え、駐車場など</span></div>
          <div class="bridgeItem"><em>03</em><b>旅行・帰省</b><span>旅行、外食、趣味など</span></div>
          <div class="bridgeItem"><em>04</em><b>住まいの維持</b><span>税金、修繕、管理費など</span></div>
          <div class="bridgeItem"><em>05</em><b>働き方</b><span>育休、時短、転職、退職など</span></div>
          <div class="bridgeItem"><em>06</em><b>保険・老後・資産</b><span>保障、現金、運用、老後資金など</span></div>
        </div>

        <div class="assetChart">
          <div class="assetChartHead"><b>同じ年収でも、暮らし方で資産推移は変わります</b><span class="chartBadge">比較イメージ</span></div>
          <p>同じ年収・住宅価格でも、教育・車・旅行などの使い方で将来の金融資産は変わります。</p>
          <div class="chartLegend"><div class="legendRow"><i class="legendLine"></i>支出を抑えめに見た一例</div><div class="legendRow"><i class="legendLine dashed"></i>教育・車・旅行などを多めに見た一例</div></div>
          <svg viewBox="0 0 520 230" role="img" aria-label="35歳から75歳までの金融資産推移の比較イメージ" style="width:100%;height:auto;display:block">
            <g stroke="#e7e2d8" stroke-width="1"><line x1="58" y1="28" x2="500" y2="28"/><line x1="58" y1="68" x2="500" y2="68"/><line x1="58" y1="108" x2="500" y2="108"/><line x1="58" y1="148" x2="500" y2="148"/><line x1="58" y1="188" x2="500" y2="188"/></g>
            <g fill="#8d877d" font-size="11"><text x="8" y="32">4,000</text><text x="8" y="72">3,000</text><text x="8" y="112">2,000</text><text x="8" y="152">1,000</text><text x="32" y="192">0</text><text x="18" y="216">35歳</text><text x="130" y="216">45歳</text><text x="242" y="216">55歳</text><text x="354" y="216">65歳</text><text x="466" y="216">75歳</text></g>
            <line x1="58" y1="188" x2="500" y2="188" stroke="#a8a198" stroke-width="2"/>
            <path d="M58 108 C110 92,150 96,170 100 S245 138,280 150 S350 130,390 105 S460 82,500 70" fill="none" stroke="#b78a2d" stroke-width="4" stroke-linecap="round"/>
            <path d="M58 108 C115 114,150 124,170 132 S245 164,280 188 S350 205,390 208 S460 200,500 198" fill="none" stroke="#77736d" stroke-width="4" stroke-dasharray="8 7" stroke-linecap="round"/>
            <g fill="#b78a2d"><circle cx="58" cy="108" r="4"/><circle cx="170" cy="100" r="4"/><circle cx="280" cy="150" r="4"/><circle cx="390" cy="105" r="4"/><circle cx="500" cy="70" r="4"/></g>
            <rect x="290" y="177" rx="8" ry="8" width="124" height="28" fill="#f4efe4" stroke="#ded6c8"/><text x="302" y="195" font-size="10.5" fill="#625d55">資金不足になる時期も確認</text>
          </svg>
          <p class="chartNote">※参考イメージです。将来を予測するものではありません。実際は住宅予算・教育・働き方・運用などを入れて確認します。</p>
        </div>

        <div class="allocationCard">
          <h3>同じ「1,000万円の余白」でも、使い方で意味は変わります</h3>
          <p>必要な現金を残したうえで、残りをどう配分するかまで考えます。</p>
          <div class="allocationChoices">
            <div class="allocationChoice"><b>現金で残す</b><strong>必要額を見極める</strong><span>急な支出への備えは必要です。一方、持ちすぎると資産形成の機会を逃し、物価や住宅価格が上がる局面では購買力が相対的に下がることがあります。</span></div>
            <div class="allocationChoice"><b>金融資産で運用する</b><strong>知識と運用方針で差が出る</strong><span>長期の資産形成につながる可能性がありますが、金融・投資知識やリスクの取り方で結果に差が出ます。元本・運用成果は保証されません。</span></div>
            <div class="allocationChoice"><b>住宅へ配分する</b><strong>暮らし＋住宅側の資産</strong><span>住み続ける間は、市場価格の上下が日々の暮らしに直接影響するわけではありません。ローン返済や物件の資産性で純資産が残る場合があり、売却時には価格が影響します。</span></div>
          </div>
          <p class="bridgeFoot">※どれか1つが正解ではありません。必要な現金・運用余力・住宅への配分を、ご家庭ごとに確認します。</p>
        </div>

        <p class="bridgeQuestion">「自分の場合は、どこまで住宅に使える？」 家庭ごとの希望と3つの配分を入れて確認します。</p>
      </section>

      <div class="cta">`,
    'lifeplan_bridge_markup'
  );

  html = replaceOnce(
    html,
    '<h2 id="ctaTitle">この予算で将来まで無理がないか確認する</h2>',
    '<h2 id="ctaTitle">自分に合った「住宅への余白」を見える化する</h2>',
    'lifeplan_cta_heading'
  );

  html = replaceOnce(
    html,
    '<button class="primary" id="ctaBtn">無料で詳細ライフプランを相談する →</button>',
    '<button class="primary" id="ctaBtn">自分の場合を無料で確認する →</button>',
    'lifeplan_cta_button'
  );

  html = replaceOnce(
    html,
    "const title='この予算で将来まで無理がないか確認する';",
    "const title='自分に合った「住宅への余白」を見える化する';",
    'lifeplan_cta_dynamic_title'
  );

  html = replaceOnce(
    html,
    "function inputs(){return {",
    `let termManuallyEdited=false;
function suggestedTermByAge(age){return Math.min(50,Math.max(1,80-age))}
function syncTermFromAge(){const age=+$('#age').value;if(termManuallyEdited||!(age>=20&&age<=75))return;$('#term').value=suggestedTermByAge(age)}
function inputs(){return {`,
    'age_term_helpers'
  );

  html = replaceOnce(
    html,
    "if(n===2){syncChildStage();syncBorrowMethod();liveCalc()}",
    "if(n===2){syncChildStage();syncBorrowMethod();syncTermFromAge();liveCalc()}",
    'age_term_step_sync'
  );

  html = replaceOnce(
    html,
    "$('#children').addEventListener('input',syncChildStage);",
    "$('#age').addEventListener('input',()=>{syncTermFromAge();liveCalc()});$('#term').addEventListener('input',()=>{termManuallyEdited=true});$('#children').addEventListener('input',syncChildStage);",
    'age_term_events'
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
