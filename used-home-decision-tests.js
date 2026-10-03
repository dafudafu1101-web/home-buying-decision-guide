const assert=require('assert');
const D=require('./used-home-decision.js');

function base(){
  return {
    desiredValue:'希望エリアと土地価値を守る',
    locationFit:'yes',
    layoutFit:'yes',
    buildingAcceptance:'yes',
    householdAgreement:'agree',
    budgetRoom:'yes',
    acquisitionTotalKnown:true,
    residualFundsAdequate:'yes',
    exitViewComplete:true,
    confirmedCosts:[],
    nearTermCosts:[],
    uncertainRisks:[],
    hardToChangeIssues:[],
    specialistChecks:[],
    preOfferChecks:[],
    postOfferPreContractChecks:[],
    customerJourneyState:'proceed',
    propertyGate:'detail'
  };
}

// 1. 建物状態が未確認という理由だけで自動見送りにならない。
{
  const x=base();
  x.buildingAcceptance='unknown';
  x.specialistChecks=[{key:'inspection',decisionCritical:true,resolved:false}];
  const r=D.evaluateInspection(x);
  assert.notStrictEqual(r.status,D.INSPECTION.PASS);
}

// 2. 直しにくい重大不一致がある場合、無条件で買付可にならない。
{
  const x=base();
  x.hardToChangeIssues=[{key:'road',severity:'major',accepted:false}];
  const r=D.evaluateOffer(x);
  assert.notStrictEqual(r.status,D.OFFER.PROCEED);
}

// 3. 専門確認が必要な項目は未解決のまま保持される。
{
  const x=base();
  x.specialistChecks=[{key:'leak',decisionCritical:true,resolved:false}];
  const r=D.evaluate(x);
  assert.strictEqual(r.specialistChecks[0].resolved,false);
  assert.strictEqual(r.offer.status,D.OFFER.CONDITIONAL);
  assert.strictEqual(r.contract.status,D.CONTRACT.NOT_READY);
}

// 4. 確定費用・近い将来の費用・不確定リスクを混同しない。
{
  const x=base();
  x.confirmedCosts=[{name:'給湯器',amount:30}];
  x.nearTermCosts=[{name:'外壁',amount:150}];
  x.uncertainRisks=[{name:'床下',decisionCritical:false,resolved:false}];
  const r=D.evaluate(x);
  assert.deepStrictEqual(r.costs.confirmed,x.confirmedCosts);
  assert.deepStrictEqual(r.costs.nearTerm,x.nearTermCosts);
  assert.deepStrictEqual(r.costs.uncertain,x.uncertainRisks);
}

// 5. 買付可と契約可を同一状態として扱わない。
{
  const x=base();
  x.postOfferPreContractChecks=[{key:'boundary',decisionCritical:true,resolved:false}];
  const offer=D.evaluateOffer(x);
  const contract=D.evaluateContract(x);
  assert.strictEqual(offer.status,D.OFFER.CONDITIONAL);
  assert.strictEqual(contract.status,D.CONTRACT.NOT_READY);
}

// 6. 重大な未確認事項が残る場合、契約可を出さない。
{
  const x=base();
  x.uncertainRisks=[{key:'rebuild',decisionCritical:true,resolved:false}];
  assert.strictEqual(D.evaluateContract(x).status,D.CONTRACT.NOT_READY);
}

// 7. 物件単位Gateと顧客全体状態を別管理する。
{
  const x=base();
  x.customerJourneyState='proceed';
  x.propertyGate='investigate';
  const r=D.evaluate(x);
  assert.strictEqual(r.customerJourneyState,'proceed');
  assert.strictEqual(r.propertyGate,'investigate');
}

// 8. 価格の安さだけで買付可を出さない。
{
  const x=base();
  x.lowPriceOnlyReason=true;
  x.desiredValue='';
  assert.strictEqual(D.evaluateOffer(x).status,D.OFFER.INVESTIGATE);
}

// 正常系: 重大な未確認事項がなく、価値・費用・出口・合意が揃えば進められる。
{
  const x=base();
  assert.strictEqual(D.evaluateInspection(x).status,D.INSPECTION.PROCEED_DETAIL);
  assert.strictEqual(D.evaluateOffer(x).status,D.OFFER.PROCEED);
  assert.strictEqual(D.evaluateContract(x).status,D.CONTRACT.READY);
}

console.log('PASS: used-home inspection/detail/offer/contract decision gates');


// 9. 次に決めること・次にやることをGateに応じて返す。
{
  const x=base();
  const r=D.evaluate(x);
  assert.strictEqual(r.currentGate,'contract');
  assert.ok(r.nextDecision);
  assert.ok(r.nextAction);
}
{
  const x=base();
  x.acquisitionTotalKnown=false;
  const r=D.evaluate(x);
  assert.strictEqual(r.currentGate,'detail');
  assert.ok(r.nextAction.includes('取得総額'));
}


// 10. 売出価格レビューを使う場合、根拠未確認なら買付判断を進めない。
{
  const x=base();
  x.priceReviewInput={
    askingPrice:9000,
    landValue:7000,
    buildingValue:1500,
    initialRepair:300
  };
  const r=D.evaluate(x);
  assert.strictEqual(r.offer.status,D.OFFER.INVESTIGATE);
  assert.ok(r.offer.reasons.includes('price_review_incomplete'));
}

// 11. 価格根拠が揃えば、差額情報をMARKETデータとして保持する。
{
  const x=base();
  x.priceReviewInput={
    askingPrice:9000,
    landValue:7000,
    buildingValue:1500,
    initialRepair:300,
    nearTermRepair:200,
    exitCost:150,
    landEvidenceConfirmed:true,
    buildingEvidenceConfirmed:true,
    repairEvidenceConfirmed:true
  };
  const r=D.evaluate(x);
  assert.strictEqual(r.priceReview.ready,true);
  assert.strictEqual(r.priceReview.askingGap,500);
  assert.strictEqual(r.decisionRecord.propertyType,'used_home');
  assert.strictEqual(r.decisionRecord.market.priceReview.askingGap,500);
}

// 12. 専門確認の明示区分を共通データへ保持する。
{
  const x=base();
  x.specialistChecks=[{name:'越境確認',category:'property_survey',decisionCritical:true,resolved:false}];
  const r=D.evaluate(x);
  assert.strictEqual(r.specialistChecks[0].routeLabel,'物件調査');
  assert.strictEqual(r.decisionRecord.market.specialistChecks[0].category,'property_survey');
}


// 13. 買付前に必要な重大専門確認は、買付Gateを進めない。
{
  const x=base();
  x.specialistChecks=[{
    name:'再建築・接道確認',
    category:'property_survey',
    timing:'before_offer',
    decisionCritical:true,
    resolved:false
  }];
  const r=D.evaluate(x);
  assert.strictEqual(r.offer.status,D.OFFER.INVESTIGATE);
  assert.ok(r.offer.reasons.includes('specialist_check_required_before_offer'));
}

// 14. 契約前確認の重大専門確認は、買付は条件付き・契約は未準備。
{
  const x=base();
  x.specialistChecks=[{
    name:'建物インスペクション',
    category:'building_inspection',
    timing:'before_contract',
    decisionCritical:true,
    resolved:false
  }];
  const r=D.evaluate(x);
  assert.strictEqual(r.offer.status,D.OFFER.CONDITIONAL);
  assert.strictEqual(r.contract.status,D.CONTRACT.NOT_READY);
}
