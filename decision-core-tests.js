const assert=require('assert');
const Core=require('./decision-core.js');
const Price=require('./used-home-price-review.js');

// 共通データ構造: SELF / MARKET / DECIDE を物件種別に依存せず保持する。
{
  const r=Core.normalizeDecisionRecord({
    propertyType:'used_home',
    journeyState:'proceed',
    self:{desiredValues:['希望エリア'],mustKeep:['学区'],adjustable:['駅距離'],householdAgreement:'agree'},
    market:{facts:[{key:'price'}],confirmedCosts:[{name:'給湯器',amount:30}]},
    decide:{propertyGate:'detail',nextDecision:'詳細調査へ進むか',nextAction:'建物確認'}
  });
  assert.strictEqual(r.propertyType,'used_home');
  assert.strictEqual(r.self.desiredValues[0],'希望エリア');
  assert.strictEqual(r.market.confirmedCosts[0].amount,30);
  assert.strictEqual(r.decide.journeyState,'proceed');
}

// 共通モデルは不明な状態を勝手に推測しない。
{
  const r=Core.normalizeDecisionRecord({});
  assert.strictEqual(r.propertyType,'used_home');
  assert.strictEqual(r.decide.journeyState,'adjust');
  assert.deepStrictEqual(r.market.specialistChecks,[]);
}

// 専門確認は明示された区分にだけ振り分け、内容から勝手に推測しない。
{
  const r=Price.routeSpecialistCheck({name:'越境確認',category:'property_survey',decisionCritical:true});
  assert.strictEqual(r.category,'property_survey');
  assert.strictEqual(r.routeLabel,'物件調査');
  assert.strictEqual(r.decisionCritical,true);
}
{
  const r=Price.routeSpecialistCheck({name:'何らかの確認'});
  assert.strictEqual(r.category,'unspecified');
  assert.strictEqual(r.routeLabel,'専門確認');
}

// 価格レビューは根拠未確認なら結論を出せる状態にしない。
{
  const r=Price.evaluatePriceReview({
    askingPrice:9000,landValue:7000,buildingValue:1500,
    initialRepair:300,nearTermRepair:200,exitCost:150
  });
  assert.strictEqual(r.ready,false);
  assert.ok(r.missing.includes('land_value_evidence'));
  assert.strictEqual(r.askingGap,500);
}

// 根拠確認済みでも「割安/割高」は自動判定せず、差額と総負担だけ返す。
{
  const r=Price.evaluatePriceReview({
    askingPrice:9000,
    landValue:7000,
    buildingValue:1500,
    initialRepair:300,
    nearTermRepair:200,
    exitCost:150,
    landEvidenceConfirmed:true,
    buildingEvidenceConfirmed:true,
    repairEvidenceConfirmed:true
  });
  assert.strictEqual(r.ready,true);
  assert.strictEqual(r.referenceAssetValue,8500);
  assert.strictEqual(r.askingGap,500);
  assert.strictEqual(r.acquisitionBurden,9300);
  assert.strictEqual(r.knownHoldingAndExitBurden,650);
  assert.ok(!('verdict' in r));
  assert.ok(r.note.includes('自動判定しません'));
}

// 建物価値0円は、根拠確認済みなら有効な入力として扱う。
{
  const r=Price.evaluatePriceReview({
    askingPrice:7000,
    landValue:7000,
    buildingValue:0,
    landEvidenceConfirmed:true,
    buildingEvidenceConfirmed:true,
    repairEvidenceConfirmed:true
  });
  assert.strictEqual(r.ready,true);
  assert.strictEqual(r.referenceAssetValue,7000);
  assert.strictEqual(r.askingGap,0);
}

console.log('PASS: common decision core / used-home price review / specialist routing');
