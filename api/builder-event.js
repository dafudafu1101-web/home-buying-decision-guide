const ALLOWED_ORIGINS=new Set(['https://jian-zhu-hui-she-bi-jiao-yi-lan.webflow.io']);
const EVENTS=new Set(['page_view','quick_filter','diagnosis_toggle','diagnosis_ready','interest_change','compare_open','compare_area','consult_open','consult_submit','consult_success','consult_error']);
function cors(req,res){const o=String(req.headers.origin||'');if(ALLOWED_ORIGINS.has(o)){res.setHeader('Access-Control-Allow-Origin',o);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');return true}return false}
function out(res,status,p){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(p))}
module.exports=async function handler(req,res){
 const ok=cors(req,res);
 if(req.method==='OPTIONS'){if(!ok)return out(res,403,{ok:false});res.statusCode=204;return res.end()}
 if(req.method!=='POST')return out(res,405,{ok:false});
 if(!ok)return out(res,403,{ok:false});
 let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch(_){b=null}}
 if(!b||!EVENTS.has(String(b.event||'')))return out(res,400,{ok:false});
 const clean={
   event:String(b.event).slice(0,60),
   sid:String(b.sid||'').slice(0,80),
   label:String(b.label||'').slice(0,160),
   companies:Array.isArray(b.companies)?b.companies.slice(0,3).map(x=>String(x).slice(0,120)):[],
   area:Number(b.area)||0,
   path:String(b.path||'').slice(0,300),
   ts:new Date().toISOString()
 };
 console.log('builder_event '+JSON.stringify(clean));
 return out(res,200,{ok:true});
};