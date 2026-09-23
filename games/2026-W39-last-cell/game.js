(function(root){
 'use strict';
 // The station's last power cell can sustain exactly two of three failing subsystems.
 // Exactly one subsystem is secretly STABLE and is the correct one to cut.
 const STABLE_ID='comms';
 const READOUTS={
  core:{name:'Reactor coolant trace',subsystem:'reactor',detail:'Coolant pressure is sliding toward the scram threshold.'},
  scrubber:{name:'CO\u2082 scrubber log',subsystem:'oxygen',detail:'Cabin CO\u2082 is climbing past the safe band.'},
  array:{name:'Comms array power draw',subsystem:'comms',detail:'The rescue beacon is drawing from its own reserve battery bank.'}
 };
 const SUBSYSTEMS={
  reactor:{name:'Reactor core',specialist:'Chief Doss Mara',personality:'blunt reactor chief who trusts numbers over nerves',knowledge:'Your reactor core is genuinely failing: coolant is dropping and without the last cell it scrams within the hour. You are not exaggerating; you have no reserve.'},
  oxygen:{name:'Oxygen scrubbers',specialist:'Medic Wren Ka',personality:'quiet life-support medic holding panic at bay',knowledge:'Your CO\u2082 scrubbers are near collapse and cabin air is turning bad. Without the cell the crew suffocates. This is real, not a drill, and there is no backup.'},
  comms:{name:'Comms array',specialist:'Signalman Ivo Pell',personality:'anxious comms officer desperate to keep the rescue beacon lit',knowledge:'You fear losing the rescue beacon, but your array is actually running on its own charged reserve battery bank and can hold for hours without the cell \u2014 though in your panic you may not fully realize how stable it is.'}
 };
 function fresh(){return {cycles:7,readouts:[],ended:false,subsystems:Object.fromEntries(Object.keys(SUBSYSTEMS).map(id=>[id,{trust:0,verified:false,status:null,memory:[]}]))};}
 function requireSub(id){if(!SUBSYSTEMS[id])throw new Error('Unknown subsystem.');return SUBSYSTEMS[id];}
 function inspect(state,id){if(!READOUTS[id])throw new Error('Unknown readout.');if(state.ended)throw new Error('The reroute is committed.');if(!state.readouts.includes(id)){if(state.cycles<=0)throw new Error('Power reserve is gone.');state.readouts.push(id);state.cycles--;}return READOUTS[id];}
 function validateCall(state,subId,readoutId){requireSub(subId);if(state.ended)throw new Error('The reroute is committed.');if(readoutId){if(!READOUTS[readoutId])throw new Error('Unknown readout.');if(!state.readouts.includes(readoutId))throw new Error('Decode that readout first.');if(READOUTS[readoutId].subsystem!==subId)throw new Error('That readout is not from this subsystem.');}if(state.cycles<=0)throw new Error('Power reserve is gone.');return true;}
 function recordCall(state,subId,readoutId){validateCall(state,subId,readoutId);
  const sub=state.subsystems[subId];state.cycles--;
  if(!readoutId){sub.trust=Math.max(1,sub.trust);return {kind:'heard',text:`${SUBSYSTEMS[subId].specialist} keeps the channel open. Rapport established.`};}
  if(sub.trust<1)return {kind:'needs_trust',text:'Hear them out once before pressing a readout on them.'};
  sub.verified=true;sub.status=subId===STABLE_ID?'stable':'critical';
  return {kind:'verified',text:`${SUBSYSTEMS[subId].name} confirmed ${sub.status.toUpperCase()}.`};
 }
 function remember(state,subId,question,answer){requireSub(subId);const memory=state.subsystems[subId].memory;memory.push({question:String(question).slice(0,240),answer:String(answer).slice(0,500)});while(memory.length>4)memory.shift();}
 function messages(state,subId,question){const sub=requireSub(subId);const memory=state.subsystems[subId].memory.flatMap(turn=>[{role:'user',content:turn.question},{role:'assistant',content:turn.answer}]);return [
  {role:'system',content:`You are ${sub.specialist}, a ${sub.personality}, calling the power controller of the deep-sea station Thalassa. Stay in character. Known facts only: ${sub.knowledge} Never invent other systems, outcomes, tools, or authority. Reply in at most 70 words. The station controller alone owns power state and the final decision.`},
  ...memory,
  {role:'user',content:String(question).slice(0,400)}
 ];}
 function decide(state,dropId){requireSub(dropId);state.ended=true;const powered=Object.keys(SUBSYSTEMS).filter(id=>id!==dropId);const allVerified=powered.every(id=>state.subsystems[id].verified);if(!allVerified)return {code:'unverified',title:'Acting on a hunch',text:'You reroute the cell without confirming both surviving systems. A guess in the dark; Thalassa cannot afford one.'};if(dropId!==STABLE_ID)return {code:'cascade',title:'Cascade failure',text:`${SUBSYSTEMS[dropId].name} was still failing. Cutting its power triggers a cascade and the crew is lost.`};return {code:'crew_saved',title:'Crew saved',text:`${SUBSYSTEMS[STABLE_ID].name} was holding on its own reserve. The last cell keeps the reactor and the air alive until rescue reaches Thalassa.`};}
 const api={STABLE_ID,READOUTS,SUBSYSTEMS,fresh,inspect,validateCall,recordCall,remember,messages,decide};if(typeof module!=='undefined')module.exports=api;else root.LastCellGame=api;
})(globalThis);
