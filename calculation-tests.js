const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

function run(p) {
  const n = k => Number(p[k] || 0);
  const ms = Math.round(n('years') * 12), tm = Math.round(n('term') * 12);
  const P = n('loan'), r = n('rate') / 1200;
  const pay = !tm ? 0 : !r ? P / tm : P * r * (1 + r) ** tm / ((1 + r) ** tm - 1);
  let bal = P, mort = 0, own = 0, cred = 0, rentTot = 0, rSave = 0, bSave = 0;
  let principal = 0, interest = 0;
  for (let m = 1; m <= ms; m++) {
    const yi = Math.floor((m - 1) / 12);
    const rm = n('rent') * (1 + n('rentGrowth') / 100) ** yi;
    const re = (n('rentInsurance') + n('guarantee') + n('rentOther')) / 12;
    const cy = Math.round(n('renewCycle') * 12);
    const renew = n('renewMonths') > 0 && cy > 0 && m > 1 && (m - 1) % cy === 0 ? rm * n('renewMonths') : 0;
    const rh = rm + re + renew;
    let mp = 0;
    if (m <= tm && bal > 1e-8) {
      const int = bal * r;
      let pr = Math.max(0, pay - int);
      if (pr > bal) pr = bal;
      mp = int + pr;
      bal = Math.max(0, bal - pr);
      principal += pr;
      interest += int;
    }
    const oc = n('mgmt') + (n('taxAnnual') + n('ownerOther')) / 12;
    const cr = m <= Math.round(n('creditYears') * 12) ? n('creditAnnual') / 12 : 0;
    const bt = mp + oc - cr;
    const diff = bt - rh;
    rSave += Math.max(0, diff);
    bSave += Math.max(0, -diff);
    mort += mp; own += oc; cred += cr; rentTot += rh;
  }
  const future = n('price') * (1 + n('priceChange') / 100);
  const net = future - n('sellCost') - bal;
  const bOut = n('down') + n('buyCost') + mort + own - cred;
  const bEff = bOut - net;
  const rInit = n('down') + n('buyCost');
  const rFinal = rInit + rSave;
  const bFinal = net + bSave;
  return { bal, mort, principal, interest, rSave, bSave, rentTot, bEff, rFinal, bFinal, assetDiff: bFinal-rFinal, costDiff:bEff-rentTot };
}

const base = {rent:25,years:10,renewMonths:1,renewCycle:2,rentInsurance:1.5,guarantee:1,rentOther:0,rentGrowth:0,price:10000,down:1000,loan:9000,rate:1,term:35,buyCost:700,taxAnnual:25,mgmt:0,ownerOther:0,creditAnnual:0,creditYears:0,sellCost:350,priceChange:0};
const cases = [
  ['default', {}], ['zero interest', {rate:0}], ['cash purchase',{down:10000,loan:0}], ['zero down',{down:0,loan:10000}],
  ['price -10%',{priceChange:-10}], ['price +10%',{priceChange:10}], ['period longer than loan',{years:40}],
  ['rent cheaper',{rent:10}], ['rent more expensive',{rent:60}], ['tax credit',{creditAnnual:40,creditYears:10}],
  ['positive rent growth',{rentGrowth:2}], ['negative rent growth',{rentGrowth:-2}]
];
for (const [name, patch] of cases) {
  const input = {...base, ...patch};
  const x = run(input);
  assert(x.bal >= -1e-8, `${name}: balance below zero`);
  assert(Math.abs(x.principal + x.bal - input.loan) < 1e-5, `${name}: principal + balance mismatch`);
  assert(Math.abs(x.mort - x.principal - x.interest) < 1e-5, `${name}: mortgage identity mismatch`);
  assert(Math.abs(x.assetDiff + x.costDiff) < 1e-5, `${name}: asset/cost mirror identity mismatch`);
}
console.log(`PASS: ${cases.length} calculation regression cases`);
