(function(){
  'use strict';
  const SHARE_DAYS=90;
  const $=s=>document.querySelector(s);
  function num(id){const el=$(id);return el?Number(el.value||0):0}
  function val(id){const el=$(id);return el?String(el.value||''):''}
  function radio(name,def){const el=document.querySelector('input[name="'+name+'"]:checked');return el?el.value:def}
  function enc(v){return Math.round(Number(v||0)*100).toString(36)}
  function dec(v){const n=parseInt(v||'0',36);return Number.isFinite(n)?n/100:0}
  function token(snapshot){
    const stageMap={none:'0',preschool:'1',primary:'2',teen:'3',college:'4',mixed:'5',future:'6'};
    const strategyMap={safe:'1',balance:'2',housing:'3'};
    const exp=Math.floor((Date.now()+SHARE_DAYS*86400000)/3600000).toString(36);
    const selected=snapshot&&snapshot.result?snapshot.result.selectedStrategy:'';
    return ['4',exp,enc(num('#age')),enc(num('#children')),stageMap[val('#childStage')]||'0',radio('borrowMethod','single')==='pair'?'1':'0',enc(num('#grossIncome')),enc(num('#cash')),enc(num('#investments')),enc(num('#price')),enc(num('#loanAmount')),enc(num('#living')),enc(num('#rate')),enc(num('#term')),enc(num('#netOverride')),radio('rateType','variable')==='fixed'?'1':'0',strategyMap[selected]||'0'].join('~');
  }
  function unpack(t){
    const p=String(t||'').split('~');
    if(p.length<16||!['3','4'].includes(p[0]))return null;
    const exp=parseInt(p[1],36)*3600000;if(!Number.isFinite(exp))return null;
    if(Date.now()>exp)return {expired:true};
    const stages=['none','preschool','primary','teen','college','mixed','future'];
    const strategyMap={'1':'safe','2':'balance','3':'housing'};
    return {age:dec(p[2]),children:dec(p[3]),childStage:stages[parseInt(p[4],10)]||'none',borrowMethod:p[5]==='1'?'pair':'single',gross:dec(p[6]),cash:dec(p[7]),investments:dec(p[8]),price:dec(p[9]),loanAmount:dec(p[10]),living:dec(p[11]),rate:dec(p[12]),term:dec(p[13]),netOverride:dec(p[14]),rateType:p[15]==='1'?'fixed':'variable',selected:p[0]==='4'?(strategyMap[p[16]]||''):''};
  }
  function apply(v){
    const set=(id,x)=>{const el=$(id);if(el)el.value=x};
    set('#age',v.age);set('#children',v.children);set('#childStage',v.childStage);set('#grossIncome',v.gross);set('#cash',v.cash);set('#investments',v.investments);set('#price',v.price);set('#loanAmount',v.loanAmount);set('#living',v.living);set('#rate',v.rate);set('#term',v.term);set('#netOverride',v.netOverride);
    const bm=document.querySelector('input[name="borrowMethod"][value="'+v.borrowMethod+'"]');if(bm)bm.checked=true;
    const rt=document.querySelector('input[name="rateType"][value="'+v.rateType+'"]');if(rt)rt.checked=true;
    try{window.syncChildStage&&window.syncChildStage();window.syncBorrowMethod&&window.syncBorrowMethod();window.normalizeTermForAge&&window.normalizeTermForAge();window.liveCalc&&window.liveCalc()}catch(_){}
  }
  function restore(){
    const sharedToken=new URLSearchParams(location.search).get('s')||(location.hash.startsWith('#s=')?location.hash.slice(3):'');
    if(!sharedToken)return;
    const v=unpack(sharedToken);if(!v)return;
    if(v.expired){setTimeout(()=>alert('この診断結果URLは90日間の有効期限を過ぎています。新しく診断してください。'),50);return}
    apply(v);
    try{
      if(typeof window.inputs==='function'&&typeof window.validate==='function'){
        const errs=window.validate(window.inputs());if(errs&&errs.length)return;
      }
      if(typeof window.show==='function')window.show(3);
      const resultScreen=document.querySelector('.screen[data-step="3"]');
      if(resultScreen&&!resultScreen.classList.contains('active')){
        document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s===resultScreen));
        const count=document.querySelector('#count');if(count)count.textContent='3 / 3';
        const bar=document.querySelector('#bar');if(bar)bar.style.width='100%';
        const back=document.querySelector('#back');if(back)back.style.visibility='visible';
        const nav=document.querySelector('#nav');if(nav)nav.classList.add('hidden');
        if(typeof window.render==='function')window.render();
        window.scrollTo({top:0,left:0,behavior:'auto'});
      }
    }catch(_){}
    setTimeout(()=>{
      const resultScreen=document.querySelector('.screen[data-step="3"]');
      const expandResultDetails=()=>{
        if(!resultScreen)return;
        resultScreen.querySelectorAll('details').forEach(detail=>{detail.open=true;detail.setAttribute('open','')});
        resultScreen.scrollTop=0;
      };
      let expandObserver=null;
      if(resultScreen&&typeof MutationObserver!=='undefined'){
        expandObserver=new MutationObserver(()=>expandResultDetails());
        expandObserver.observe(resultScreen,{subtree:true,attributes:true,attributeFilter:['open']});
        setTimeout(()=>expandObserver&&expandObserver.disconnect(),5000);
      }
      expandResultDetails();
      try{
        if(v.selected){
          const el=document.querySelector('[data-choice="'+v.selected+'"]');if(el)el.click();
        }
      }catch(_){}
      expandResultDetails();
      setTimeout(expandResultDetails,120);
      setTimeout(expandResultDetails,450);
      setTimeout(expandResultDetails,1200);
      setTimeout(expandResultDetails,2500);
      window.scrollTo({top:0,left:0,behavior:'auto'});
    },0);
  }
  window.RESULT_LINK_VERSION='20260930-0210';
  window.createHousingResultToken=token;
  document.addEventListener('DOMContentLoaded',restore);
})();
// RESULT email-link restore verified target: full RESULT with all details expanded.
