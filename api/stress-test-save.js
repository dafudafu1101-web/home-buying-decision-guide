const baseHandler = require('./stress-test');

const SAVE_SHARE_CSS = `
.saveShareCard{border:1px solid #d9c28d;border-radius:18px;padding:17px;margin:18px 0;background:linear-gradient(180deg,#fffdf8,#fbf6e9)}
.saveShareCard h3{font-size:18px;margin:5px 0 7px}.saveShareCard>p{font-size:12px;line-height:1.65;color:#514b42;margin:0 0 12px}
.saveShareGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.saveShareBtn{border:1px solid #b88a2e;border-radius:12px;min-height:50px;padding:11px 9px;background:#fff;font-size:12px;font-weight:900;color:#2d2a26}.saveShareBtn.primarySave{background:linear-gradient(90deg,#a8781f,#d5b35e);border:none;color:#111}.saveShareBtn:disabled{opacity:.55}.saveMeta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;padding-top:9px;border-top:1px solid #e8dfcf}.saveStatus{font-size:10.5px;line-height:1.45;color:#756d62}.clearSaveBtn{border:0;background:transparent;text-decoration:underline;font-size:10.5px;color:#756d62;padding:5px 0;white-space:nowrap}.saveHint{font-size:10px!important;color:#7d756a!important;margin-top:8px!important}
.pdfRenderHost{position:fixed;left:-100000px;top:0;width:794px;background:#fff;z-index:-9999}.pdfRenderHost .screen{display:none!important}.pdfRenderHost .screen[data-step="3"]{display:block!important;padding:24px 20px 32px!important;min-height:auto!important}.pdfRenderHost .top{position:static!important}.pdfRenderHost .saveShareCard,.pdfRenderHost .nav,.pdfRenderHost #again,.pdfRenderHost .handoffOverlay,.pdfRenderHost .strategyButtons,.pdfRenderHost .selectPrompt,.pdfRenderHost .cta button,.pdfRenderHost .agentCard button{display:none!important}.pdfRenderHost details{display:block!important}.pdfRenderHost details>summary{display:none!important}.pdfRenderHost details>*:not(summary){display:block!important}.pdfRenderHost .resultHero,.pdfRenderHost .strategy,.pdfRenderHost .whyVisual,.pdfRenderHost details,.pdfRenderHost .portfolioCard,.pdfRenderHost .overCard,.pdfRenderHost .detailCard,.pdfRenderHost .netWorthCard,.pdfRenderHost .whyCard,.pdfRenderHost .agentCard,.pdfRenderHost .lpScope,.pdfRenderHost .lpChart,.pdfRenderHost .lpAllocation,.pdfRenderHost .lpAllocationCard,.pdfRenderHost .cta{break-inside:avoid;page-break-inside:avoid}.pdfRenderHost .choiceMargin{break-before:page;page-break-before:always}.pdfRenderHost .lifeplanPreview{break-before:page;page-break-before:always}.pdfRenderHost *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
@media(max-width:420px){.saveShareGrid{grid-template-columns:1fr}.saveShareBtn{min-height:47px}}
`;

const SAVE_SHARE_HTML = `
      <div class="saveShareCard" id="saveShareCard">
        <div class="kicker">RESULT SAVE</div>
        <h3>結果をあとで見直す・保存する</h3>
        <p>診断条件はこの端末に自動保存されます。PDFは印刷画面を経由せず、折りたたみをすべて開いた診断結果をファイルとして作成します。</p>
        <div class="saveShareGrid">
          <button type="button" class="saveShareBtn primarySave" id="resultPdfBtn">PDFを保存・共有</button>
          <button type="button" class="saveShareBtn" id="resultShareBtn">同じ結果をLINE・メールで共有</button>
        </div>
        <div class="saveMeta"><span class="saveStatus" id="resultSaveStatus">この端末に自動保存します</span><button type="button" class="clearSaveBtn" id="resultClearBtn">保存データを削除</button></div>
        <p class="saveHint">※共有結果は90日間有効です。共有リンクには診断条件が含まれるため、送信先をご確認ください。PDFは作成後にiPhoneの共有シートから「ファイルに保存」・LINE・メール等へ送れます。</p>
      </div>
`;

const SAVE_SHARE_JS = String.raw`
(function(){
  const STORAGE_KEY='adcast-housing-result-v1';
  const SHARE_DAYS=90;
  const HTML2PDF_SRC='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
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

  function bytesToB64url(bytes){let bin='';bytes.forEach(function(b){bin+=String.fromCharCode(b)});return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  function b64urlToBytes(str){const pad='='.repeat((4-str.length%4)%4);const bin=atob(str.replace(/-/g,'+').replace(/_/g,'/')+pad);return Uint8Array.from(bin,function(c){return c.charCodeAt(0)})}
  function utf8ToB64url(str){return bytesToB64url(new TextEncoder().encode(str))}
  function b64urlToUtf8(str){return new TextDecoder().decode(b64urlToBytes(str))}
  async function gzipEncode(str){
    if(typeof CompressionStream!=='function')return 'j.'+utf8ToB64url(str);
    try{const cs=new CompressionStream('gzip');const writer=cs.writable.getWriter();writer.write(new TextEncoder().encode(str));writer.close();const buf=await new Response(cs.readable).arrayBuffer();return 'g.'+bytesToB64url(new Uint8Array(buf))}catch(e){return 'j.'+utf8ToB64url(str)}
  }
  async function gzipDecode(token){
    if(token.indexOf('j.')===0)return b64urlToUtf8(token.slice(2));
    if(token.indexOf('g.')!==0)throw new Error('invalid token');
    const bytes=b64urlToBytes(token.slice(2));
    if(typeof DecompressionStream!=='function')throw new Error('unsupported compression');
    const ds=new DecompressionStream('gzip');const writer=ds.writable.getWriter();writer.write(bytes);writer.close();return await new Response(ds.readable).text();
  }
  async function makeShareUrl(){
    const payload={v:2,e:Date.now()+SHARE_DAYS*86400000,i:collectInputs()};
    const token=await gzipEncode(JSON.stringify(payload));
    return location.origin+location.pathname+'#r='+token;
  }
  async function readSharedResult(){
    try{
      if(location.hash.startsWith('#r=')){
        const payload=JSON.parse(await gzipDecode(location.hash.slice(3)));
        if(!payload||payload.v!==2||!payload.i)return null;
        if(!payload.e||Date.now()>payload.e)return {expired:true};
        return {inputs:payload.i,hasResult:true,savedAt:Date.now(),shared:true,exp:payload.e};
      }
      if(location.hash.startsWith('#result=')){
        const payload=JSON.parse(b64urlToUtf8(location.hash.slice(8)));
        if(!payload||payload.v!==1||!payload.inputs)return null;
        if(!payload.exp||Date.now()>payload.exp)return {expired:true};
        return {inputs:payload.inputs,hasResult:true,savedAt:Date.now(),shared:true,exp:payload.exp};
      }
    }catch(e){return null}
    return null;
  }

  step2.addEventListener('input',function(){saveState(false)});
  step2.addEventListener('change',function(){saveState(false)});

  if(typeof show==='function'){
    const baseShow=show;
    show=function(n){baseShow(n);saveState(n===3);};
  }

  (async function restoreOnLoad(){
    const shared=await readSharedResult();
    if(shared&&shared.expired){
      updateStatus(null,'共有リンクの90日間の有効期限が切れています');
      setTimeout(function(){alert('この共有リンクは90日間の有効期限を過ぎています。条件を入力してもう一度診断してください。')},50);
      return;
    }
    const initial=shared||readSaved();
    if(restoreInputs(initial)){
      if(shared){updateStatus(Date.now(),'共有された診断結果を表示しています')}
      else updateStatus(initial.savedAt);
      if(initial.hasResult){
        try{const errs=typeof validate==='function'&&typeof inputs==='function'?validate(inputs()):[];if(!errs||!errs.length)show(3)}catch(e){}
      }
    }
  })();

  function resultSummary(){
    const current=document.getElementById('currentPrice')?.textContent||'';
    const title=document.getElementById('zoneTitle')?.textContent||'';
    const margin=document.getElementById('marginText')?.textContent||'';
    const strategies=Array.from(document.querySelectorAll('#strategies .strategy')).map(function(card){
      const name=card.querySelector('.strategyName')?.textContent?.trim()||'';
      const price=card.querySelector('.strategyPrice')?.textContent?.trim()||'';
      return name+' '+price;
    });
    const lines=['ADCAST｜住宅予算チェック','現在検討価格：'+current,'結果：'+title];
    if(strategies.length)lines.push('','3つの比較ライン',...strategies);
    if(margin)lines.push('','現在価格との比較：'+margin);
    lines.push('','同じ診断結果をリンクから確認できます（90日間有効）。');
    return lines.join('\n');
  }

  async function shareResult(){
    saveState(true);
    shareBtn.disabled=true;updateStatus(Date.now(),'共有リンクを作成中…');
    try{
      const text=resultSummary();
      const url=await makeShareUrl();
      if(navigator.share){await navigator.share({title:'ADCAST｜住宅予算チェック結果',text:text,url:url});updateStatus(Date.now());return}
      if(navigator.clipboard){await navigator.clipboard.writeText(text+'\n'+url);updateStatus(Date.now(),'結果リンクをコピーしました');return}
      const ta=document.createElement('textarea');ta.value=text+'\n'+url;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();updateStatus(Date.now(),'結果リンクをコピーしました');
    }catch(e){if(!(e&&e.name==='AbortError'))updateStatus(null,'共有できませんでした')}
    finally{shareBtn.disabled=false}
  }

  function loadHtml2Pdf(){
    if(window.html2pdf)return Promise.resolve(window.html2pdf);
    return new Promise(function(resolve,reject){
      const existing=document.querySelector('script[data-html2pdf]');
      if(existing){existing.addEventListener('load',function(){resolve(window.html2pdf)});existing.addEventListener('error',reject);return}
      const s=document.createElement('script');s.src=HTML2PDF_SRC;s.async=true;s.dataset.html2pdf='1';s.onload=function(){resolve(window.html2pdf)};s.onerror=reject;document.head.appendChild(s);
    });
  }
  function makePdfHost(){
    const host=document.createElement('div');host.className='pdfRenderHost';
    const top=document.querySelector('.top');if(top)host.appendChild(top.cloneNode(true));
    const result=document.querySelector('.screen[data-step="3"]');if(!result)throw new Error('result screen not found');
    const clone=result.cloneNode(true);
    clone.classList.add('active');
    clone.querySelectorAll('details').forEach(function(el){el.open=true});
    clone.querySelectorAll('.saveShareCard,.nav,#again,.handoffOverlay,.strategyButtons,.selectPrompt,.cta button,.agentCard button').forEach(function(el){el.remove()});
    host.appendChild(clone);document.body.appendChild(host);return host;
  }
  async function createPdfBlob(){
    const html2pdf=await loadHtml2Pdf();
    const host=makePdfHost();
    try{
      const options={margin:[8,8,8,8],filename:'ADCAST_住宅予算チェック結果.pdf',image:{type:'jpeg',quality:.96},html2canvas:{scale:1.6,useCORS:true,backgroundColor:'#ffffff',scrollY:0},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['.strategy','.whyVisual','details','.portfolioCard','.overCard','.detailCard','.netWorthCard','.whyCard','.agentCard','.lpScope','.lpChart','.lpAllocation','.lpAllocationCard','.cta']}};
      return await html2pdf().set(options).from(host).toPdf().outputPdf('blob');
    }finally{host.remove()}
  }
  async function savePdf(){
    saveState(true);pdfBtn.disabled=true;updateStatus(Date.now(),'PDFを作成中…');
    try{
      const blob=await createPdfBlob();
      const date=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'-');
      const file=new File([blob],'ADCAST_住宅予算チェック結果_'+date+'.pdf',{type:'application/pdf'});
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({title:'ADCAST｜住宅予算チェック結果',files:[file]});updateStatus(Date.now());return;
      }
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},30000);updateStatus(Date.now(),'PDFを保存しました');
    }catch(e){if(!(e&&e.name==='AbortError'))updateStatus(null,'PDFを作成できませんでした。通信状況を確認してください')}
    finally{pdfBtn.disabled=false}
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