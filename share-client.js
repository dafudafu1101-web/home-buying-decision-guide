(function(){
  'use strict';
  const SHARE_DAYS=90;
  const $=s=>document.querySelector(s);
  const status=msg=>{const el=$('#shareStatus');if(el)el.textContent=msg||''};
  function num(id){const el=$(id);return el?Number(el.value||0):0}
  function val(id){const el=$(id);return el?String(el.value||''):''}
  function radio(name,def){const el=document.querySelector('input[name="'+name+'"]:checked');return el?el.value:def}
  function enc(v){return Math.round(Number(v||0)*100).toString(36)}
  function dec(v){const n=parseInt(v||'0',36);return Number.isFinite(n)?n/100:0}
  function token(){
    const stageMap={none:'0',preschool:'1',primary:'2',teen:'3',college:'4',mixed:'5',future:'6'};
    const exp=Math.floor((Date.now()+SHARE_DAYS*86400000)/3600000).toString(36);
    return ['3',exp,enc(num('#age')),enc(num('#children')),stageMap[val('#childStage')]||'0',radio('borrowMethod','single')==='pair'?'1':'0',enc(num('#grossIncome')),enc(num('#cash')),enc(num('#investments')),enc(num('#price')),enc(num('#loanAmount')),enc(num('#living')),enc(num('#rate')),enc(num('#term')),enc(num('#netOverride')),radio('rateType','variable')==='fixed'?'1':'0'].join('~');
  }
  function shareUrl(){return location.origin+location.pathname+'#s='+token()}
  function summary(){
    const current=$('#currentPrice')?.textContent?.trim()||((num('#price')||0).toLocaleString('ja-JP')+'万円');
    const result=$('#zoneTitle')?.textContent?.trim()||'住宅予算チェック結果';
    return ['ADCAST｜3分 住宅予算の決め方チェック','現在の検討価格：'+current,'診断結果：'+result,'同じ診断結果をリンクから確認できます（90日間有効）。'].join('\n');
  }
  function refreshLinks(){
    const line=$('#shareLine'),mail=$('#shareMail');
    if(!line&&!mail)return;
    const url=shareUrl();
    const text=summary();
    if(line)line.href='https://line.me/R/share?text='+encodeURIComponent(text+'\n'+url);
    if(mail)mail.href='mailto:?subject='+encodeURIComponent('住宅予算チェックの診断結果')+'&body='+encodeURIComponent(text+'\n\n診断ページ：'+url);
    status('共有リンクの準備ができました。');
  }
  function unpack(t){
    const p=String(t||'').split('~');
    if(p.length<16||p[0]!=='3')return null;
    const exp=parseInt(p[1],36)*3600000;
    if(!Number.isFinite(exp))return null;
    if(Date.now()>exp)return {expired:true};
    const stages=['none','preschool','primary','teen','college','mixed','future'];
    return {age:dec(p[2]),children:dec(p[3]),childStage:stages[parseInt(p[4],10)]||'none',borrowMethod:p[5]==='1'?'pair':'single',gross:dec(p[6]),cash:dec(p[7]),investments:dec(p[8]),price:dec(p[9]),loanAmount:dec(p[10]),living:dec(p[11]),rate:dec(p[12]),term:dec(p[13]),netOverride:dec(p[14]),rateType:p[15]==='1'?'fixed':'variable'};
  }
  function apply(v){
    const set=(id,x)=>{const el=$(id);if(el)el.value=x};
    set('#age',v.age);set('#children',v.children);set('#childStage',v.childStage);set('#grossIncome',v.gross);set('#cash',v.cash);set('#investments',v.investments);set('#price',v.price);set('#loanAmount',v.loanAmount);set('#living',v.living);set('#rate',v.rate);set('#term',v.term);set('#netOverride',v.netOverride);
    const bm=document.querySelector('input[name="borrowMethod"][value="'+v.borrowMethod+'"]');if(bm)bm.checked=true;
    const rt=document.querySelector('input[name="rateType"][value="'+v.rateType+'"]');if(rt)rt.checked=true;
    try{window.syncChildStage&&window.syncChildStage();window.syncBorrowMethod&&window.syncBorrowMethod();window.normalizeTermForAge&&window.normalizeTermForAge();window.liveCalc&&window.liveCalc()}catch(_){ }
  }
  function restore(){
    if(!location.hash.startsWith('#s='))return;
    const v=unpack(location.hash.slice(3));
    if(!v)return;
    if(v.expired){setTimeout(()=>alert('この共有結果は90日間の有効期限を過ぎています。新しく診断してください。'),50);return}
    apply(v);
    try{
      if(typeof window.inputs==='function'&&typeof window.validate==='function'){
        const errs=window.validate(window.inputs());if(errs&&errs.length)return;
      }
      if(typeof window.show==='function')window.show(3);
    }catch(_){ }
    setTimeout(refreshLinks,0);
  }
  function bind(){
    const line=$('#shareLine'),mail=$('#shareMail');
    if(line&&!line.dataset.shareBound){line.dataset.shareBound='1';line.addEventListener('touchstart',refreshLinks,{passive:true});line.addEventListener('click',refreshLinks,false)}
    if(mail&&!mail.dataset.shareBound){mail.dataset.shareBound='1';mail.addEventListener('touchstart',refreshLinks,{passive:true});mail.addEventListener('click',refreshLinks,false)}
    const again=$('#again');if(again&&!again.dataset.shareResetBound){again.dataset.shareResetBound='1';again.addEventListener('click',()=>{if(location.hash.startsWith('#s='))history.replaceState(null,'',location.pathname+location.search)},true)}
    document.addEventListener('input',refreshLinks,{passive:true});
    document.addEventListener('change',refreshLinks,{passive:true});
    refreshLinks();
  }
  bind();
  document.addEventListener('DOMContentLoaded',function(){bind();restore()});
  window.addEventListener('pageshow',refreshLinks);
})();
