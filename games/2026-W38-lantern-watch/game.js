(function(root){
 'use strict';
 const SIGNALS={
  shoal:{name:'North-shoal bell pattern',vessel:'ferry',detail:'The north channel is shallow but clear for a light hull.'},
  tug:{name:'Harbor tug readiness flag',vessel:'freighter',detail:'The tug can catch one ship whose steering has failed.'}
 };
 const VESSELS={
  ferry:{name:'Morrow Bell',captain:'Captain Elian Roe',personality:'careful ferry captain protecting thirty passengers',knowledge:'Your shallow-draft ferry can safely take the north channel. You heard the Ashwing report a jammed rudder.'},
  freighter:{name:'Ashwing',captain:'Captain Sable Venn',personality:'proud freight captain hiding fear behind clipped professionalism',knowledge:'Your rudder is jammed. You need the harbor tug and must not enter before the ferry clears the channel.'}
 };
 function fresh(){return {beats:6,signals:[],ended:false,vessels:Object.fromEntries(Object.keys(VESSELS).map(id=>[id,{trust:0,confirmed:false,memory:[]}]))};}
 function requireVessel(id){if(!VESSELS[id])throw new Error('Unknown vessel.');return VESSELS[id];}
 function inspect(state,id){if(!SIGNALS[id])throw new Error('Unknown signal.');if(state.ended)throw new Error('The watch has ended.');if(!state.signals.includes(id)){if(state.beats<=0)throw new Error('Dawn has closed the harbor.');state.signals.push(id);state.beats--;}return SIGNALS[id];}
 function validateCall(state,vesselId,signalId){requireVessel(vesselId);if(state.ended)throw new Error('The watch has ended.');if(signalId){if(!SIGNALS[signalId])throw new Error('Unknown signal.');if(!state.signals.includes(signalId))throw new Error('Inspect that signal first.');if(SIGNALS[signalId].vessel!==vesselId)throw new Error('That signal does not belong to this captain.');}if(state.beats<=0)throw new Error('Dawn has closed the harbor.');return true;}
 function recordCall(state,vesselId,signalId){validateCall(state,vesselId,signalId);
  const vessel=state.vessels[vesselId];state.beats--;
  if(!signalId){vessel.trust=Math.max(1,vessel.trust);return {kind:'heard',text:`${VESSELS[vesselId].captain} stays on the radio. Trust established.`};}
  if(vessel.trust<1)return {kind:'needs_trust',text:'Listen once before challenging the report.'};
  vessel.confirmed=true;return {kind:'confirmed',text:`Route confirmed for ${VESSELS[vesselId].name}.`};
 }
 function remember(state,vesselId,question,answer){requireVessel(vesselId);const memory=state.vessels[vesselId].memory;memory.push({question:String(question).slice(0,240),answer:String(answer).slice(0,500)});while(memory.length>4)memory.shift();}
 function messages(state,vesselId,question){const vessel=requireVessel(vesselId);const memory=state.vessels[vesselId].memory.flatMap(turn=>[{role:'user',content:turn.question},{role:'assistant',content:turn.answer}]);return [
  {role:'system',content:`You are ${vessel.captain} aboard the ${vessel.name}, a ${vessel.personality}. Stay in character. Known facts only: ${vessel.knowledge} Never invent routes, signals, outcomes, tools, or authority. Reply in at most 70 words. The lighthouse engine alone controls harbor state.`},
  ...memory,
  {role:'user',content:String(question).slice(0,400)}
 ];}
 function decide(state,first,tug){if(!VESSELS[first])throw new Error('Unknown docking order.');if(!['send','hold'].includes(tug))throw new Error('Unknown tug order.');state.ended=true;const verified=Object.values(state.vessels).every(v=>v.confirmed);if(!verified)return {code:'unverified',title:'Signals lost',text:'Without both confirmed reports, the ships hesitate until the tide closes the harbor.'};if(first!=='ferry')return {code:'collision',title:'Channel collision',text:'The freighter enters first and blocks the ferry in the shoal turn.'};if(tug!=='send')return {code:'grounded',title:'Ashwing grounded',text:'The ferry clears safely, but the rudderless freighter grounds without the tug.'};return {code:'safe_harbor',title:'Safe harbor',text:'The ferry crosses the shoal first; the tug catches Ashwing. Every soul reaches shelter.'};}
 const api={SIGNALS,VESSELS,fresh,inspect,validateCall,recordCall,remember,messages,decide};if(typeof module!=='undefined')module.exports=api;else root.LanternGame=api;
})(globalThis);
