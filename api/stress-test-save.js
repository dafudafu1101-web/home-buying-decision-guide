const baseHandler = require('./stress-test');

const SAVE_SHARE_CSS = `
.saveShareCard{border:1px solid #d9c28d;border-radius:18px;padding:17px;margin:18px 0;background:linear-gradient(180deg,#fffdf8,#fbf6e9)}
.saveShareCard h3{font-size:18px;margin:5px 0 7px}.saveShareCard>p{font-size:12px;line-height:1.65;color:#514b42;margin:0 0 12px}
.saveShareGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.saveShareBtn{border:1px solid #b88a2e;border-radius:12px;min-height:50px;padding:11px 9px;background:#fff;font-size:12px;font-weight:900;color:#2d2a26}.saveShareBtn.primarySave{background:linear-gradient(90deg,#a8781f,#d5b35e);border:none;color:#111}.saveMeta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;padding-top:9px;border-top:1px solid #e8dfcf}.saveStatus{font-size:10.5px;line-height:1.45;color:#756d62}.clearSaveBtn{border:0;background:transparent;text-decoration:underline;font-size:10.5px;color:#756d62;padding:5px 0;white-space:nowrap}.saveHint{font-size:10px!important;color:#7d756a!important;margin-top:8px!important}
@media(max-width:420px){.saveShareGrid{grid-template-columns:1fr}.saveShareBtn{min-height:47px}}
@media print{
  @page{size:A4;margin:10mm}
  html,body{background:#fff!important;height:auto!important;overflow:visible!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  body{margin:0!important}
  .screen{display:none!important}
  .screen[data-step="3"]{display:block!important}
  .saveShareCard,.nav,#again,.handoffOverlay,.strategyButtons,.cta button,.agentCard button{display:none!important}
  header,.header{position:static!important;top:auto!important}
  main,.app,.shell,.container,.screen[data-step="3"]{width:100%!important;max-width:none!important;margin:0!important;box-shadow:none!important}
  .resultHero,.strategy,.moreBlock,.lifeplanPreview,.cta,.agentCard,.detailCard,.netWorthCard{break-inside:avoid;page-break-inside:avoid}
  a{color:inherit!important;text-decoration:none!important}
}
`;

const SAVE_SHARE_HTML = `
      <div class="saveShareCard" id="saveShareCard">
        <div class="kicker">RESULT SAVE</div>
        <h3>結果をあとで見直す・保存する</h3>
        <p>診断条件はこの端末に自動保存されます。PDFでは、いま見ている診断結果ページをそのまま保存・印刷できます。</p>
        <div class="saveShareGrid">
          <button type="button" class="saveShareBtn primarySave" id="resultPdfBtn">結果ページをPDF保存・共有</button>
          <button type="button" class="saveShareBtn" id="resultShareBtn">LINE・メールに結果を共有</button>
        </div>
        <div class="saveMeta"><span class="saveStatus" id="resultSaveStatus">この端末に自動保存します</span><button type="button" class="clearSaveBtn" id="resultClearBtn">保存データを削除</button></div>
        <p class="saveHint">※iPhoneでは「PDF保存・共有」→印刷プレビューから共有ボタンを押すと、ファイル保存・LINE・メール等に送れます。保存データはサーバーには送信しません。</p>
      </div>
`;

const SAVE_SHARE_JS = String.raw`
(function(){
  const STORAGE_KEY='adcast-housing-result-v1';
  const step2=document.querySelector('.screen[data-step="2"]');
  const statusEl=document.getElementById('resultSaveStatus');
  const shareBtn=document.getElementById('resultShareBtn');
  const pdfBtn=document.getElementById('resultPdfBtn');
  const clearBtn=document.getElementById('resultClearBtn');
  if(!step2||!shareBtn||!pdfBtn)return;

  function readSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(e){return null}}
  function collectInputs(){
    const data={};
    step2.querySelectorAll('input,select').forEach(function(el){
      if(!el.id&&!el.name)return;
      if(el.type==='radio'){
        if(el.checked)data['radio:'+el.name]=el.value;
      }else if(el.type!=='button')data[el.id||el.name]=el.value;
    });
    return data;
  }
  function restoreInputs(saved){
    if(!saved||!saved.inputs)return false;
    Object.keys(saved.inputs).forEach(function(key){
      const value=saved.inputs[key];
      if(key.indexOf('radio:')===0){
        const name=key.slice(6);
        const el=document.querySelector('input[name="'+name+'"][value="'+CSS.escape(String(value))+'"]');
        if(el)el.checked=true;
      }else{
        const el=document.getElementById(key);if(el)el.value=value;
      }
    });
    try{if(typeof syncChildStage==='function')syncChildStage();if(typeof syncBorrowMethod==='function')syncBorrowMethod();if(typeof liveCalc==='function')liveCalc()}catch(e){}
    return true;
  }
  function formatSavedTime(ts){
    if(!ts)return 'この端末に自動保存します';
    try{return '自動保存済み '+new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(ts))}catch(e){return 'この端末に自動保存済み'}
  }
  function updateStatus(ts,text){if(statusEl)statusEl.textContent=text||formatSavedTime(ts)}
  function saveState(hasResult){
    const saved={version:1,inputs:collectInputs(),hasResult:!!hasResult,savedAt:Date.now()};
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));updateStatus(saved.savedAt)}catch(e){updateStatus(null,'この端末では自動保存を利用できません')}
  }

  step2.addEventListener('input',function(){saveState(false)});
  step2.addEventListener('change',function(){saveState(false)});

  if(typeof show==='function'){
    const baseShow=show;
    show=function(n){baseShow(n);saveState(n===3);};
  }

  const initial=readSaved();
  if(restoreInputs(initial)){
    updateStatus(initial.savedAt);
    if(initial.hasResult){
      try{const errs=typeof validate==='function'&&typeof inputs==='function'?validate(inputs()):[];if(!errs||!errs.length)show(3)}catch(e){}
    }
  }

  function resultSummary(){
    const current=document.getElementById('currentPrice')?.textContent||'';
    const title=document.getElementById('zoneTitle')?.textContent||'';
    const margin=document.getElementById('marginText')?.textContent||'';
    const strategies=Array.from(document.querySelectorAll('#strategies .strategy')).map(function(card){
      const name=card.querySelector('.strategyName')?.textContent?.trim()||'';
      const price=card.querySelector('.strategyPrice')?.textContent?.trim()||'';
      const monthly=Array.from(card.querySelectorAll('.pill')).find(function(x){return x.textContent.indexOf('月返済')>=0})?.textContent?.replace(/\s+/g,' ').trim()||'';
      return name+' '+price+(monthly?' / '+monthly:'');
    });
    const lines=['ADCAST｜住宅予算チェック','現在検討価格：'+current,'結果：'+title];
    if(strategies.length)lines.push('','3つの比較ライン',...strategies);
    if(margin)lines.push('','現在価格との比較：'+margin);
    lines.push('','詳しい結果はPDF保存・共有から、診断結果ページ全体を共有できます。','この結果は簡易比較です。借入可能額・安全上限・将来価格を保証するものではありません。',location.origin+location.pathname);
    return lines.join('\n');
  }

  async function shareResult(){
    saveState(true);
    const text=resultSummary();
    try{
      if(navigator.share){await navigator.share({title:'ADCAST｜住宅予算チェック結果',text:text});return}
      if(navigator.clipboard){await navigator.clipboard.writeText(text);updateStatus(Date.now(),'結果をコピーしました。LINEやメールに貼り付けできます');return}
    }catch(e){if(e&&e.name==='AbortError')return}
    try{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();updateStatus(Date.now(),'結果をコピーしました。LINEやメールに貼り付けできます')}catch(e){updateStatus(null,'共有できませんでした')}
  }

  function printResultPage(){
    saveState(true);
    const oldTitle=document.title;
    const date=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'-');
    document.title='ADCAST_住宅予算チェック結果_'+date;
    requestAnimationFrame(function(){
      try{window.print()}finally{setTimeout(function(){document.title=oldTitle},500)}
    });
  }

  shareBtn.addEventListener('click',shareResult);
  pdfBtn.addEventListener('click',printResultPage);
  clearBtn&&clearBtn.addEventListener('click',function(){try{localStorage.removeItem(STORAGE_KEY)}catch(e){}updateStatus(null,'保存データを削除しました')});
})();
`;

function injectSaveShare(html){
  if(typeof html!=='string'||!html.includes('</body>'))return html;
  let out=html.replace('</head>',`<style>${SAVE_SHARE_CSS}</style></head>`);
  const marker='<p class="disclaimer">';
  if(out.includes(marker))out=out.replace(marker,SAVE_SHARE_HTML+'\n      '+marker);
  out=out.replace('</body>',`<script>${SAVE_SHARE_JS}</script></body>`);
  return out;
}

module.exports = function handler(req,res){
  const originalEnd=res.end.bind(res);
  res.end=function(body,...args){
    if(res.statusCode===200&&typeof body==='string')body=injectSaveShare(body);
    return originalEnd(body,...args);
  };
  return baseHandler(req,res);
};
