(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.UsedHomePriceReview=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const ROUTES={
    PROPERTY_SURVEY:'property_survey',
    BUILDING_INSPECTION:'building_inspection',
    CONSTRUCTION_ESTIMATE:'construction_estimate',
    FUNDING_REVIEW:'funding_review',
    ONSITE_CONFIRMATION:'onsite_confirmation',
    UNSPECIFIED:'unspecified'
  };

  const ROUTE_LABELS={
    property_survey:'物件調査',
    building_inspection:'建物専門確認',
    construction_estimate:'工事見積',
    funding_review:'資金確認',
    onsite_confirmation:'追加現地確認',
    unspecified:'専門確認'
  };

  function n(v){const x=Number(v);return Number.isFinite(x)&&x>=0?x:0}
  function bool(v){return v===true}

  function routeSpecialistCheck(check){
    const c=check||{};
    const category=Object.values(ROUTES).includes(c.category)?c.category:ROUTES.UNSPECIFIED;
    return {
      ...c,
      category,
      routeLabel:ROUTE_LABELS[category],
      timing:c.timing||'before_contract',
      resolved:bool(c.resolved),
      decisionCritical:bool(c.decisionCritical)
    };
  }

  function evaluatePriceReview(input){
    const x=input||{};
    const askingPrice=n(x.askingPrice);
    const landValue=n(x.landValue);
    const buildingValue=n(x.buildingValue);
    const initialRepair=n(x.initialRepair);
    const nearTermRepair=n(x.nearTermRepair);
    const exitCost=n(x.exitCost);
    const landEvidenceConfirmed=bool(x.landEvidenceConfirmed);
    const buildingEvidenceConfirmed=bool(x.buildingEvidenceConfirmed);
    const repairEvidenceConfirmed=bool(x.repairEvidenceConfirmed);

    const referenceAssetValue=landValue+buildingValue;
    const askingGap=referenceAssetValue>0?askingPrice-referenceAssetValue:null;
    const askingGapRate=referenceAssetValue>0?askingGap/referenceAssetValue:null;
    const acquisitionBurden=askingPrice+initialRepair;
    const knownHoldingAndExitBurden=initialRepair+nearTermRepair+exitCost;

    const missing=[];
    if(!(askingPrice>0))missing.push('asking_price');
    if(!(landValue>0)||!landEvidenceConfirmed)missing.push('land_value_evidence');
    if(!(buildingValue>=0)||!buildingEvidenceConfirmed)missing.push('building_value_evidence');
    if(!repairEvidenceConfirmed)missing.push('repair_cost_evidence');

    const ready=missing.length===0;
    return {
      ready,
      missing,
      askingPrice,
      landValue,
      buildingValue,
      referenceAssetValue,
      askingGap,
      askingGapRate,
      initialRepair,
      nearTermRepair,
      exitCost,
      acquisitionBurden,
      knownHoldingAndExitBurden,
      note:ready
        ?'確認済み根拠に基づく比較材料です。割安・割高・購入可否を自動判定しません。'
        :'価格妥当性を判断するには根拠確認が不足しています。推測値で結論を出しません。'
    };
  }

  return {ROUTES,ROUTE_LABELS,routeSpecialistCheck,evaluatePriceReview};
});
