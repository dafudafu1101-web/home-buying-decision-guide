const baseHandler = require('./stress-test-save');

const UX_PATCH = String.raw`
<style>
.resumeResultBox{margin:12px 0 0;padding:11px 12px;border:1px solid #d9c28d;border-radius:12px;background:#fffaf0;text-align:center}
.resumeResultBox p{margin:0 0 7px;font-size:11px;color:#6f6658}.resumeResultBox button{width:100%;min-height:44px;border:1px solid #b88a2e;border-radius:10px;background:#fff;font-weight:900;color:#2d2a26}
</style>
<script>
(function(){
  const STORAGE_KEY='adcast-housing-result-v1';
  const hasSharedHash=location.hash.startsWith('#r=')||location.hash.startsWith('#result=');
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(e){return null}})();

  function restoreSavedInputs(snapshot){
    if(!snapshot||!snapshot.inputs)return false;
    Object.keys(snapshot.inputs).forEach(function(key){
      const value=snapshot.inputs[key];
      if(key.indexOf('radio:')===0){
        const name=key.slice(6);
        document.querySelectorAll('input[name="'+name+'"]').forEach(function(el){el.checked=String(el.value)===String(value)});
      }else{
        const el=document.getElementById(key);if(el)el.value=value;
      }
    });
    try{if(typeof syncChildStage==='function')syncChildStage();if(typeof syncBorrowMethod==='function')syncBorrowMethod();if(typeof liveCalc==='function')liveCalc()}catch(e){}
    return true;
  }

  if(!hasSharedHash){
    setTimeout(function(){
      try{
        if(typeof show==='function')show(1);
        const step2=document.querySelector('.screen[data-step="2"]');
        if(step2){
          step2.querySelectorAll('input,select').forEach(function(el){
            if(el.type==='radio'||el.type==='checkbox')el.checked=el.defaultChecked;
            else if(el.tagName==='SELECT'){
              const idx=Array.from(el.options).findIndex(function(o){return o.defaultSelected});el.selectedIndex=idx>=0?idx:0;
            }else el.value=el.defaultValue||'';
          });
          try{if(typeof syncChildStage==='function')syncChildStage();if(typeof syncBorrowMethod==='function')syncBorrowMethod();if(typeof liveCalc==='function')liveCalc()}catch(e){}
        }
        if(saved&&saved.hasResult){
          const host=document.querySelector('.screen[data-step="1"] .heroBottom');
          if(host&&!document.getElementById('resumeSavedResult')){
            const box=document.createElement('div');box.className='resumeResultBox';box.innerHTML='<p>この端末に前回の診断結果があります</p><button type="button" id="resumeSavedResult">前回の診断結果を見る</button>';
            host.insertBefore(box,host.firstChild);
            box.querySelector('button').addEventListener('click',function(){
              if(!restoreSavedInputs(saved))return;
              try{if(typeof render==='function')render();if(typeof show==='function')show(3)}catch(e){}
              window.scrollTo({top:0,behavior:'auto'});
            });
          }
        }
      }catch(e){}
    },0);
  }

  const pdfBtn=document.getElementById('resultPdfBtn');
  if(pdfBtn){
    pdfBtn.addEventListener('click',async function(ev){
      ev.preventDefault();ev.stopImmediatePropagation();
      const oldText=pdfBtn.textContent;pdfBtn.disabled=true;pdfBtn.textContent='PDFを作成中…';
      try{
        const step2=document.querySelector('.screen[data-step="2"]');
        const inputs={};
        step2&&step2.querySelectorAll('input,select').forEach(function(el){
          if(!el.id&&!el.name)return;
          if(el.type==='radio'){if(el.checked)inputs['radio:'+el.name]=el.value}
          else if(el.type!=='button')inputs[el.id||el.name]=el.value;
        });
        const payload={v:1,exp:Date.now()+90*86400000,inputs:inputs};
        const bytes=new TextEncoder().encode(JSON.stringify(payload));let bin='';bytes.forEach(function(b){bin+=String.fromCharCode(b)});
        const token=btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
        const resp=await fetch('/api/result-pdf?legacy=1&token='+encodeURIComponent(token),{cache:'no-store'});
        if(!resp.ok)throw new Error('PDF '+resp.status);
        const blob=await resp.blob();
        const date=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'-');
        const file=new File([blob],'ADCAST_住宅予算チェック結果_'+date+'.pdf',{type:'application/pdf'});
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
          await navigator.share({title:'ADCAST｜住宅予算チェック結果',files:[file]});
        }else{
          const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},30000);
        }
      }catch(e){
        if(!(e&&e.name==='AbortError'))alert('PDFを作成できませんでした。少し時間をおいてもう一度お試しください。');
      }finally{pdfBtn.disabled=false;pdfBtn.textContent=oldText}
    },true);
  }
})();
</script>`;

function patch(html){
  if(typeof html!=='string'||!html.includes('</body>'))return html;
  return html.replace('</body>',UX_PATCH+'\n</body>');
}

module.exports = function handler(req,res){
  const originalEnd=res.end.bind(res);
  res.end=function(body,...args){
    if(res.statusCode===200&&typeof body==='string')body=patch(body);
    return originalEnd(body,...args);
  };
  return baseHandler(req,res);
};
