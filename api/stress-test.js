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
  const bridgeCss = fs.readFileSync(path.join(root, 'lifeplan-bridge.css'), 'utf8') + `
.loanHelpFold{margin:14px 0 18px;border:1px solid #dfd3b8;border-radius:14px;background:#fffdf8;overflow:hidden}
.loanHelpFold>summary{list-style:none;cursor:pointer;padding:14px 16px;display:block}
.loanHelpFold>summary::-webkit-details-marker{display:none}
.loanHelpFold>summary .loanFoldEyebrow{display:inline-block;font-size:10.5px;font-weight:900;letter-spacing:.05em;color:#8a6117;margin-bottom:6px}
.loanHelpFold>summary b{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:15px;line-height:1.45;color:#1f1c17}
.loanHelpFold>summary b:after{content:'＋';font-size:18px;color:#8a6117;flex:none}
.loanHelpFold[open]>summary b:after{content:'−'}
.loanHelpFold>summary small{display:block;margin-top:5px;font-size:11px;line-height:1.55;color:#6b665f;font-weight:500}
.loanHelpFold>.loanHelpCard{margin:0;border:0;border-top:1px solid #eadfc8;border-radius:0;box-shadow:none;background:linear-gradient(135deg,#fffdf8,#f8f1e2)}

/* Result first-view: decision clarity layer. */
.resultDecision{margin:14px 0 18px;border:1px solid #d9cfb8;border-radius:20px;padding:18px;background:linear-gradient(145deg,#fffdf8,#f7f1e4)}
.resultDecision .rdKicker{font-size:10.5px;font-weight:900;letter-spacing:.08em;color:#8a6117}
.resultDecision h2{font-family:inherit;font-size:21px;line-height:1.45;margin:7px 0 5px}
.resultDecision .rdAmount{font-size:34px;font-weight:900;letter-spacing:-.035em;color:#171512;line-height:1.2;margin:5px 0}
.resultDecision .rdLead{font-size:12.5px;line-height:1.7;color:#4d473d;margin:6px 0 14px}
.rdChoices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.rdChoice{background:#fff;border:1px solid #e2dbcf;border-radius:12px;padding:11px 8px;min-width:0}
.rdChoice b{display:block;font-size:11.5px;line-height:1.4;margin-bottom:4px}.rdChoice span{display:block;font-size:10px;line-height:1.45;color:#756e63}
.rdBridge{margin-top:12px;padding:11px 12px;border-radius:11px;background:#171717;color:#fff;font-size:11.5px;line-height:1.65}.rdBridge b{color:#e1bf6e}
.resultDecision.over .rdAmount{font-size:25px}
@media(max-width:480px){.rdChoices{grid-template-columns:1fr}.resultDecision .rdAmount{font-size:30px}.rdChoice{padding:10px 11px}}


/* 2026-10 result simplification: keep the first view decision-focused. */
.screen[data-step="3"]>.resultHero,
.screen[data-step="3"]>.summaryGrid,
.screen[data-step="3"]>h2[style*="font-size:22px"],
.screen[data-step="3"]>h2[style*="font-size:22px"] + .lead,
.screen[data-step="3"]>#strategies,
.screen[data-step="3"]>#strategies + .hint,
.screen[data-step="3"]>#longTermNote,
.screen[data-step="3"]>.choiceMargin,
.screen[data-step="3"]>.portfolioCard,
.screen[data-step="3"]>.selectPrompt{display:none!important}
.resultDecision{margin-top:4px}
.resultDecision .rdKicker:after{content:"｜RESULT"}
.resultDecision .rdBridge{margin-bottom:0}
.screen[data-step="3"]>.moreWrap{margin-top:14px}
.screen[data-step="3"]>.cta{margin-top:18px}
.screen[data-step="3"]>.agentLinkCard{margin-top:10px}
.screen[data-step="3"]>.resultEmailBox{margin-top:14px}


/* Final RESULT story: preserve the useful three-allocation idea without restoring the long explanation. */
.resultDecision .rdChoices{margin-top:12px}
.resultDecision .rdChoice{padding:13px 11px}
.resultDecision .rdChoice b{font-size:12.5px}
.resultDecision .rdChoice span{font-size:10.5px}
.resultDecision .rdChoice:nth-child(3) span:after{content:"。配分を厚くするなら、物件の資産性・売りやすさも確認"}
.rdMonthly{margin:-2px 0 12px;font-size:11.5px;line-height:1.6;color:#5f584e;font-weight:700}
.rdMonthly strong{color:#171512}
.strategyPeek{margin:14px 0 0;border:1px solid #ddd5c7;border-radius:14px;background:#fff;overflow:hidden}
.strategyPeek>summary{list-style:none;cursor:pointer;padding:13px 14px;font-size:13px;font-weight:900}
.strategyPeek>summary::-webkit-details-marker{display:none}
.strategyPeek>summary:after{content:"＋";float:right}
.strategyPeek[open]>summary:after{content:"−"}
.strategyPeek:not([open]) .strategyPeekList,.strategyPeek:not([open]) .strategyDetail{display:none}.strategyPeek[open] .strategyPeekList{display:grid;gap:6px;padding:0 12px 12px}
.strategyPeekRow{display:grid;grid-template-columns:1fr auto;gap:10px;padding:9px 10px;border-radius:10px;background:#f7f4ee;font-size:11px;line-height:1.45}
.strategyPeekRow b{font-size:11.5px}.strategyPeekRow strong{white-space:nowrap}
.strategyDetail{padding:0 12px 12px}
.strategyDetail .strategyWrap{margin-top:0}
.lifeplanBridge{margin:16px 0!important;padding:18px!important;border-radius:18px!important}
.lifeplanBridge .bridgeIntro,.lifeplanBridge .allocationCard{display:none!important}
.lifeplanBridge .bridgeKicker{font-size:10.5px!important}
.lifeplanBridge>h2{font-size:20px!important}
.lifeplanBridge>.lead{font-size:12px!important;line-height:1.7!important;margin-bottom:12px!important}
.lifeplanBridge .bridgeGrid{gap:7px!important;margin:10px 0 14px!important}
.lifeplanBridge .bridgeItem{padding:10px!important}
.lifeplanBridge .assetChart{margin-top:12px!important;padding:13px!important}
.lifeplanBridge .bridgeQuestion{font-size:12px!important;line-height:1.7!important;margin:12px 0 0!important}
@media(max-width:480px){.lifeplanBridge{padding:14px!important}.strategyPeekRow{grid-template-columns:1fr}.strategyPeekRow strong{font-size:12px}}

/* Result screen typography: keep the diagnostic UI visually consistent on iPhone/Android. */
.screen[data-step="3"] h1,.screen[data-step="3"] h2,.screen[data-step="3"] h3,.screen[data-step="3"] .resultHero .title,.screen[data-step="3"] .metric strong,.screen[data-step="3"] .strategyPrice,.screen[data-step="3"] .choiceMargin .big,.screen[data-step="3"] .marginRow strong,.screen[data-step="3"] .flowStep strong,.screen[data-step="3"] .flowResult strong,.screen[data-step="3"] .traceRow strong,.screen[data-step="3"] .equityRow strong,.screen[data-step="3"] .netWorthCard .nwFinal{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif!important;letter-spacing:-.02em}
.screen[data-step="3"] .metric strong,.screen[data-step="3"] .strategyPrice,.screen[data-step="3"] .marginRow strong,.screen[data-step="3"] .flowStep strong,.screen[data-step="3"] .flowResult strong,.screen[data-step="3"] .equityRow strong,.screen[data-step="3"] .netWorthCard .nwFinal{font-weight:800}
/* Make the detailed numbers section useful before it is opened. */
.moreWrap{padding:0!important;overflow:hidden;border:1px solid #d8d1c5!important;border-radius:18px!important;background:#fff;margin-top:22px!important}
.moreWrap>.moreSummary{list-style:none;padding:16px 16px 15px;display:block;background:linear-gradient(180deg,#fbfaf7,#f7f4ed);cursor:pointer}
.moreWrap>.moreSummary::-webkit-details-marker{display:none}
.moreSummaryHead{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:15px;font-weight:900;color:#171512}
.moreSummaryHead:after{content:'＋';width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#111;color:#fff;font-size:17px;line-height:1;flex:none}
.moreWrap[open]>.moreSummary .moreSummaryHead:after{content:'−'}
.moreSummarySub{display:block;margin-top:5px;font-size:11px;font-weight:600;line-height:1.55;color:#716b61}
.moreSummaryGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px}
.moreSummaryItem{display:block;padding:9px 8px;border:1px solid #e1dbd0;border-radius:11px;background:#fff;min-width:0}
.moreSummaryItem em{display:block;font-style:normal;font-size:9.5px;line-height:1.35;color:#777065;font-weight:700;margin-bottom:3px}
.moreSummaryItem strong{display:block;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif!important;font-size:12.5px;line-height:1.35;color:#171512;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.moreWrap>.moreBlock{margin:0 16px!important;padding:20px 0!important;border-top:1px solid #e7e1d7!important}
.moreWrap>.moreBlock:first-of-type{margin-top:0!important;border-top:1px solid #e7e1d7!important}
.moreWrap>.moreBlock>h2,.moreWrap>.moreBlock>h3{margin:0 0 12px!important;font-size:18px!important;line-height:1.45}
.moreWrap .detailCards{gap:8px;margin-top:8px}
.moreWrap .detailCard{padding:13px 14px;border-radius:13px;background:#fff}
.moreWrap .detailCard.ref{background:#f8f6f1}
.moreWrap .detailCard b{font-size:11.5px;line-height:1.55;color:#34302a}
.moreWrap .detailCard strong{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif!important;font-size:24px;font-weight:900;letter-spacing:-.02em;margin:5px 0}
.moreWrap .detailCard span{font-size:10.8px;line-height:1.65}
.moreWrap .netWorthList{gap:8px}
.moreWrap .netWorthCard{padding:13px 14px;border-radius:13px;background:#fff}
.moreWrap .netWorthCard b{font-size:12px;margin-bottom:7px}
.moreWrap .netWorthCard .nwGrid{font-size:10.8px;line-height:1.55;gap:3px}
.moreWrap .netWorthCard .nwFinal{font-size:18px!important;line-height:1.45;margin-top:8px;padding-top:8px;border-top:1px solid #ece7de}
@media(max-width:480px){.moreSummaryGrid{gap:5px}.moreSummaryItem{padding:8px 6px}.moreSummaryItem em{font-size:8.8px}.moreSummaryItem strong{font-size:11.5px}.moreWrap>.moreBlock{margin:0 13px!important}}
`;
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

  const loanFoldPattern = /(<div class="loanHelpCard">[\s\S]*?<p class="loanHelpFoot">[\s\S]*?<\/p>\s*<\/div>)/;
  if (loanFoldPattern.test(html)) {
    html = html.replace(
      loanFoldPattern,
      `<details class="loanHelpFold">
        <summary>
          <span class="loanFoldEyebrow">借入予定額がまだ分からない方へ</span>
          <b>住宅ローン、いくらまで借りられる？</b>
          <small>物件が決まる前でもOK。借入上限・金融機関・金利・団信を無料で確認できます。</small>
        </summary>
        $1
      </details>`
    );
  } else {
    missingMarkers.push('loan_help_fold');
    console.warn('stress_test_missing_marker', 'loan_help_fold');
  }

  html = replaceOnce(
    html,
    '<div class="resultHero" id="resultHero">',
    `<div class="resultDecision" id="resultDecision">
        <div class="rdKicker">まず見るところ</div>
        <h2 id="rdTitle">今の予算と、住宅への配分余地</h2>
        <div class="rdAmount" id="rdAmount">—</div>
        <div class="rdMonthly" id="rdMonthly">—</div>
        <p class="rdLead" id="rdLead"></p>
        <div class="rdChoices">
          <div class="rdChoice"><b>💰 現金で残す</b><span>生活防衛・教育・将来支出への余力</span></div>
          <div class="rdChoice"><b>📈 金融資産へ</b><span>住宅以外の資産形成に配分</span></div>
          <div class="rdChoice"><b>🏠 住宅へ</b><span>立地・広さ・利便性・資産性の改善へ</span></div>
        </div>
        <div class="rdBridge"><b>どれか1つが正解ではありません。</b> 必要な現金を残し、住宅・現金・金融資産の配分を家庭ごとに考えます。</div>
        <details class="strategyPeek" id="strategyPeek"><summary>3つの資産配分戦略を見る</summary><div class="strategyPeekList" id="strategyPeekList"></div><div class="strategyDetail"><div class="strategyWrap" id="strategyDetailList"></div></div></details>
      </div>\n      <div class="resultHero" id="resultHero">`,
    'result_first_view'
  );

  html = replaceOnce(
    html,
    '<summary>数字をもっと詳しく見る（自己資金・金利・10年後の見通し）</summary>',
    `<summary class="moreSummary">
          <span class="moreSummaryHead">計算の内訳を見る</span>
          <span class="moreSummarySub">自己資金・金利上昇時の余力・10年後の住宅純資産を確認できます。</span>
          <span class="moreSummaryGrid">
            <span class="moreSummaryItem"><em>金利3%時の家計余力</em><strong id="moreStressSummary">—</strong></span>
            <span class="moreSummaryItem"><em>10年後ローン残高</em><strong id="moreBalanceSummary">—</strong></span>
            <span class="moreSummaryItem"><em>横ばい時の住宅純資産</em><strong id="moreNetWorthSummary">—</strong></span>
          </span>
        </summary>`,
    'detail_summary_ui'
  );

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
    "const curLoan=v.loanAmount,stdStress=stressMargin(curLoan,v,net,STRESS_STANDARD),strictStress=stressMargin(curLoan,v,net,STRESS_STRICT);",
    "const curLoan=v.loanAmount,stdStress=stressMargin(curLoan,v,net,STRESS_STANDARD),strictStress=stressMargin(curLoan,v,net,STRESS_STRICT);$('#moreStressSummary').textContent=money(stdStress.annualLeft)+'/年';$('#moreBalanceSummary').textContent=money(stdStress.bal10);",
    'detail_summary_stress_values'
  );
  html = replaceOnce(
    html,
    "const nw=netWorthScenarios(v),nwLabel=",
    "const nw=netWorthScenarios(v);$('#moreNetWorthSummary').textContent=money(nw[1].netWorth);const nwLabel=",
    'detail_summary_networth_value'
  );

  html = replaceOnce(
    html,
    "const margin=refs.housing-v.price;$('#marginCurrent').textContent=money(v.price);",
    `const margin=refs.housing-v.price;
  const rd=$('#resultDecision');
  const curMonthly=paymentMetrics(v.loanAmount,v).monthly, lineAcq=acquisitionFor(refs.housing,assumedEquity), lineMonthly=paymentMetrics(lineAcq.loan,v).monthly, monthlyDiff=lineMonthly-curMonthly;
  $('#rdMonthly').innerHTML=margin>0?'住宅へ配分した場合の月返済差 <strong>約＋'+money(Math.max(0,monthlyDiff))+'/月</strong> <span>（'+v.term+'年・金利'+v.rate+'%の比較）</span>':'現在の月返済目安 <strong>約'+money(curMonthly)+'/月</strong>';
  if(margin>0){
    rd.classList.remove('over');
    $('#rdTitle').textContent='今の予算には、住宅への配分を考えられる余地があります';
    $('#rdAmount').textContent='比較ラインまで ＋'+money(margin);
    $('#rdLead').textContent='この差は、住宅・現金・金融資産のどこへ配分するかを考えるための比較値です。住宅条件を改善したい理由がなければ、無理に予算を上げる必要はありません。';
  }else{
    rd.classList.add('over');
    $('#rdTitle').textContent='今の予算は、簡易比較ラインを超える水準です';
    $('#rdAmount').textContent=zone==='housing'?'比較ライン付近':money(Math.abs(margin))+' 上回る';
    $('#rdLead').textContent='購入できないという意味ではありません。人生全体の支出まで含めて、この価格を住宅へ配分してよいか詳しく確認したい位置です。';
  }
  const peekData=[
    {emoji:'🟢',name:'月々の返済を抑える',price:refs.safe},
    {emoji:'🔵',name:'住宅と月々の負担を両立する',price:refs.balance},
    {emoji:'🟣',name:'住宅への配分を高める',price:refs.housing}
  ];
  const peek=$('#strategyPeekList'),detail=$('#strategyDetailList'),source=$('#strategies');
  if(peek)peek.innerHTML=peekData.map(d=>{const acq=acquisitionFor(d.price,assumedEquity),pm=paymentMetrics(acq.loan,v);return '<div class="strategyPeekRow"><b>'+d.emoji+' '+d.name+'</b><strong>'+money(d.price)+'・月約'+money(pm.monthly)+'</strong></div>'}).join('');
  if(detail&&source)detail.innerHTML=source.innerHTML;
  $('#marginCurrent').textContent=money(v.price);`,
    'result_first_view_logic'
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
  let outputHtml = renderedHtml;
  try {
    const requestUrl = new URL(req.url || '/stress-test', 'https://local.invalid');
    const sharedToken = requestUrl.searchParams.get('s') || '';
    if (/^[34]~[a-z0-9]+(?:~[a-z0-9]+){14,15}$/.test(sharedToken)) {
      outputHtml = outputHtml
        .replace('<details class="whyAmount">', '<details class="whyAmount" open>')
        .replace('<details class="moreWrap">', '<details class="moreWrap" open>');
    }
  } catch (_) {}
  res.end(outputHtml);
};
