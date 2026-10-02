(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.UsedHomeDecision=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const INSPECTION={
    PROCEED_DETAIL:'proceed_detail',
    CONFIRM_MORE:'confirm_more',
    ADJUST:'adjust',
    PASS:'pass'
  };
  const OFFER={
    PROCEED:'offer',
    CONDITIONAL:'conditional_offer',
    INVESTIGATE:'investigate',
    PASS:'pass'
  };
  const CONTRACT={
    READY:'ready',
    NOT_READY:'not_ready'
  };

  function arr(v){return Array.isArray(v)?v:[]}
  function truth(v){return v===true}
  function major(issue){return issue&&['major','blocking'].includes(issue.severity)}
  function critical(item){return item&&item.decisionCritical===true}
  function unresolved(item){return !item||item.resolved!==true}
  function unresolvedCritical(items){return arr(items).filter(x=>critical(x)&&unresolved(x))}

  function normalize(input){
    const x=input||{};
    return {
      desiredValue:String(x.desiredValue||'').trim(),
      locationFit:x.locationFit||'unknown',
      layoutFit:x.layoutFit||'unknown',
      buildingAcceptance:x.buildingAcceptance||'unknown',
      householdAgreement:x.householdAgreement||'unknown',
      budgetRoom:x.budgetRoom||'unknown',
      confirmedCosts:arr(x.confirmedCosts),
      nearTermCosts:arr(x.nearTermCosts),
      uncertainRisks:arr(x.uncertainRisks),
      hardToChangeIssues:arr(x.hardToChangeIssues),
      specialistChecks:arr(x.specialistChecks),
      preOfferChecks:arr(x.preOfferChecks),
      postOfferPreContractChecks:arr(x.postOfferPreContractChecks),
      acquisitionTotalKnown:truth(x.acquisitionTotalKnown),
      residualFundsAdequate:x.residualFundsAdequate||'unknown',
      exitViewComplete:truth(x.exitViewComplete),
      lowPriceOnlyReason:truth(x.lowPriceOnlyReason),
      customerJourneyState:x.customerJourneyState||'adjust',
      propertyGate:x.propertyGate||null
    };
  }

  function evaluateInspection(raw){
    const x=normalize(raw);
    const hardMismatch=x.hardToChangeIssues.some(i=>major(i)&&i.accepted!==true);
    const locationNo=x.locationFit==='no';
    const layoutNo=x.layoutFit==='no';
    const householdConflict=x.householdAgreement==='conflict';
    const noValue=!x.desiredValue;
    const budgetNo=x.budgetRoom==='no';

    if((locationNo||layoutNo||hardMismatch)&&!x.desiredValue){
      return {status:INSPECTION.PASS,reasons:['irreversible_mismatch_without_protected_value']};
    }
    if(locationNo||layoutNo||hardMismatch||householdConflict||budgetNo){
      return {status:INSPECTION.ADJUST,reasons:[
        ...(locationNo?['location_mismatch']:[]),
        ...(layoutNo?['layout_mismatch']:[]),
        ...(hardMismatch?['hard_to_change_issue']:[]),
        ...(householdConflict?['household_conflict']:[]),
        ...(budgetNo?['budget_room_insufficient']:[])
      ]};
    }
    const unknownCore=[x.locationFit,x.layoutFit,x.buildingAcceptance,x.householdAgreement,x.budgetRoom].includes('unknown');
    if(noValue||unknownCore){
      return {status:INSPECTION.CONFIRM_MORE,reasons:[
        ...(noValue?['desired_value_missing']:[]),
        ...(unknownCore?['core_fit_unknown']:[])
      ]};
    }
    return {status:INSPECTION.PROCEED_DETAIL,reasons:['detail_investigation_worthwhile']};
  }

  function evaluateOffer(raw){
    const x=normalize(raw);
    const inspection=evaluateInspection(x);
    if(inspection.status===INSPECTION.PASS)return {status:OFFER.PASS,reasons:['inspection_gate_pass']};

    const hardMismatch=x.hardToChangeIssues.some(i=>major(i)&&i.accepted!==true);
    if(hardMismatch)return {status:OFFER.INVESTIGATE,reasons:['unaccepted_hard_to_change_issue']};

    if(x.householdAgreement==='conflict')return {status:OFFER.INVESTIGATE,reasons:['household_conflict']};
    if(x.lowPriceOnlyReason||!x.desiredValue)return {status:OFFER.INVESTIGATE,reasons:[x.lowPriceOnlyReason?'low_price_only_reason':'desired_value_missing']};

    const pre=arr(x.preOfferChecks).filter(unresolved);
    const criticalRisk=unresolvedCritical(x.uncertainRisks);
    const criticalSpecialist=unresolvedCritical(x.specialistChecks);

    if(pre.length||!x.acquisitionTotalKnown||x.residualFundsAdequate==='no'){
      return {status:OFFER.INVESTIGATE,reasons:[
        ...(pre.length?['pre_offer_checks_unresolved']:[]),
        ...(!x.acquisitionTotalKnown?['acquisition_total_unknown']:[]),
        ...(x.residualFundsAdequate==='no'?['residual_funds_inadequate']:[])
      ]};
    }
    if(x.residualFundsAdequate==='unknown'||!x.exitViewComplete){
      return {status:OFFER.INVESTIGATE,reasons:[
        ...(x.residualFundsAdequate==='unknown'?['residual_funds_unknown']:[]),
        ...(!x.exitViewComplete?['exit_view_incomplete']:[])
      ]};
    }

    const post=arr(x.postOfferPreContractChecks).filter(unresolved);
    if(criticalRisk.length||criticalSpecialist.length||post.length){
      return {status:OFFER.CONDITIONAL,reasons:[
        ...(criticalRisk.length?['critical_uncertain_risk_after_offer']:[]),
        ...(criticalSpecialist.length?['critical_specialist_check_after_offer']:[]),
        ...(post.length?['post_offer_pre_contract_checks']:[])
      ]};
    }
    return {status:OFFER.PROCEED,reasons:['offer_inputs_sufficient']};
  }

  function evaluateContract(raw){
    const x=normalize(raw);
    const offer=evaluateOffer(x);
    const criticalUnresolved=[
      ...unresolvedCritical(x.uncertainRisks),
      ...unresolvedCritical(x.specialistChecks),
      ...arr(x.postOfferPreContractChecks).filter(y=>critical(y)&&unresolved(y))
    ];
    const hardMismatch=x.hardToChangeIssues.some(i=>major(i)&&i.accepted!==true);

    if(
      criticalUnresolved.length||
      hardMismatch||
      x.householdAgreement==='conflict'||
      !x.acquisitionTotalKnown||
      x.residualFundsAdequate!=='yes'||
      !x.exitViewComplete||
      [OFFER.PASS,OFFER.INVESTIGATE].includes(offer.status)
    ){
      return {status:CONTRACT.NOT_READY,reasons:[
        ...(criticalUnresolved.length?['decision_critical_unknowns_remain']:[]),
        ...(hardMismatch?['unaccepted_hard_to_change_issue']:[]),
        ...(x.householdAgreement==='conflict'?['household_conflict']:[]),
        ...(!x.acquisitionTotalKnown?['acquisition_total_unknown']:[]),
        ...(x.residualFundsAdequate!=='yes'?['residual_funds_not_confirmed']:[]),
        ...(!x.exitViewComplete?['exit_view_incomplete']:[])
      ]};
    }
    return {status:CONTRACT.READY,reasons:['decision_critical_checks_resolved']};
  }

  function evaluate(raw){
    const x=normalize(raw);
    return {
      inspection:evaluateInspection(x),
      offer:evaluateOffer(x),
      contract:evaluateContract(x),
      costs:{
        confirmed:x.confirmedCosts,
        nearTerm:x.nearTermCosts,
        uncertain:x.uncertainRisks
      },
      specialistChecks:x.specialistChecks,
      customerJourneyState:x.customerJourneyState,
      propertyGate:x.propertyGate
    };
  }

  return {INSPECTION,OFFER,CONTRACT,normalize,evaluateInspection,evaluateOffer,evaluateContract,evaluate};
});
