const baseHandler = require('./stress-test-save');

const PDF_V2_FUNCTION = String.raw`function pdfHtml(){
    const current=document.getElementById('currentPrice')?.textContent||'';
    const gross=document.getElementById('gross')?.value?Number(document.getElementById('gross').value):0;
    const net=document.getElementById('netText')?.textContent||'';
    const cash=document.getElementById('postCashText')?.textContent||'';
    const investments=document.getElementById('postInvText')?.textContent||'';
    const totalAssets=document.getElementById('postTotalText')?.textContent||'';
    const title=document.getElementById('zoneTitle')?.textContent||'';
    const desc=document.getElementById('zoneText')?.textContent||'';
    const margin=document.getElementById('marginText')?.textContent||'';
    const marginNote=document.getElementById('marginDisclaimer')?.textContent||'';
    const rate=document.getElementById('rate')?.value||'';
    const term=document.getElementById('term')?.value||'';
    const equity=document.getElementById('equityText')?.textContent||'';
    const strategyCards=Array.from(document.querySelectorAll('#strategies .strategy'));
    const strategyNotes=['家計余力を残しやすい','希望条件と返済のバランス','住宅条件を優先する配分'];
    const strategies=strategyCards.map(function(card,i){
      const name=card.querySelector('.strategyName')?.textContent?.trim()||'';
      const price=card.querySelector('.strategyPrice')?.textContent?.trim()||'';
      const monthly=Array.from(card.querySelectorAll('.pill')).find(function(x){return x.textContent.indexOf('月返済')>=0})?.lastElementChild?.textContent?.trim()||'';
      return '<div class="strategyPdf"><div><b>'+escapeHtml(name)+'</b><span>'+escapeHtml(strategyNotes[i]||'')+'</span></div><div class="strategyNums"><strong>'+escapeHtml(price)+'</strong><small>月返済 '+escapeHtml(monthly)+'</small></div></div>';
    }).join('');
    const housingLine=strategyCards[2]?.querySelector('.strategyPrice')?.textContent?.trim()||'';
    const housingMonthly=Array.from(strategyCards[2]?.querySelectorAll('.pill')||[]).find(function(x){return x.textContent.indexOf('月返済')>=0})?.lastElementChild?.textContent?.trim()||'';
    const scenarios=Array.from(document.querySelectorAll('#netWorthList .netWorthCard')).map(function(card){
      return '<div class="scenarioPdf"><b>'+escapeHtml(card.querySelector('b')?.textContent||'')+'</b><span>'+escapeHtml(card.querySelector('.nwFinal')?.textContent||'')+'</span></div>';
    }).join('');
    const date=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric'}).format(new Date());
    const grossText=gross?gross.toLocaleString('ja-JP')+'万円':'—';
    const mainMonthly=housingMonthly||'—';
    const summaryCopy=marginNote||desc;
    return '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>住宅予算チェック結果</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif;color:#161616;margin:0;font-size:12px}.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #b88a2e;padding-bottom:9px;margin-bottom:14px}.brand{font-size:23px;font-weight:900;letter-spacing:.08em}.sub{font-size:9.5px;color:#777}.summary{background:#181818;color:#fff;border-radius:14px;padding:15px 16px;margin-bottom:12px}.summaryLabel{font-size:9px;letter-spacing:.12em;color:#d9b75f;font-weight:800}.summary h1{font-size:21px;margin:4px 0 7px;line-height:1.35}.summaryGrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:11px}.summaryItem{background:#282828;border-radius:9px;padding:8px}.summaryItem b{display:block;font-size:8.5px;color:#bbb}.summaryItem strong{display:block;font-size:16px;margin-top:3px}.summaryText{font-size:10.5px;line-height:1.55;margin:10px 0 0;color:#eee}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px}.metric{border:1px solid #ddd6ca;border-radius:10px;padding:9px}.metric b{display:block;font-size:8.5px;color:#777}.metric strong{display:block;font-size:15px;margin-top:4px}.metric small{display:block;font-size:8px;color:#777;margin-top:3px}.sectionTitle{font-size:15px;margin:13px 0 7px}.strategies{display:grid;gap:6px}.strategyPdf{border:1px solid #ddd6ca;border-radius:10px;padding:9px 10px;display:flex;justify-content:space-between;gap:12px;align-items:center}.strategyPdf b{display:block;font-size:10.5px}.strategyPdf span{display:block;font-size:8.5px;color:#6b665f;margin-top:2px}.strategyNums{text-align:right;white-space:nowrap}.strategyNums strong{display:block;font-size:16px}.strategyNums small{display:block;font-size:8.5px;color:#666;margin-top:2px}.compare{background:#fbf4e4;border-left:4px solid #b88a2e;padding:8px 10px;margin:9px 0 11px;font-size:10.5px;font-weight:700}.compare small{display:block;font-weight:500;color:#6f6658;margin-top:3px;line-height:1.45}.scenarios{display:grid;grid-template-columns:1fr 1fr;gap:6px}.scenarioPdf{border:1px solid #ddd6ca;border-radius:9px;padding:8px}.scenarioPdf b{font-size:9px;display:block}.scenarioPdf span{font-size:12px;display:block;margin-top:3px}.conditions{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;background:#f7f4ee;border-radius:9px;padding:8px;margin-top:11px}.condition b{display:block;font-size:7.5px;color:#777}.condition span{font-size:9.5px;font-weight:700}.next{border:1px solid #d8c28e;border-radius:10px;padding:9px 10px;margin-top:11px}.next b{font-size:10px}.next ul{margin:5px 0 0 16px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;font-size:8.7px;line-height:1.4}.note{font-size:7.8px;line-height:1.5;color:#666;border-top:1px solid #ddd;margin-top:10px;padding-top:7px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="top"><div class="brand">ADCAST</div><div class="sub">住宅予算チェック結果｜診断日 '+escapeHtml(date)+'</div></div><section class="summary"><div class="summaryLabel">DIAGNOSIS SUMMARY</div><h1>'+escapeHtml(title)+'</h1><div class="summaryGrid"><div class="summaryItem"><b>現在検討価格</b><strong>'+escapeHtml(current)+'</strong></div><div class="summaryItem"><b>住宅への配分を高めた比較ライン</b><strong>'+escapeHtml(housingLine)+'</strong></div><div class="summaryItem"><b>現在価格との差</b><strong>'+escapeHtml(margin)+'</strong></div></div><p class="summaryText">'+escapeHtml(summaryCopy)+'</p></section><div class="metrics"><div class="metric"><b>世帯年収</b><strong>'+escapeHtml(grossText)+'</strong></div><div class="metric"><b>想定月返済</b><strong>'+escapeHtml(mainMonthly)+'</strong><small>住宅への配分を高めたライン</small></div><div class="metric"><b>購入後総金融資産</b><strong>'+escapeHtml(totalAssets)+'</strong><small>現金 '+escapeHtml(cash)+' / 投資 '+escapeHtml(investments)+'</small></div><div class="metric"><b>概算年間手取り</b><strong>'+escapeHtml(net)+'</strong></div></div><h2 class="sectionTitle">3つの資産配分戦略</h2><div class="strategies">'+strategies+'</div><div class="compare">現在価格との比較：'+escapeHtml(margin)+'<small>※使ってよい金額ではなく、現在価格と比較ラインの位置関係を見るための目安です。</small></div>'+(scenarios?'<h2 class="sectionTitle">10年後、売却した場合に住宅側へ残る純資産の目安</h2><div class="scenarios">'+scenarios+'</div>':'')+'<div class="conditions"><div class="condition"><b>金利</b><span>'+escapeHtml(rate?rate+'%':'—')+'</span></div><div class="condition"><b>返済期間</b><span>'+escapeHtml(term?term+'年':'—')+'</span></div><div class="condition"><b>自己資金</b><span>'+escapeHtml(equity)+'</span></div><div class="condition"><b>購入諸費用</b><span>約7%仮定</span></div><div class="condition"><b>診断日</b><span>'+escapeHtml(date)+'</span></div></div><div class="next"><b>次に確認したいこと</b><ul><li>教育・車・旅行・老後まで含めた住宅への余白</li><li>この価格帯で狙える物件</li><li>購入候補物件の資産性・流動性</li><li>現金・金融資産・住宅の配分</li></ul></div><p class="note">本資料は簡易比較の結果です。購入可否・借入可能額・将来の資産価値を保証するものではありません。年収倍率・将来価格・金利シナリオは比較のための仮定です。実際の審査・借入期間・団信・金利条件は金融機関ごとに異なります。</p></body></html>';
  }`;

function upgradeSavedPdf(html){
  if(typeof html!=='string')return html;
  const pattern=/function pdfHtml\(\)\{[\s\S]*?\n  \}\n\n  function savePdf\(\)\{/;
  if(!pattern.test(html))return html;
  return html.replace(pattern,PDF_V2_FUNCTION+'\n\n  function savePdf(){');
}

module.exports = function handler(req,res){
  const originalEnd=res.end.bind(res);
  res.end=function(body,...args){
    if(res.statusCode===200&&typeof body==='string')body=upgradeSavedPdf(body);
    return originalEnd(body,...args);
  };
  return baseHandler(req,res);
};
