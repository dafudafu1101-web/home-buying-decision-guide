(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.HousingDecisionCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const PROPERTY_TYPES={LAND:'land',NEW_HOME:'new_home',USED_HOME:'used_home'};
  const JOURNEY={PROCEED:'proceed',ADJUST:'adjust',WAIT:'wait'};

  function arr(v){return Array.isArray(v)?v:[]}
  function text(v){return String(v||'').trim()}

  function normalizeDecisionRecord(input){
    const x=input||{};
    const propertyType=Object.values(PROPERTY_TYPES).includes(x.propertyType)?x.propertyType:PROPERTY_TYPES.USED_HOME;
    const journeyState=Object.values(JOURNEY).includes(x.journeyState)?x.journeyState:JOURNEY.ADJUST;
    return {
      version:1,
      propertyType,
      self:{
        desiredValues:arr(x.self?.desiredValues).map(text).filter(Boolean),
        mustKeep:arr(x.self?.mustKeep).map(text).filter(Boolean),
        adjustable:arr(x.self?.adjustable).map(text).filter(Boolean),
        householdAgreement:x.self?.householdAgreement||'unknown',
        unknowns:arr(x.self?.unknowns)
      },
      market:{
        facts:arr(x.market?.facts),
        gaps:arr(x.market?.gaps),
        confirmedCosts:arr(x.market?.confirmedCosts),
        nearTermCosts:arr(x.market?.nearTermCosts),
        uncertainRisks:arr(x.market?.uncertainRisks),
        specialistChecks:arr(x.market?.specialistChecks),
        priceReview:x.market?.priceReview||null
      },
      decide:{
        journeyState,
        propertyGate:x.decide?.propertyGate||null,
        currentGate:x.decide?.currentGate||null,
        nextDecision:text(x.decide?.nextDecision),
        nextAction:text(x.decide?.nextAction),
        alternatives:arr(x.decide?.alternatives)
      }
    };
  }

  function mergeDecisionRecord(base,patch){
    const a=normalizeDecisionRecord(base);
    const b=patch||{};
    return normalizeDecisionRecord({
      propertyType:b.propertyType||a.propertyType,
      journeyState:b.journeyState||b.decide?.journeyState||a.decide.journeyState,
      self:{...a.self,...(b.self||{})},
      market:{...a.market,...(b.market||{})},
      decide:{...a.decide,...(b.decide||{})}
    });
  }

  return {PROPERTY_TYPES,JOURNEY,normalizeDecisionRecord,mergeDecisionRecord};
});
