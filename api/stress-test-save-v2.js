const baseHandler = require('./stress-test-save');

const UX_PATCH = String.raw`
<style>
.resumeResultBox{margin:12px 0 0;padding:11px 12px;border:1px solid #d9c28d;border-radius:12px;background:#fffaf0;text-align:center}
.resumeResultBox p{margin:0 0 7px;font-size:11px;color:#6f6658}.resumeResultBox button{width:100%;min-height:44px;border:1px solid #b88a2e;border-radius:10px;background:#fff;font-weight:900;color:#2d2a26}
.saveShareGrid{grid-template-columns:1fr!important}
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

  function resetInputsToDefaults(){
    const step2=document.querySelector('.screen[data-step="2"]');
    if(!step2)return;
    step2.querySelectorAll('input,select').forEach(function(el){
      if(el.type==='radio'||el.type==='checkbox')el.checked=el.defaultChecked;
      else if(el.tagName==='SELECT'){
        const idx=Array.from(el.options).findIndex(function(o){return o.defaultSelected});el.selectedIndex=idx>=0?idx:0;
      }else el.value=el.defaultValue||'';
    });
    try{if(typeof syncChildStage==='function')syncChildStage();if(typeof syncBorrowMethod==='function')syncBorrowMethod();if(typeof liveCalc==='function')liveCalc()}catch(e){}
  }

  function showStartWithoutSaving(){
    try{step=1}catch(e){}
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});
    const first=document.querySelector('.screen[data-step="1"]');if(first)first.classList.add('active');
    const count=document.getElementById('count');if(count)count.textContent='1 / 3';
    const bar=document.getElementById('bar');if(bar)bar.style.width='33.333%';
    resetInputsToDefaults();
    window.scrollTo({top:0,behavior:'auto'});
  }

  function addResumeButton(){
    if(!(saved&&saved.hasResult))return;
    const host=document.querySelector('.screen[data-step="1"] .heroBottom');
    if(!host||document.getElementById('resumeSavedResult'))return;
    const box=document.createElement('div');
    box.className='resumeResultBox';
    box.innerHTML='<p>この端末に前回の診断結果があります</p><button type="button" id="resumeSavedResult">前回の結果を見る</button>';
    host.insertBefore(box,host.firstChild);
    box.querySelector('button').addEventListener('click',function(){
      if(!restoreSavedInputs(saved))return;
      try{if(typeof render==='function')render();if(typeof show==='function')show(3)}catch(e){}
      window.scrollTo({top:0,behavior:'auto'});
    });
  }

  function removePdfUi(){
    const pdfBtn=document.getElementById('resultPdfBtn');if(pdfBtn)pdfBtn.remove();
    const card=document.getElementById('saveShareCard');
    if(!card)return;
    const title=card.querySelector('h3');if(title)title.textContent='結果をあとで見直す・共有する';
    const intro=card.querySelector(':scope > p');if(intro)intro.textContent='診断結果はこの端末に保存されます。LINE・メールでは、同じ診断結果を90日間有効のリンクで共有できます。';
    const hint=card.querySelector('.saveHint');if(hint)hint.textContent='※共有リンクは90日間有効です。リンクには診断条件が含まれるため、送信先をご確認ください。';
    const shareBtn=document.getElementById('resultShareBtn');if(shareBtn)shareBtn.textContent='同じ結果をLINE・メールで共有';
  }

  removePdfUi();

  if(!hasSharedHash){
    setTimeout(function(){showStartWithoutSaving();addResumeButton()},80);
    window.addEventListener('pageshow',function(ev){
      if(ev.persisted)setTimeout(function(){showStartWithoutSaving();addResumeButton()},0);
    });
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