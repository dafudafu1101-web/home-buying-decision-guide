const baseHandler = require('./stress-test-save');

const EXTRA_CSS = `.resumeResultCard{margin:14px 0 0;border:1px solid #d9c28d;border-radius:14px;padding:12px 13px;background:#fffaf0}.resumeResultCard b{display:block;font-size:13px;margin-bottom:6px}.resumeResultActions{display:flex;gap:8px}.resumeResultActions button{flex:1;border-radius:10px;padding:10px 8px;font-size:11px;font-weight:800;border:1px solid #b88a2e;background:#fff}.resumeResultActions .primary{background:linear-gradient(90deg,#a8781f,#d5b35e);color:#111;border:none}`;

const SHARE_PATCH = String.raw`function encNum(v){const n=Number(v||0);return Math.round(n*100).toString(36)}
  function decNum(v){const n=parseInt(v||'0',36);return Number.isFinite(n)?String(n/100):'0'}
  function compactShareToken(){
    const i=collectInputs();
    const stageMap={none:'0',preschool:'1',primary:'2',teen:'3',college:'4',mixed:'5',future:'6'};
    const expHour=Math.floor((Date.now()+SHARE_DAYS*86400000)/3600000).toString(36);
    return ['3',expHour,encNum(i.age),encNum(i.children),stageMap[i.childStage]||'0',i['radio:borrowMethod']==='pair'?'1':'0',encNum(i.grossIncome),encNum(i.cash),encNum(i.investments),encNum(i.price),encNum(i.loanAmount),encNum(i.living),encNum(i.rate),encNum(i.term),encNum(i.netOverride),i['radio:rateType']==='fixed'?'1':'0'].join('~');
  }
  function unpackCompactShare(token){
    const p=String(token||'').split('~');
    if(p.length<16||p[0]!=='3')return null;
    const exp=parseInt(p[1],36)*3600000;
    if(!Number.isFinite(exp))return null;
    if(Date.now()>exp)return {expired:true};
    const stage=['none','preschool','primary','teen','college','mixed','future'][parseInt(p[4],10)]||'none';
    return {inputs:{age:decNum(p[2]),children:decNum(p[3]),childStage:stage,'radio:borrowMethod':p[5]==='1'?'pair':'single',grossIncome:decNum(p[6]),cash:decNum(p[7]),investments:decNum(p[8]),price:decNum(p[9]),loanAmount:decNum(p[10]),living:decNum(p[11]),rate:decNum(p[12]),term:decNum(p[13]),netOverride:decNum(p[14]),'radio:rateType':p[15]==='1'?'fixed':'variable'},hasResult:true,savedAt:Date.now(),shared:true,exp:exp};
  }
  async function makeShareUrl(){return location.origin+location.pathname+'#s='+compactShareToken()}
  async function readSharedResult(){
    try{
      if(location.hash.startsWith('#s='))return unpackCompactShare(location.hash.slice(3));
      if(location.hash.startsWith('#r=')){
        const payload=JSON.parse(await gzipDecode(location.hash.slice(3)));
        if(!payload||payload.v!==2||!payload.i)return null;if(!payload.e||Date.now()>payload.e)return {expired:true};
        return {inputs:payload.i,hasResult:true,savedAt:Date.now(),shared:true,exp:payload.e};
      }
      if(location.hash.startsWith('#result=')){
        const payload=JSON.parse(b64urlToUtf8(location.hash.slice(8)));
        if(!payload||payload.v!==1||!payload.inputs)return null;if(!payload.exp||Date.now()>payload.exp)return {expired:true};
        return {inputs:payload.inputs,hasResult:true,savedAt:Date.now(),shared:true,exp:payload.exp};
      }
    }catch(e){return null}
    return null;
  }`;

const RESTORE_PATCH = String.raw`if(shared){
      if(restoreInputs(shared)){
        updateStatus(Date.now(),'共有された診断結果を表示しています');
        if(shared.hasResult){try{const errs=typeof validate==='function'&&typeof inputs==='function'?validate(inputs()):[];if(!errs||!errs.length){if(typeof render==='function')render();show(3)}}catch(e){}}
      }
      return;
    }
    const previous=readSaved();
    if(previous&&previous.hasResult){
      const heroBottom=document.querySelector('.screen[data-step="1"] .heroBottom');
      if(heroBottom&&!document.getElementById('resumeResultCard')){
        const card=document.createElement('div');card.className='resumeResultCard';card.id='resumeResultCard';
        card.innerHTML='<b>前回の診断結果があります</b><div class="resumeResultActions"><button type="button" class="primary" id="resumeLastResult">前回の結果を見る</button><button type="button" id="startNewResult">新しく診断する</button></div>';
        heroBottom.insertBefore(card,heroBottom.firstChild);
        document.getElementById('resumeLastResult').addEventListener('click',function(){
          if(restoreInputs(previous)){try{const errs=typeof validate==='function'&&typeof inputs==='function'?validate(inputs()):[];if(!errs||!errs.length){if(typeof render==='function')render();show(3)}else show(2)}catch(e){show(2)}}
        });
        document.getElementById('startNewResult').addEventListener('click',function(){try{localStorage.removeItem(STORAGE_KEY)}catch(e){}card.remove()});
      }
    }`;

const PDF_PATCH = String.raw`async function savePdf(){
    saveState(true);pdfBtn.disabled=true;updateStatus(Date.now(),'PDFを作成中…');
    try{
      const token=compactShareToken();
      const response=await fetch('/api/result-pdf?token='+encodeURIComponent(token),{method:'GET',cache:'no-store'});
      if(!response.ok)throw new Error('PDF '+response.status);
      const blob=await response.blob();if(!blob||blob.size<1000)throw new Error('empty PDF');
      const date=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'-');
      const file=new File([blob],'ADCAST_住宅予算チェック結果_'+date+'.pdf',{type:'application/pdf'});
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({title:'ADCAST｜住宅予算チェック結果',files:[file]});updateStatus(Date.now());return}
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},30000);updateStatus(Date.now(),'PDFを保存しました');
    }catch(e){if(!(e&&e.name==='AbortError'))updateStatus(null,'PDFを作成できませんでした。もう一度お試しください')}
    finally{pdfBtn.disabled=false}
  }`;

function patchHtml(html){
  if(typeof html!=='string')return html;
  let out=html.replace('</head>',`<style>${EXTRA_CSS}</style></head>`);
  out=out.replace(/async function makeShareUrl\(\)\{[\s\S]*?\n  \}\n  async function readSharedResult\(\)\{[\s\S]*?\n  \}/,SHARE_PATCH);
  out=out.replace(/const initial=shared\|\|readSaved\(\);[\s\S]*?\n    \}/,RESTORE_PATCH);
  out=out.replace(/async function savePdf\(\)\{[\s\S]*?\n  \}/,PDF_PATCH);
  return out;
}

module.exports = function handler(req,res){
  const originalEnd=res.end.bind(res);
  res.end=function(body,...args){if(res.statusCode===200&&typeof body==='string')body=patchHtml(body);return originalEnd(body,...args)};
  return baseHandler(req,res);
};
