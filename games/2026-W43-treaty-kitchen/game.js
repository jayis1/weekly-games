(function(root){
 'use strict';
 // Treaty Kitchen — two rival delegates, one shared meal, six hours before the banquet.
 // The engine owns every dietary fact, the hour budget, menu validation and the three endings.
 // Delegates (BYO-AI NPCs) only ever PHRASE their own bounded knowledge; the player learns the
 // facts solely through conversation and must compose a three-ingredient menu from them.
 const HOURS=6;
 const MENU_SIZE=3;
 const INGREDIENTS={
  rice:{name:'Saffron rice'},
  trout:{name:'River trout'},
  peppers:{name:'Fire peppers'},
  figs:{name:'Honey figs'},
  cheese:{name:'Goat cheese'},
  lentils:{name:'Black lentils'},
  barley:{name:'Mountain barley'}
 };
 const DELEGATES={
  highland:{
   name:'Envoy Maret Ilsk',faction:'Highland Clans',
   personality:'proud, dry-humoured mountain envoy who respects plain speech',
   verdicts:{trout:'taboo',lentils:'delight',cheese:'dislike'},
   reasons:{trout:'the river fish is sacred to the clans and is never eaten',lentils:'black lentils are the clans\u2019 feast dish and would honour you',cheese:'goat cheese reminds you of lean winters and you would rather not'}
  },
  delta:{
   name:'Chancellor Oru Venn',faction:'Delta Assembly',
   personality:'warm, talkative delta chancellor who loves ceremony',
   verdicts:{figs:'taboo',rice:'delight',peppers:'dislike'},
   reasons:{figs:'honey figs make you violently ill \u2014 a true allergy, not a preference',rice:'saffron rice is the Delta\u2019s treaty dish and would move you deeply',peppers:'fire peppers overwhelm your palate and you would rather not'}
  }
 };
 const VERDICT_LINES={
  taboo:'That I can never eat.',
  delight:'That would honour my people.',
  dislike:'I would rather not, though I could bear it.',
  neutral:'I have no objection to it.'
 };
 function fresh(){
  return {hours:HOURS,ended:false,delegates:Object.fromEntries(Object.keys(DELEGATES).map(id=>[id,{asked:0,memory:[]}]))};
 }
 function requireDelegate(id){if(!DELEGATES[id])throw new Error('Unknown delegate.');return DELEGATES[id];}
 function verdict(delegateId,ingredientId){
  const delegate=requireDelegate(delegateId);
  if(!INGREDIENTS[ingredientId])throw new Error('Unknown ingredient.');
  return delegate.verdicts[ingredientId]||'neutral';
 }
 function validateAsk(state,delegateId){
  requireDelegate(delegateId);
  if(state.ended)throw new Error('The meal is already served.');
  if(state.hours<=0)throw new Error('The banquet bell has rung; serve the meal.');
  return true;
 }
 function recordAsk(state,delegateId){
  validateAsk(state,delegateId);
  state.hours--;
  state.delegates[delegateId].asked++;
  if(state.hours===0)return {kind:'asked',text:`${DELEGATES[delegateId].name} answers. The banquet bell rings \u2014 no more questions; serve the meal.`};
  return {kind:'asked',text:`${DELEGATES[delegateId].name} answers. ${state.hours} hour${state.hours===1?'':'s'} remain.`};
 }
 function remember(state,delegateId,question,answer){
  requireDelegate(delegateId);
  const memory=state.delegates[delegateId].memory;
  memory.push({question:String(question).slice(0,240),answer:String(answer).slice(0,500)});
  while(memory.length>4)memory.shift();
 }
 function knowledge(delegateId){
  const delegate=requireDelegate(delegateId);
  const lines=Object.keys(INGREDIENTS).map(id=>{
   const v=delegate.verdicts[id]||'neutral';
   const reason=delegate.reasons[id]?` (${delegate.reasons[id]})`:'';
   return `${INGREDIENTS[id].name}: ${v}${reason}`;
  });
  return lines.join('; ');
 }
 function messages(state,delegateId,question){
  const delegate=requireDelegate(delegateId);
  const memory=state.delegates[delegateId].memory.flatMap(turn=>[{role:'user',content:turn.question},{role:'assistant',content:turn.answer}]);
  return [
   {role:'system',content:`You are ${delegate.name} of the ${delegate.faction}, a ${delegate.personality}, speaking with the treaty cook before tonight's banquet. Stay in character. Your only dietary facts, for these seven ingredients: ${knowledge(delegateId)}. Answer honestly about your own needs when asked, but do not volunteer the whole list unprompted, and never speak for the other delegation. Never invent ingredients, treaty terms, tools or authority. Reply in at most 70 words. The cook alone decides the menu.`},
   ...memory,
   {role:'user',content:String(question).slice(0,400)}
  ];
 }
 // Labeled offline rehearsal: deterministic, keyword-driven, and NOT live AI.
 function rehearsal(delegateId,question){
  const delegate=requireDelegate(delegateId);
  const q=String(question).toLowerCase();
  const named=Object.keys(INGREDIENTS).filter(id=>q.includes(INGREDIENTS[id].name.toLowerCase())||q.includes(id));
  if(named.length){
   return named.slice(0,2).map(id=>{
    const v=delegate.verdicts[id]||'neutral';
    const reason=delegate.reasons[id]?` \u2014 ${delegate.reasons[id]}.`:'';
    return `${INGREDIENTS[id].name}? ${VERDICT_LINES[v]}${reason}`;
   }).join(' ');
  }
  const byKind=kind=>Object.keys(delegate.verdicts).find(id=>delegate.verdicts[id]===kind);
  if(/can't|cannot|never|forbid|taboo|allerg|sacred|must not|avoid at all/.test(q)){const id=byKind('taboo');return `One thing only: ${INGREDIENTS[id].name.toLowerCase()} \u2014 ${delegate.reasons[id]}. Serve it and I leave the table.`;}
  if(/love|favou?rite|delight|honou?r|enjoy|pleas|best|treat/.test(q)){const id=byKind('delight');return `If you wish to honour us: ${INGREDIENTS[id].name.toLowerCase()} \u2014 ${delegate.reasons[id]}.`;}
  if(/dislike|hate|rather not|prefer not|avoid|bear/.test(q)){const id=byKind('dislike');return `I would rather not see ${INGREDIENTS[id].name.toLowerCase()}; ${delegate.reasons[id]}.`;}
  return `${delegate.name} of the ${delegate.faction}. Ask me plainly, cook: what I can never eat, what would honour my people, or what I would rather not \u2014 or name an ingredient and I will tell you where I stand.`;
 }
 function validateMenu(menu){
  if(!Array.isArray(menu))throw new Error('Choose ingredients for the menu.');
  const unique=[...new Set(menu)];
  if(unique.length!==menu.length)throw new Error('Each ingredient may appear once.');
  for(const id of unique)if(!INGREDIENTS[id])throw new Error('Unknown ingredient.');
  if(unique.length!==MENU_SIZE)throw new Error(`Serve exactly ${MENU_SIZE} ingredients.`);
  return unique;
 }
 function serve(state,menu){
  if(state.ended)throw new Error('The meal is already served.');
  const chosen=validateMenu(menu);
  state.ended=true;
  const report={};
  for(const delegateId of Object.keys(DELEGATES)){
   report[delegateId]={taboo:chosen.filter(id=>verdict(delegateId,id)==='taboo'),delight:chosen.filter(id=>verdict(delegateId,id)==='delight'),dislike:chosen.filter(id=>verdict(delegateId,id)==='dislike')};
  }
  const walkouts=Object.keys(DELEGATES).filter(id=>report[id].taboo.length);
  if(walkouts.length){
   const who=walkouts.map(id=>`${DELEGATES[id].name} (${INGREDIENTS[report[id].taboo[0]].name})`).join(' and ');
   return {code:'walkout',title:'The table empties',text:`${who} cannot touch the dish you served. The delegation walks out and the treaty collapses before dessert.`,report};
  }
  const missing=Object.keys(DELEGATES).filter(id=>!report[id].delight.length);
  const grumbles=Object.keys(DELEGATES).filter(id=>report[id].dislike.length).map(id=>`${DELEGATES[id].name} picks around the ${INGREDIENTS[report[id].dislike[0]].name.toLowerCase()}`);
  const grumbleText=grumbles.length?` ${grumbles.join('; ')}.`:'';
  if(missing.length){
   return {code:'accord',title:'A grudging accord',text:`Nobody leaves, but nobody is moved either. ${missing.map(id=>DELEGATES[id].name).join(' and ')} wanted a dish that honoured their people.${grumbleText} The treaty is signed in pencil.`,report};
  }
  return {code:'signed',title:'Treaty signed',text:`Both delegations find their feast dish on the table.${grumbleText} Toasts are raised, the ink is wet, and the kitchen takes the credit.`,report};
 }
 const api={HOURS,MENU_SIZE,INGREDIENTS,DELEGATES,fresh,verdict,validateAsk,recordAsk,remember,messages,rehearsal,validateMenu,serve};
 if(typeof module!=='undefined')module.exports=api;else root.TreatyKitchenGame=api;
})(globalThis);
