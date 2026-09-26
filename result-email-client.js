(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const EMAIL_KEY='housing_result_email_v1';
  function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||''))}
  function status(message,type){
    const el=$('#shareStatus');if(!el)return;
    el.textContent=message||'';el.classList.remove('ok','error');if(type)el.classList.add(type);
  }
  function savedEmail(){
    try{return localStorage.getItem(EMAIL_KEY)||''}catch(_){return ''}
  }
  function saveEmail(email){
    try{localStorage.setItem(EMAIL_KEY,email)}catch(_){}
  }
  async function send(){
    const input=$('#resultEmail'),button=$('#resultEmailSend');
    if(!input||!button)return;
    const email=input.value.trim();
    if(!validEmail(email)){status('送信先メールアドレスをご確認ください。','error');input.focus();return}
    if(typeof window.getHousingResultSnapshot!=='function'){status('診断結果を取得できませんでした。もう一度診断してください。','error');return}
    const snapshot=window.getHousingResultSnapshot();
    if(!snapshot){status('診断結果を取得できませんでした。もう一度診断してください。','error');return}
    button.disabled=true;status('診断結果を送信しています…');
    try{
      const eventId=(window.crypto&&window.crypto.randomUUID)?window.crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);
      const response=await fetch('/api/result-email',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,eventId,...snapshot})
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||payload.ok!==true)throw new Error(payload.error||'send_failed');
      saveEmail(email);
      status('診断結果をメールで送信しました。受信トレイをご確認ください。','ok');
    }catch(_){
      status('送信できませんでした。時間をおいてもう一度お試しください。','error');
    }finally{button.disabled=false}
  }
  function bind(){
    const input=$('#resultEmail'),button=$('#resultEmailSend');
    if(!input||!button||button.dataset.bound)return;
    button.dataset.bound='1';
    const remembered=savedEmail();if(remembered&&!input.value)input.value=remembered;
    button.addEventListener('click',send);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();send()}});
  }
  bind();
  document.addEventListener('DOMContentLoaded',bind);
})();