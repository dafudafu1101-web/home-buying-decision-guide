(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const D=window.UsedHomeDecision;
  if(!D)return;

  const labels={
    inspection:{proceed_detail:'詳細調査へ進む',confirm_more:'追加確認後に判断',adjust:'条件調整が必要',pass:'見送る'},
    offer:{offer:'買付申込へ進む',conditional_offer:'条件付きで買付申込を検討',investigate:'追加調査後に買付判断',pass:'見送る'},
    contract:{ready:'契約判断へ進める',not_ready:'契約判断には未確認事項あり'},
    journey:{proceed:'進める',adjust:'調整する',wait:'待つ'}
  };
  const reasonLabels={
    irreversible_mismatch_without_protected_value:'直しにくい不一致があり、この物件で守る価値が未整理',
    location_mismatch:'立地に重大な不一致',
    layout_mismatch:'広さ・間取りに重大な不一致',
    hard_to_change_issue:'直しにくい要素に未受容の問題',
    household_conflict:'意思決定者間の重大な不一致',
    budget_room_insufficient:'修繕・取得費を含める予算余地が不足',
    desired_value_missing:'この中古で守る価値が未整理',
    core_fit_unknown:'内見段階の重要項目に未確認あり',
    detail_investigation_worthwhile:'詳細調査する価値あり',
    inspection_gate_pass:'内見段階で見送り',
    unaccepted_hard_to_change_issue:'直しにくい要素が未受容',
    low_price_only_reason:'安さだけが買付理由になっている',
    pre_offer_checks_unresolved:'買付前に確認必須の事項が未完了',
    specialist_check_required_before_offer:'買付前に完了すべき専門確認が未完了',
    acquisition_total_unknown:'取得総額が未確定',
    residual_funds_inadequate:'購入後に残す資金が不足',
    residual_funds_unknown:'購入後残存資金が未確認',
    exit_view_incomplete:'保有期間・出口が未整理',
    critical_uncertain_risk_after_offer:'判断に影響する不確定リスクが残る',
    critical_specialist_check_after_offer:'専門確認が必要な重要事項が残る',
    post_offer_pre_contract_checks:'買付後・契約前の確認事項が残る',
    price_review_incomplete:'売出価格・土地価値・建物価値・修繕費の根拠確認が不足',
    offer_inputs_sufficient:'買付判断に必要な主要条件が揃っている',
    decision_critical_unknowns_remain:'契約判断に重大な未確認事項が残る',
    residual_funds_not_confirmed:'購入後残存資金が十分と確認できていない',
    decision_critical_checks_resolved:'重大な確認事項が解消している'
  };

  function select(id){return $(id).value}
  function checked(id){return $(id).checked}
  function cost(nameId,amountId){
    const name=$(nameId).value.trim();
    const amount=Number($(amountId).value||0);
    return name||amount?[{name:name||'未名称',amount}]:[];
  }
  function itemFrom(prefix){
    const enabled=checked('#'+prefix+'Enabled');
    if(!enabled)return [];
    const item={
      key:prefix,
      name:$('#'+prefix+'Name').value.trim()||prefix,
      decisionCritical:checked('#'+prefix+'Critical'),
      resolved:checked('#'+prefix+'Resolved')
    };
    const category=$('#'+prefix+'Category');
    const timing=$('#'+prefix+'Timing');
    if(category)item.category=category.value;
    if(timing)item.timing=timing.value;
    return [item];
  }
  function hardIssues(){
    if(!checked('#hardEnabled'))return [];
    return [{
      key:'hard',
      name:$('#hardName').value.trim()||'直しにくい要素',
      severity:select('#hardSeverity'),
      accepted:select('#hardAccepted')==='yes'
    }];
  }
  function input(){
    const uncertain=itemFrom('uncertain');
    if(uncertain.length){
      uncertain[0].amount=Number($('#uncertainAmount').value||0);
    }
    const specialist=itemFrom('specialist');
    return {
      desiredValue:$('#desiredValue').value.trim(),
      locationFit:select('#locationFit'),
      layoutFit:select('#layoutFit'),
      buildingAcceptance:select('#buildingAcceptance'),
      householdAgreement:select('#householdAgreement'),
      budgetRoom:select('#budgetRoom'),
      confirmedCosts:cost('#confirmedName','#confirmedAmount'),
      nearTermCosts:cost('#nearTermName','#nearTermAmount'),
      uncertainRisks:uncertain,
      hardToChangeIssues:hardIssues(),
      specialistChecks:specialist,
      priceReviewInput:Number($('#askingPrice').value||0)>0?{
        askingPrice:Number($('#askingPrice').value||0),
        landValue:Number($('#landValue').value||0),
        buildingValue:Number($('#buildingValue').value||0),
        initialRepair:Number($('#initialRepair').value||0),
        nearTermRepair:Number($('#nearTermRepair').value||0),
        exitCost:Number($('#exitCost').value||0),
        landEvidenceConfirmed:checked('#landEvidenceConfirmed'),
        buildingEvidenceConfirmed:checked('#buildingEvidenceConfirmed'),
        repairEvidenceConfirmed:checked('#repairEvidenceConfirmed')
      }:null,
      preOfferChecks:itemFrom('preOffer'),
      postOfferPreContractChecks:itemFrom('postOffer'),
      acquisitionTotalKnown:checked('#acquisitionTotalKnown'),
      residualFundsAdequate:select('#residualFundsAdequate'),
      exitViewComplete:checked('#exitViewComplete'),
      lowPriceOnlyReason:checked('#lowPriceOnlyReason'),
      customerJourneyState:select('#customerJourneyState'),
      propertyGate:'inspection'
    };
  }
  function sum(items){return items.reduce((n,x)=>n+Number(x.amount||0),0)}
  function yenMan(v){return Number(v||0).toLocaleString('ja-JP')+'万円'}
  function listText(items,empty){
    if(!items.length)return empty;
    return items.map(x=>{
      const route=x.routeLabel?'［'+x.routeLabel+'］':'';
      return route+x.name+(Number(x.amount||0)?'（'+yenMan(x.amount)+'）':'');
    }).join('、');
  }
  function priceSummary(r){
    if(!r)return '売出価格の比較は未入力';
    if(!r.ready)return '根拠確認が不足：'+r.missing.join(' / ');
    const sign=r.askingGap>0?'+':'';
    return '売出 '+yenMan(r.askingPrice)+' / 根拠確認済みの土地＋建物 '+yenMan(r.referenceAssetValue)+' / 差額 '+sign+yenMan(r.askingGap)+' / 初期改修込み取得負担 '+yenMan(r.acquisitionBurden);
  }
  function reasons(list){
    if(!list||!list.length)return '—';
    return list.map(x=>reasonLabels[x]||x).join(' / ');
  }
  function setText(id,v){$(id).textContent=v}
  function render(){
    const x=input();
    const r=D.evaluate(x);
    const purchaseAge=Number($('#purchaseAge').value||0);
    const holdYears=Number($('#holdYears').value||0);
    const saleAge=purchaseAge+holdYears;

    setText('#customerState',labels.journey[x.customerJourneyState]||x.customerJourneyState);
    setText('#propertyGate',labels.inspection[r.inspection.status]+' → '+labels.offer[r.offer.status]);
    setText('#protectedValue',x.desiredValue||'未整理');
    setText('#hardSummary',listText(x.hardToChangeIssues,'重大な登録なし'));
    setText('#confirmedSummary',listText(r.costs.confirmed,'確認済み費用なし'));
    setText('#nearTermSummary',listText(r.costs.nearTerm,'近い将来の想定費用なし'));
    setText('#unknownSummary',listText(r.costs.uncertain,'登録なし'));
    setText('#specialistSummary',listText(r.specialistChecks,'専門確認の登録なし'));
    setText('#priceSummary',priceSummary(r.priceReview));
    setText('#exitSummary',purchaseAge&&holdYears?('購入時築'+purchaseAge+'年 → '+holdYears+'年保有 → 売却時築'+saleAge+'年'):'未入力');
    setText('#nextDecision',r.nextDecision);
    setText('#nextAction',r.nextAction);

    setText('#internalInspection',labels.inspection[r.inspection.status]);
    setText('#internalOffer',labels.offer[r.offer.status]);
    setText('#internalContract',labels.contract[r.contract.status]);
    setText('#internalInspectionReasons',reasons(r.inspection.reasons));
    setText('#internalOfferReasons',reasons(r.offer.reasons));
    setText('#internalContractReasons',reasons(r.contract.reasons));
    setText('#internalConfirmedTotal',yenMan(sum(r.costs.confirmed)));
    setText('#internalNearTermTotal',yenMan(sum(r.costs.nearTerm)));
    setText('#internalUnknownCount',String(r.costs.uncertain.length+r.specialistChecks.length));
    setText('#internalPriceReady',r.priceReview?(r.priceReview.ready?'根拠確認済み':'根拠不足'):'未入力');
    setText('#internalDecisionVersion',String(r.decisionRecord&&r.decisionRecord.version||'—'));
    setText('#internalGate',r.currentGate);
    setText('#internalJourney',x.customerJourneyState);

    $('#result').hidden=false;
    $('#result').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function syncEnabled(prefix){
    const on=checked('#'+prefix+'Enabled');
    document.querySelectorAll('[data-owner="'+prefix+'"]').forEach(el=>el.disabled=!on);
  }

  ['uncertain','specialist','preOffer','postOffer'].forEach(prefix=>{
    $('#'+prefix+'Enabled').addEventListener('change',()=>syncEnabled(prefix));
    syncEnabled(prefix);
  });
  $('#hardEnabled').addEventListener('change',()=>{
    document.querySelectorAll('[data-owner="hard"]').forEach(el=>el.disabled=!checked('#hardEnabled'));
  });
  document.querySelectorAll('[data-owner="hard"]').forEach(el=>el.disabled=true);
  $('#evaluateBtn').addEventListener('click',render);
  $('#resetBtn').addEventListener('click',()=>{
    $('#usedHomeForm').reset();
    $('#result').hidden=true;
    ['uncertain','specialist','preOffer','postOffer'].forEach(syncEnabled);
    document.querySelectorAll('[data-owner="hard"]').forEach(el=>el.disabled=true);
    window.scrollTo({top:0,behavior:'smooth'});
  });
})();