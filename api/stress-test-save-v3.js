const baseHandler = require('./stress-test-save-v2');

const PDF_CSS_PATCH = `.pdfRenderMask{position:fixed;inset:0;z-index:2147483647;background:rgba(255,255,255,.98);display:flex;align-items:center;justify-content:center;font:700 16px -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif;color:#2d2a26}.pdfRenderHost{position:absolute;left:0;top:0;width:794px;background:#fff;z-index:2147483646;pointer-events:none}`;

const SHARE_V3_FUNCTIONS = String.raw`function encNum(v){const n=Number(v||0);return Math.round(n*100).toString(36)}
  function decNum(v){const n=parseInt(v||'0',36);return Number.isFinite(n)?String(n/100):'0'}
  function compactShareToken(){
    const i=collectInputs();
    const stageMap={none:'0',preschool:'1',primary:'2',teen:'3',college:'4',mixed:'5',future:'6'};
    const expHour=Math.floor((Date.now()+SHARE_DAYS*86400000)/3600000).toString(36);
    return [
      '3',expHour,
      encNum(i.age),encNum(i.children),stageMap[i.childStage]||'0',
      i['radio:borrowMethod']==='pair'?'1':'0',
      encNum(i.grossIncome),encNum(i.cash),encNum(i.investments),encNum(i.price),encNum(i.loanAmount),encNum(i.living),
      encNum(i.rate),encNum(i.term),encNum(i.netOverride),i['radio:rateType']==='fixed'?'1':'0'
    ].join('~');
  }
  function unpackCompactShare(token){
    const p=String(token||'').split('~');
    if(p.length<16||p[0]!=='3')return null;
    const exp=parseInt(p[1],36)*3600000;
    if(!Number.isFinite(exp))return null;
    if(Date.now()>exp)return {expired:true};
    const stage=['none','preschool','primary','teen','college','mixed','future'][parseInt(p[4],10)]||'none';
    return {inputs:{
      age:decNum(p[2]),children:decNum(p[3]),childStage:stage,
      'radio:borrowMethod':p[5]==='1'?'pair':'single',
      grossIncome:decNum(p[6]),cash:decNum(p[7]),investments:decNum(p[8]),price:decNum(p[9]),loanAmount:decNum(p[10]),living:decNum(p[11]),
      rate:decNum(p[12]),term:decNum(p[13]),netOverride:decNum(p[14]),'radio:rateType':p[15]==='1'?'fixed':'variable'
    },hasResult:true,savedAt:Date.now(),shared:true,exp:exp};
  }
  async function makeShareUrl(){
    return location.origin+location.pathname+'#s='+compactShareToken();
  }
  async function readSharedResult(){
    try{
      if(location.hash.startsWith('#s='))return unpackCompactShare(location.hash.slice(3));
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
  }`;

const PDF_V3_FUNCTIONS = String.raw`function makePdfHost(){
    const mask=document.createElement('div');mask.className='pdfRenderMask';mask.textContent='PDFを作成しています…';document.body.appendChild(mask);
    const host=document.createElement('div');host.className='pdfRenderHost';
    const top=document.querySelector('.top');if(top)host.appendChild(top.cloneNode(true));
    const result=document.querySelector('.screen[data-step="3"]');if(!result){mask.remove();throw new Error('result screen not found')}
    const clone=result.cloneNode(true);
    clone.classList.add('active');
    clone.querySelectorAll('details').forEach(function(el){el.open=true});
    clone.querySelectorAll('.saveShareCard,.nav,#again,.handoffOverlay,.strategyButtons,.selectPrompt,.cta button,.agentCard button').forEach(function(el){el.remove()});
    host.appendChild(clone);document.body.appendChild(host);return {host:host,mask:mask};
  }
  async function createPdfBlob(){
    const html2pdf=await loadHtml2Pdf();
    const parts=makePdfHost();
    try{
      if(document.fonts&&document.fonts.ready)await document.fonts.ready;
      await new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve)})});
      const options={margin:[8,8,8,8],filename:'ADCAST_住宅予算チェック結果.pdf',image:{type:'jpeg',quality:.96},html2canvas:{scale:1.5,useCORS:true,backgroundColor:'#ffffff',scrollX:0,scrollY:0,windowWidth:794,logging:false},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['.strategy','.whyVisual','.portfolioCard','.overCard','.detailCard','.netWorthCard','.whyCard','.agentCard','.lpScope','.lpChart','.lpAllocation','.lpAllocationCard','.cta']}};
      return await html2pdf().set(options).from(parts.host).toPdf().outputPdf('blob');
    }finally{parts.host.remove();parts.mask.remove()}
  }`;

function patchHtml(html){
  if(typeof html!=='string')return html;
  let out=html;
  out=out.replace('.pdfRenderHost{position:fixed;left:-100000px;top:0;width:794px;background:#fff;z-index:-9999}',PDF_CSS_PATCH);
  out=out.replace(/async function makeShareUrl\(\)\{[\s\S]*?\n  \}\n  async function readSharedResult\(\)\{[\s\S]*?\n  \}/,SHARE_V3_FUNCTIONS);
  out=out.replace(/function makePdfHost\(\)\{[\s\S]*?\n  \}\n  async function createPdfBlob\(\)\{[\s\S]*?\n  \}/,PDF_V3_FUNCTIONS);
  return out;
}

module.exports = function handler(req,res){
  const originalEnd=res.end.bind(res);
  res.end=function(body,...args){
    if(res.statusCode===200&&typeof body==='string')body=patchHtml(body);
    return originalEnd(body,...args);
  };
  return baseHandler(req,res);
};
