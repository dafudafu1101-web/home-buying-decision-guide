const crypto=require('crypto');

const APPS_SCRIPT_WEB_APP_URL='https://script.google.com/macros/s/AKfycbwkOAbxi5o7m8CQfRFim_qCTS6UTSJHAi23mspmtYWHzLK-xpjZJhMn8p-okILukdkdWA/exec';
const MAX_BODY_BYTES=16000;
const RATE_WINDOW_MS=30*60*1000;
const RATE_MAX_REQUESTS=4;
const rateBuckets=globalThis.__resultEmailRateBuckets||new Map();
globalThis.__resultEmailRateBuckets=rateBuckets;

function json(res,status,payload){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(payload))}
function sameOrigin(req){const origin=req.headers.origin,host=req.headers['x-forwarded-host']||req.headers.host;if(!origin||!host)return false;try{return new URL(origin).host===host}catch(_){return false}}
function clientIp(req){return String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket?.remoteAddress||'unknown'}
function rateLimited(req){const now=Date.now(),ip=clientIp(req),cur=rateBuckets.get(ip);if(!cur||now-cur.startedAt>RATE_WINDOW_MS){rateBuckets.set(ip,{startedAt:now,count:1});return false}cur.count+=1;return cur.count>RATE_MAX_REQUESTS}
function parseBody(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string'){try{return JSON.parse(req.body)}catch(_){return null}}return null}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||''))&&String(v).length<=240}
function validAppsScriptUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='script.google.com'&&/\/macros\/s\/[^/]+\/exec$/.test(url.pathname)}catch(_){return false}}
function text(v,max=160){return String(v||'').trim().slice(0,max)}
function num(v,max=100000){const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,n)):0}
function yenMan(v){return Math.round(num(v)).toLocaleString('ja-JP')+'万円'}
function consultationLabels(interests){
  const seen=new Set((Array.isArray(interests)?interests:[]).map(x=>text(x&&x.mode,20)));
  return [
    'ローン相談：'+(seen.has('loan')?'確認あり':'なし'),
    '詳細ライフプラン相談：'+(seen.has('lifeplan')?'確認あり':'なし'),
    '物件・予算相談：'+(seen.has('property')?'確認あり':'なし')
  ];
}

module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  if(!sameOrigin(req))return json(res,403,{ok:false,error:'origin_not_allowed'});
  if(String(req.headers['sec-fetch-site']||'same-origin')==='cross-site')return json(res,403,{ok:false,error:'origin_not_allowed'});
  if(!String(req.headers['content-type']||'').toLowerCase().includes('application/json'))return json(res,415,{ok:false,error:'unsupported_media_type'});
  if(Number(req.headers['content-length']||0)>MAX_BODY_BYTES)return json(res,413,{ok:false,error:'payload_too_large'});
  if(rateLimited(req))return json(res,429,{ok:false,error:'rate_limited'});
  const body=parseBody(req);if(!body)return json(res,400,{ok:false,error:'invalid_json'});
  const email=text(body.email,240),eventId=text(body.eventId,128);
  if(!validEmail(email)||!eventId)return json(res,400,{ok:false,error:'invalid_input'});

  const b=body.basic||{},r=body.result||{};
  const basic={
    age:num(b.age,100),children:num(b.children,20),childStage:text(b.childStage,80),borrowMethod:text(b.borrowMethod,120),
    grossIncome:num(b.grossIncome),cash:num(b.cash),investments:num(b.investments),price:num(b.price),loanAmount:num(b.loanAmount),
    living:num(b.living,10000),rate:num(b.rate,20),term:num(b.term,50),netOverride:num(b.netOverride),rateType:text(b.rateType,80)
  };
  if(!(basic.age>=20&&basic.grossIncome>0&&basic.price>0))return json(res,400,{ok:false,error:'invalid_result'});
  const result={zone:text(r.zone,160),margin:text(r.margin,160),estimatedNet:num(r.estimatedNet),selectedStrategy:text(r.selectedStrategy,20)};
  const strategies=(Array.isArray(body.strategies)?body.strategies:[]).slice(0,3).map(x=>({
    key:text(x&&x.key,20),name:text(x&&x.name,100),price:num(x&&x.price),monthly:num(x&&x.monthly,10000),equity:num(x&&x.equity),postAssets:num(x&&x.postAssets)
  }));
  if(strategies.length!==3)return json(res,400,{ok:false,error:'invalid_strategies'});
  const interests=consultationLabels(body.interests);
  const selectedName=(strategies.find(x=>x.key===result.selectedStrategy)||{}).name||'未選択';

  const basicLines=[
    '主な借入予定者の年齢：'+basic.age+'歳',
    'お子さまの人数：'+basic.children+'人',
    'お子さまの年齢帯：'+(basic.childStage||'未入力'),
    '借入方法：'+(basic.borrowMethod||'未入力'),
    '世帯年収：'+yenMan(basic.grossIncome),
    '現金・預金：'+yenMan(basic.cash),
    '投資資産：'+yenMan(basic.investments),
    '現在検討している物件価格：'+yenMan(basic.price),
    '借入予定額：'+yenMan(basic.loanAmount),
    '住宅費を除く月間生活費：'+yenMan(basic.living),
    '現在金利：'+basic.rate+'%',
    '返済期間：'+basic.term+'年',
    '実際の年間手取り：'+(basic.netOverride?yenMan(basic.netOverride):'自動推計'),
    '金利タイプ：'+(basic.rateType||'未入力')
  ];
  const strategyLines=strategies.flatMap((x,i)=>[
    (i+1)+'｜'+x.name+'：'+yenMan(x.price),
    '　月返済 約'+yenMan(x.monthly)+' / 必要自己資金 '+yenMan(x.equity)+' / 購入後金融資産 '+yenMan(x.postAssets)
  ]);
  const customerBody=[
    'ADCAST｜3分 住宅予算の決め方チェック','',
    '今回の診断結果をお送りします。','',
    '【入力内容】',...basicLines,'',
    '【RESULT】',
    '診断ゾーン：'+(result.zone||'—'),
    '比較ライン：'+(result.margin||'—'),
    '概算の年間手取り：'+yenMan(result.estimatedNet),
    '今の感覚に近い資産配分：'+selectedName,'',
    '【3つの資産配分戦略】',...strategyLines,'',
    '※本メールは簡易診断の結果です。購入可否・借入可能額・将来の資産価値を保証するものではありません。'
  ].join('\n');
  const ownerBody=[
    '【住宅予算チェック｜結果送信通知】','',
    '診断結果送信先：'+email,'',
    '【相談ページの確認履歴】',...interests,'',
    '【入力された基本項目】',...basicLines,'',
    '【RESULT】',
    '診断ゾーン：'+(result.zone||'—'),
    '比較ライン：'+(result.margin||'—'),
    '概算の年間手取り：'+yenMan(result.estimatedNet),
    '選択中の資産配分：'+selectedName,'',
    '【3つの資産配分戦略】',...strategyLines,
    body.ref?'':'',
    body.ref?'受付ID：'+text(body.ref,160):''
  ].filter((x,i,a)=>x!==''||i===0||a[i-1]!=='').join('\n');

  const appsScriptUrl=process.env.APPS_SCRIPT_WEB_APP_URL||APPS_SCRIPT_WEB_APP_URL;
  if(!validAppsScriptUrl(appsScriptUrl))return json(res,503,{ok:false,error:'service_not_configured'});
  const requestId=crypto.createHash('sha256').update('result-email|'+eventId+'|'+email.toLowerCase()).digest('hex');
  try{
    const upstream=await fetch(appsScriptUrl,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({
      kind:'result_email',email,customerBody,ownerBody,requestId
    })});
    const raw=await upstream.text();let payload={};try{payload=JSON.parse(raw)}catch(_){}
    if(!upstream.ok||payload.ok!==true){console.error('result_email_delivery_failed',upstream.status,raw.slice(0,300));return json(res,502,{ok:false,error:'delivery_failed'})}
    return json(res,200,{ok:true});
  }catch(error){console.error('result_email_error',error);return json(res,502,{ok:false,error:'delivery_failed'})}
};