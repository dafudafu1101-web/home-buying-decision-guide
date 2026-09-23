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
  .saveShareCard,.nav,#again,.handoffOverlay,.strategyButtons,.selectPrompt,.cta button,.agentCard button{display:none!important}
  header,.header{position:static!important;top:auto!important}
  main,.app,.shell,.container,.screen[data-step="3"]{width:100%!important;max-width:none!important;margin:0!important;box-shadow:none!important}
  .resultHero,.strategy,.moreBlock,.lifeplanPreview,.cta,.agentCard,.detailCard,.netWorthCard,.lpScope,.lpChart,.lpAllocation,.lpAllocationCard{break-inside:avoid;page-break-inside:avoid}
  details{display:block!important}
  details>summary{display:none!important}
  details>*:not(summary){display:block!important}
  a{color:inherit!important;text-decoration:none!important}
}
`;

const SAVE_SHARE_HTML = `
      <div class="saveShareCard" id="saveShareCard">
        <div class="kicker">RESULT SAVE</div>
        <h3>結果をあとで見直す・保存する</h3>
        <p>診断条件はこの端末に自動保存されます。PDF保存では、折りたたみをすべて開いた診断結果ページを保存できます。</p>
        <div class="saveShareGrid">
          <button type="button" class="saveShareBtn primarySave" id="resultPdfBtn">結果ページをPDF保存・共有</button>
          <button type="button" class="saveShareBtn" id="resultShareBtn">同じ結果をLINE・メールで共有</button>
        </div>
        <div class="saveMeta"><span class="saveStatus" id="resultSaveStatus">この端末に自動保存します</span><button type="button" class="clearSaveBtn" id="resultClearBtn">保存データを削除</button></div>
        <p class="saveHint">※共有リンクは90日間有効です。共有リンクには診断条件が含まれるため、送信先をご確認ください。リンク内の条件は通常サーバーへ送信されません。iPhoneではPDF画面から共有ボタンを押すと、ファイル保存・LINE・メール等に送れます。</p>
      </div>
`;

const SAVE_SHARE_JS = String.raw`
(function(){
  const STORAGE_KEY='adcast-housing-result-v1';
  const SHARE_DAYS=90;
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

  function utf8ToB64url(str){
    const bytes=new TextEncoder().encode(str);let bin='';bytes.forEach(function(b){bin+=String.fromCharCode(b)});
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function b64urlToUtf8(str){
    const pad='='.repeat((4-str.length%4)%4);const bin=atob(str.replace(/-/g,'+').replace(/_/g,'/')+pad);const bytes=Uint8Array.from(bin,function(c){return c.charCodeAt(0)});return new TextDecoder().decode(bytes);
  }
  function makeShareUrl(){
    const payload={v:1,exp:Date.now()+SHARE_DAYS*24*60*60*1000,inputs:collectInputs()};
    return location.origin+location.pathname+'#result='+utf8ToB64url(JSON.stringify(payload));
  }
  function readSharedResult(){
    if(!location.hash.startsWith('#result='))return null;
    try{
      const payload=JSON.parse(b64urlToUtf8(location.hash.slice(8)));
      if(!payload||payload.v!==1||!payload.inputs)return null;
      if(!payload.exp||Date.now()>payload.exp)return {expired:true};
      return {inputs:payload.inputs,hasResult:true,savedAt:Date.now(),shared:true,exp:payload.exp};
    }catch(e){return null}
  }

  step2.addEventListener('input',function(){saveState(false)});
  step2.addEventListener('change',function(){saveState(false)});

  if(typeof show==='function'){
    const baseShow=show;
    show=function(n){baseShow(n);saveState(n===3);};
  }

  const shared=readSharedResult();
  if(shared&&shared.expired){
    updateStatus(null,'共有リンクの90日間の有効期限が切れています');
    setTimeout(function(){alert('この共有リンクは90日間の有効期限を過ぎています。条件を入力してもう一度診断してください。')},50);
  }else{
    const initial=shared||readSaved();
    if(restoreInputs(initial)){
      if(shared){updateStatus(Date.now(),'共有された診断結果を表示しています')}
      else updateStatus(initial.savedAt);
      if(initial.hasResult){
        try{const errs=typeof validate==='function'&&typeof inputs==='function'?validate(inputs()):[];if(!errs||!errs.length)show(3)}catch(e){}
      }
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
    lines.push('','同じ診断結果を下のリンクから確認できます（90日間有効）。','※リンクには診断条件が含まれます。転送先にご注意ください。');
    return lines.join('\n');
  }

  async function shareResult(){
    saveState(true);
    const text=resultSummary();
    const url=makeShareUrl();
    try{
      if(navigator.share){await navigator.share({title:'ADCAST｜住宅予算チェック結果',text:text,url:url});return}
      if(navigator.clipboard){await navigator.clipboard.writeText(text+'\n'+url);updateStatus(Date.now(),'結果リンクをコピーしました。LINEやメールに貼り付けできます');return}
    }catch(e){if(e&&e.name==='AbortError')return}
    try{const ta=document.createElement('textarea');ta.value=text+'\n'+url;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();updateStatus(Date.now(),'結果リンクをコピーしました。LINEやメールに貼り付けできます')}catch(e){updateStatus(null,'共有できませんでした')}
  }

  let printDetailsState=[];
  function preparePrint(){
    printDetailsState=Array.from(document.querySelectorAll('details')).map(function(el){return {el:el,open:el.open}});
    printDetailsState.forEach(function(x){x.el.open=true});
    document.body.classList.add('resultPrintMode');
  }
  function restoreAfterPrint(){
    printDetailsState.forEach(function(x){x.el.open=x.open});
    printDetailsState=[];
    document.body.classList.remove('resultPrintMode');
  }
  window.addEventListener('afterprint',restoreAfterPrint);

  function printResultPage(){
    saveState(true);
    preparePrint();
    const oldTitle=document.title;
    const date=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'-');
    document.title='ADCAST_住宅予算チェック結果_'+date;
    try{window.print()}catch(e){restoreAfterPrint();updateStatus(null,'印刷画面を開けませんでした')}
    setTimeout(function(){document.title=oldTitle},1000);
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