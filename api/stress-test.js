const fs = require('fs');
const path = require('path');

const BASE_CTA_CSS = '.cta{background:linear-gradient(135deg,#151515,#282828);color:#fff;border-radius:19px;padding:20px;margin:18px 0}';
const LIFEPLAN_CSS = '.lifeplanPreview{border:1px solid #dfd3b7;border-radius:20px;padding:18px;margin:24px 0 14px;background:linear-gradient(180deg,#fffdf8,#fbf6e9)}.lifeplanPreview .lpEyebrow{font-size:11px;font-weight:900;letter-spacing:.11em;color:#9b7426}.lifeplanPreview h3{font-size:20px;margin:7px 0 8px}.lifeplanPreview .lpLead{font-size:12.5px;line-height:1.75;color:#4c463d;margin:0 0 13px}.lpScope{background:#fff;border:1px solid #e1d8c8;border-radius:13px;padding:12px 13px;margin:12px 0}.lpScope b{display:block;font-size:12px;margin-bottom:6px}.lpScope p{font-size:11.5px;line-height:1.7;color:#514b42;margin:0}.lpScope strong{color:#8f691f}.lpQuestions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.lpQuestion{background:#fff;border:1px solid #e7dfcf;border-radius:11px;padding:8px 9px;font-size:10.5px;line-height:1.45;color:#595247}.lpQuestion b{display:block;color:#9b7426;font-size:9.5px;margin-bottom:2px}.lpQuestion strong{display:block;color:#2f2b25;font-size:11.5px;margin-bottom:1px}.lpChart{background:#fff;border:1px solid #e0d8ca;border-radius:14px;padding:11px;margin-top:13px}.lpChartHead{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:5px}.lpChartHead b{font-size:12px;min-width:0}.lpChartHead span{font-size:9.5px;color:#7b7469;background:#f4f0e7;border-radius:999px;padding:4px 7px;white-space:nowrap;flex:0 0 auto}.lpCompareIntro{font-size:10.5px;line-height:1.5;color:#5e574d;margin:0 0 8px}.lpLegend{display:flex;flex-wrap:wrap;gap:7px 12px;margin:0 0 7px}.lpLegendItem{display:flex;align-items:center;gap:5px;font-size:9.5px;color:#615a50}.lpSwatch{display:inline-block;width:18px;height:3px;border-radius:99px;background:#b88a2e}.lpSwatch.alt{background:repeating-linear-gradient(90deg,#6f6b63 0 6px,transparent 6px 9px)}.lpChart svg{display:block;width:100%;height:auto}.lpChartNote{font-size:10px;line-height:1.55;color:#797267;margin:8px 1px 0}.lpAllocation{background:#fff;border:1px solid #e0d8ca;border-radius:14px;padding:12px;margin-top:13px}.lpAllocation h4{font-size:12.5px;margin:0 0 4px}.lpAllocationLead{font-size:10.5px;line-height:1.5;color:#5e574d;margin:0 0 9px}.lpAllocationGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.lpAllocationCard{border:1px solid #e7dfcf;border-radius:11px;padding:9px;background:#fffdf9;min-width:0}.lpAllocationCard b{display:block;font-size:10.5px;color:#2f2b25;margin-bottom:3px}.lpAllocationCard strong{display:block;font-size:11px;color:#9b7426;margin-bottom:3px}.lpAllocationCard p{font-size:9.5px;line-height:1.45;color:#696156;margin:0}.lpAllocationNote{font-size:9.5px;line-height:1.5;color:#7a7369;margin:8px 1px 0}.lpBridge{font-size:12px;line-height:1.7;color:#3f3a33;margin:12px 0 0;font-weight:700}@media(max-width:640px){.lpAllocationGrid{grid-template-columns:1fr}.lpAllocationCard{padding:8px 10px}.lpChartHead{gap:7px}.lpChartHead span{font-size:9px;padding:4px 6px}}.cta{background:linear-gradient(135deg,#151515,#282828);color:#fff;border-radius:19px;padding:20px;margin:14px 0 18px}';

const ALLOCATION_CHOICES_HTML = `
        <div class="lpAllocation" aria-label="住宅に使わなかった余白の使い方による違いのイメージ">
          <h4>同じ「1,000万円の余白」でも、使い方で意味は変わります</h4>
          <p class="lpAllocationLead">必要な現金を残したうえで、残りをどう配分するかまで考えます。</p>
          <div class="lpAllocationGrid">
            <div class="lpAllocationCard"><b>現金で残す</b><strong>必要額を見極める</strong><p>急な支出への備えは必要です。一方、持ちすぎると資産形成の機会を逃し、物価や住宅価格が上がる局面では購買力が相対的に下がることがあります。必要額を確認します。</p></div>
            <div class="lpAllocationCard"><b>金融資産で運用する</b><strong>知識と運用方針で差が出る</strong><p>長期の資産形成につながる可能性がありますが、金融・投資知識やリスクの取り方で結果に差が出ます。元本・運用成果は保証されません。</p></div>
            <div class="lpAllocationCard"><b>住宅へ配分する</b><strong>暮らし＋住宅側の資産</strong><p>住み続ける間は、市場価格の上下が日々の暮らしに直接影響するわけではありません。ローン返済や物件の資産性で住宅側に純資産が残る場合があり、売却時には価格が影響します。</p></div>
          </div>
          <p class="lpAllocationNote">※どれか1つが正解ではなく、運用成果や住宅価格の上昇を前提にするものでもありません。必要な現金・運用余力・住宅への配分を確認します。</p>
        </div>
`;

const LIFEPLAN_PREVIEW_HTML = `
      <div class="lifeplanPreview">
        <div class="lpEyebrow">簡易診断の、その先へ</div>
        <h3>同じ年収でも、住宅に使える余白は家庭ごとに変わります</h3>
        <p class="lpLead">今回の簡易シミュレーションは、現在の年収・資産・物件価格・借入条件から、住宅への大枠の配分を比較するものです。</p>
        <div class="lpScope">
          <b>今回の簡易シミュレーションでは、まだ反映していないお金があります</b>
          <p><strong>教育方針や習い事、車、旅行・帰省、住まいの維持費、働き方の変化、保険、老後、資産運用など、家庭ごとの差が大きい支出はまだ入れていません。</strong> ここでいう「住宅への余白」は、他の希望を圧迫しにくい範囲で住宅に配分できる金額です。</p>
        </div>
        <div class="lpQuestions">
          <div class="lpQuestion"><b>01</b><strong>教育・習い事</strong><span>私立、塾、大学、留学など</span></div>
          <div class="lpQuestion"><b>02</b><strong>車・交通</strong><span>保有、買い替え、駐車場など</span></div>
          <div class="lpQuestion"><b>03</b><strong>旅行・帰省</strong><span>旅行、外食、趣味など</span></div>
          <div class="lpQuestion"><b>04</b><strong>住まいの維持</strong><span>税金、修繕、管理費など</span></div>
          <div class="lpQuestion"><b>05</b><strong>働き方</strong><span>育休、時短、転職、退職など</span></div>
          <div class="lpQuestion"><b>06</b><strong>保険・老後・資産</strong><span>保障、現金、運用、老後資金など</span></div>
        </div>
        <div class="lpChart" aria-label="同じ年収でも暮らし方によって金融資産の推移が変わることを示すライフプランのイメージ">
          <div class="lpChartHead"><b>同じ年収でも、暮らし方で資産推移は変わります</b><span>比較イメージ</span></div>
          <p class="lpCompareIntro">同じ年収・住宅価格でも、教育・車・旅行などの使い方で、将来の金融資産は大きく変わります。</p>
          <div class="lpLegend"><span class="lpLegendItem"><i class="lpSwatch"></i>支出を抑えめに見た一例</span><span class="lpLegendItem"><i class="lpSwatch alt"></i>教育・車・旅行などを多めに見た一例</span></div>
          <svg viewBox="0 0 560 275" role="img" aria-label="同じ年収と住宅価格でも生活設計により金融資産が残るケースと一時的にマイナスになるケースを比較したイメージ"><rect x="0" y="0" width="560" height="275" rx="10" fill="#fff"/><g stroke="#ece7dc" stroke-width="1"><line x1="52" y1="38" x2="535" y2="38"/><line x1="52" y1="75" x2="535" y2="75"/><line x1="52" y1="112" x2="535" y2="112"/><line x1="52" y1="149" x2="535" y2="149"/><line x1="52" y1="186" x2="535" y2="186"/><line x1="52" y1="223" x2="535" y2="223"/></g><line x1="52" y1="186" x2="535" y2="186" stroke="#b9b1a3" stroke-width="2"/><g fill="#8b8478" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><text x="8" y="18">金融資産（万円）</text><text x="12" y="42">4,000</text><text x="12" y="79">3,000</text><text x="12" y="116">2,000</text><text x="12" y="153">1,000</text><text x="30" y="190">0</text><text x="7" y="227">-1,000</text><text x="48" y="258">35歳</text><text x="156" y="258">45歳</text><text x="264" y="258">55歳</text><text x="372" y="258">65歳</text><text x="480" y="258">75歳</text><text x="497" y="181" fill="#8b8170">0円ライン</text></g><path d="M52 112 C95 103,120 98,160 104 C205 111,225 139,268 151 C310 160,344 143,376 126 C417 105,458 94,532 78" fill="none" stroke="#b88a2e" stroke-width="4" stroke-linecap="round"/><g fill="#b88a2e"><circle cx="52" cy="112" r="4"/><circle cx="160" cy="104" r="4"/><circle cx="268" cy="151" r="4"/><circle cx="376" cy="126" r="4"/><circle cx="532" cy="78" r="4"/></g><path d="M52 112 C95 113,120 121,160 132 C205 145,230 170,268 181 C306 192,340 200,376 205 C420 209,463 201,532 193" fill="none" stroke="#6f6b63" stroke-width="3.5" stroke-dasharray="8 6" stroke-linecap="round"/><g fill="#6f6b63"><circle cx="52" cy="112" r="3.5"/><circle cx="160" cy="132" r="3.5"/><circle cx="268" cy="181" r="3.5"/><circle cx="376" cy="205" r="3.5"/><circle cx="532" cy="193" r="3.5"/></g><g font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="10"><rect x="304" y="207" width="132" height="26" rx="7" fill="#f5f1ea" stroke="#d8d0c3"/><text x="317" y="223" fill="#5d574f">資金不足になる時期も確認</text><line x1="360" y1="207" x2="376" y2="205" stroke="#8b8170"/></g></svg>
          <p class="lpChartNote">※参考イメージです。実際の結果や将来を予測するものではありません。詳細ライフプランでは、住宅予算・教育・働き方・運用などを入れて確認します。</p>
        </div>
${ALLOCATION_CHOICES_HTML}
        <p class="lpBridge"><b>「自分の場合は、どこまで住宅に使える？」</b> 詳細ライフプランでは、家庭ごとの希望と3つの配分まで入れて具体的に確認します。</p>
      </div>
`;

const REPLACEMENTS = [
  ['handoff_hint','下のボタンでメールアプリを開くと、入力した連絡先と診断結果が本文に入った状態になります。内容をご確認のうえ送信してください。','下のボタンからブラウザ上でそのまま相談内容を送信できます。メールアプリやGmailは必要ありません。'],
  ['privacy_note','メールは送信前にご自身で内容を確認できます。入力内容・診断結果は、相談対応のために使用します。','入力内容・診断結果は相談対応のために使用します。送信完了後、後日担当者よりメールでご連絡します。'],
  ['handoff_button_copy',"$('#handoffGo').textContent=life?'無料相談メールを作成する →':'物件相談メールを作成する →';","$('#handoffGo').textContent=life?'無料相談を送信する →':'物件相談を送信する →';"],
  ['submit_function',"function openMailToSakai(){if(!handoffMode||!validateIntake())return;const subject=mailSubject(handoffMode),body=summaryText(handoffMode);$('#handoffSummary').textContent=body;window.location.href=`mailto:${SAKAI_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}","async function submitConsultation(){if(!handoffMode||!validateIntake())return;const c=contactValues(),body=summaryText(handoffMode),btn=$('#handoffGo');$('#handoffSummary').textContent=body;$('#copyState').textContent='送信中です…';btn.disabled=true;try{const r=await fetch('/api/consultation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:handoffMode,name:c.name,email:c.email,phone:c.phone,summary:body})});const data=await r.json().catch(()=>({}));if(!r.ok||!data.ok)throw new Error(data.error||'submit_failed');$('#copyState').textContent='送信しました。後日担当者よりメールでご連絡します。';btn.textContent='送信済み';btn.disabled=true;}catch(e){console.error(e);$('#copyState').textContent=e.message==='service_not_configured'?'現在、相談受付の送信設定を確認中です。恐れ入りますが、相談内容をコピーして担当者へお送りください。':'送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。';btn.disabled=false;}}"],
  ['submit_binding',"$('#handoffGo').onclick=openMailToSakai;","$('#handoffGo').onclick=submitConsultation;"],
  ['lifeplan_preview_css',BASE_CTA_CSS,LIFEPLAN_CSS],
  ['lifeplan_preview_block','      <div class="cta">\n        <div class="kicker">NEXT STEP｜無料 詳細ライフプラン相談</div>',`${LIFEPLAN_PREVIEW_HTML}\n      <div class="cta">\n        <div class="kicker">NEXT STEP｜無料 詳細ライフプラン相談</div>`],
  ['lifeplan_cta_copy',"const title='この予算で将来まで無理がないか確認する';\n  const base='教育費・旅行・車・保険・資産運用・老後・収入変化などまで含め、この住宅予算が人生全体でも成立するか確認します。';","const title='自分に合った「住宅への余白」を見える化する';\n  const base='教育・車・旅行・働き方・老後などの希望と、現金・金融資産・住宅への配分を反映し、購入後の資産推移を確認します。';"],
  ['lifeplan_initial_copy','教育費・旅行・車・保険・資産運用・老後・収入変化などまで含め、この住宅予算が人生全体でも成立するか確認します。','教育・車・旅行・働き方・老後などの希望と、現金・金融資産・住宅への配分を反映し、購入後の資産推移を確認します。'],
  ['lifeplan_cta_list','        <ul><li>教育費・私立・大学・習い事</li><li>旅行・レジャー・車・修繕</li><li>保険・資産運用・老後資金</li><li>昇給・退職金・買い替え計画</li></ul>\n',''],
  ['lifeplan_cta_button','無料で詳細ライフプランを相談する →','自分の場合を無料で確認する →']
];

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`missing_marker:${label}`);
  return source.replace(from, to);
}

function applyReplacements(source) {
  return REPLACEMENTS.reduce((html, [label, from, to]) => replaceOnce(html, from, to, label), source);
}

function buildHtml() {
  const filePath = path.join(process.cwd(), 'stress-test.html');
  const source = fs.readFileSync(filePath, 'utf8');
  const html = applyReplacements(source);
  return html.replace("function openHandoff(mode){handoffMode=mode;","function openHandoff(mode){handoffMode=mode;$('#handoffGo').disabled=false;");
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