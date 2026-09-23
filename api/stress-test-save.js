const baseHandler = require('./stress-test');

const SAVE_SHARE_CSS = `
.saveShareCard{border:1px solid #d9c28d;border-radius:18px;padding:17px;margin:18px 0;background:linear-gradient(180deg,#fffdf8,#fbf6e9)}
.saveShareCard h3{font-size:18px;margin:5px 0 7px}.saveShareCard>p{font-size:12px;line-height:1.65;color:#514b42;margin:0 0 12px}
.saveShareGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.saveShareBtn{border:1px solid #b88a2e;border-radius:12px;min-height:50px;padding:11px 9px;background:#fff;font-size:12px;font-weight:900;color:#2d2a26}.saveShareBtn.primarySave{background:linear-gradient(90deg,#a8781f,#d5b35e);border:none;color:#111}.saveMeta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;padding-top:9px;border-top:1px solid #e8dfcf}.saveStatus{font-size:10.5px;line-height:1.45;color:#756d62}.clearSaveBtn{border:0;background:transparent;text-decoration:underline;font-size:10.5px;color:#756d62;padding:5px 0;white-space:nowrap}.saveHint{font-size:10px!important;color:#7d756a!important;margin-top:8px!important}
@media(max-width:420px){.saveShareGrid{grid-template-columns:1fr}.saveShareBtn{min-height:47px}}
@media print{.saveShareCard,.nav,.agentCard,.cta,.selectPrompt,#again,.handoffOverlay{display:none!important}}
`;

const SAVE_SHARE_HTML = `
      <div class="saveShareCard" id="saveShareCard">
        <div class="kicker">RESULT SAVE</div>
        <h3>結果をあとで見直す・共有する</h3>
        <p>診断条件はこの端末のブラウザに自動保存されます。次回このページを開くと、直近の結果をそのまま見直せます。</p>
        <div class="saveShareGrid">
          <button type="button" class="saveShareBtn primarySave" id="resultShareBtn">LINE・メールなどで共有</button>
          <button type="button" class="saveShareBtn" id="resultPdfBtn">PDFで保存・印刷</button>
        </div>
        <div class="saveMeta"><span class="saveStatus" id="resultSaveStatus">この端末に自動保存します</span><button type="button" class="clearSaveBtn" id="resultClearBtn">保存データを削除</button></div>
        <p class="saveHint">※保存先はこのブラウザ内です。サーバーへ保存しません。iPhoneのPDF保存は印刷画面から共有→「ファイルに保存」を選べます。</p>
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

  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
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
        const name=key.slice(6);const el=document.querySelector('input[name="'+name+'"][value="'+CSS.escape(String(value))+'"]');if(el)el.checked=true;
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
    lines.push('','この結果は簡易比較です。借入可能額・安全上限・将来価格を保証するものではありません。',location.origin+location.pathname);
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

  function pdfHtml(){
    const current=document.getElementById('currentPrice')?.textContent||'';
    const net=document.getElementById('netText')?.textContent||'';
    const cash=document.getElementById('postCashText')?.textContent||'';
    const investments=document.getElementById('postInvText')?.textContent||'';
    const title=document.getElementById('zoneTitle')?.textContent||'';
    const desc=document.getElementById('zoneText')?.textContent||'';
    const margin=document.getElementById('marginText')?.textContent||'';
    const strategies=Array.from(document.querySelectorAll('#strategies .strategy')).map(function(card){
      const name=card.querySelector('.strategyName')?.textContent?.trim()||'';
      const price=card.querySelector('.strategyPrice')?.textContent?.trim()||'';
      const monthly=Array.from(card.querySelectorAll('.pill')).find(function(x){return x.textContent.indexOf('月返済')>=0})?.lastElementChild?.textContent?.trim()||'';
      return '<div class="strategyPdf"><b>'+escapeHtml(name)+'</b><strong>'+escapeHtml(price)+'</strong><span>月返済 '+escapeHtml(monthly)+'</span></div>';
    }).join('');
    const scenarios=Array.from(document.querySelectorAll('#netWorthList .netWorthCard')).map(function(card){
      return '<div class="scenarioPdf"><b>'+escapeHtml(card.querySelector('b')?.textContent||'')+'</b><span>'+escapeHtml(card.querySelector('.nwFinal')?.textContent||'')+'</span></div>';
    }).join('');
    const date=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric'}).format(new Date());
    return '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>住宅予算チェック結果</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif;color:#161616;margin:0}.top{border-bottom:3px solid #b88a2e;padding-bottom:10px;margin-bottom:20px}.brand{font-size:22px;font-weight:900;letter-spacing:.08em}.sub{font-size:11px;color:#777;margin-top:4px}.hero{background:#181818;color:#fff;border-radius:16px;padding:18px;margin-bottom:16px}.hero h1{font-size:23px;margin:3px 0 8px}.hero p{font-size:12px;line-height:1.65;margin:0}.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:18px}.metric{border:1px solid #ddd6ca;border-radius:12px;padding:12px}.metric b{display:block;font-size:10px;color:#777}.metric strong{display:block;font-size:20px;margin-top:5px}.sectionTitle{font-size:17px;margin:18px 0 8px}.strategies{display:grid;gap:8px}.strategyPdf{border:1px solid #ddd6ca;border-radius:12px;padding:11px;display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center}.strategyPdf b{font-size:12px}.strategyPdf strong{font-size:18px}.strategyPdf span{font-size:10px;color:#666;grid-column:1/-1}.compare{background:#fbf4e4;border-left:4px solid #b88a2e;padding:10px 12px;margin:12px 0;font-size:12px;font-weight:700}.scenarios{display:grid;grid-template-columns:1fr 1fr;gap:7px}.scenarioPdf{border:1px solid #ddd6ca;border-radius:10px;padding:9px}.scenarioPdf b{font-size:10px;display:block}.scenarioPdf span{font-size:13px;display:block;margin-top:4px}.note{font-size:9px;line-height:1.6;color:#666;border-top:1px solid #ddd;margin-top:18px;padding-top:10px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="top"><div class="brand">ADCAST</div><div class="sub">住宅予算チェック結果｜'+escapeHtml(date)+'</div></div><div class="hero"><div>RESULT</div><h1>'+escapeHtml(title)+'</h1><p>'+escapeHtml(desc)+'</p></div><div class="metrics"><div class="metric"><b>現在検討している価格</b><strong>'+escapeHtml(current)+'</strong></div><div class="metric"><b>概算の年間手取り</b><strong>'+escapeHtml(net)+'</strong></div><div class="metric"><b>購入後に残る現金</b><strong>'+escapeHtml(cash)+'</strong></div><div class="metric"><b>購入後に残る投資資産</b><strong>'+escapeHtml(investments)+'</strong></div></div><h2 class="sectionTitle">3つの資産配分戦略</h2><div class="strategies">'+strategies+'</div><div class="compare">現在価格との比較：'+escapeHtml(margin)+'</div>'+(scenarios?'<h2 class="sectionTitle">10年後の住宅純資産シナリオ</h2><div class="scenarios">'+scenarios+'</div>':'')+'<p class="note">本資料は簡易比較の結果です。購入可否・借入可能額・将来の資産価値を保証するものではありません。実際の審査・金利・団信条件は金融機関ごとに異なります。</p></body></html>';
  }

  function savePdf(){
    saveState(true);
    const w=window.open('','_blank');
    if(!w){updateStatus(null,'PDF画面を開けませんでした。ポップアップ許可をご確認ください');return}
    w.document.open();w.document.write(pdfHtml());w.document.close();
    setTimeout(function(){try{w.focus();w.print()}catch(e){}},350);
  }

  shareBtn.addEventListener('click',shareResult);
  pdfBtn.addEventListener('click',savePdf);
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
