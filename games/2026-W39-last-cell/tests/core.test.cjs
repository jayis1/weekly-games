const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../game.js');
const P=require('../provider.js');

const READOUT_OF={reactor:'core',oxygen:'scrubber',comms:'array'};
function confirm(s,...subs){
 for(const sub of subs){
  const readout=READOUT_OF[sub];
  G.inspect(s,readout);G.recordCall(s,sub,'');G.recordCall(s,sub,readout);
 }
}

test('readouts, calls, confirmations and clean restart form a bounded loop',()=>{
 const s=G.fresh();
 assert.equal(s.cycles,7);
 assert.throws(()=>G.inspect(s,'invented'),/Unknown readout/);
 G.inspect(s,'core');
 assert.deepEqual(s.readouts,['core']);
 assert.equal(s.cycles,6);
 let result=G.recordCall(s,'reactor','');
 assert.equal(result.kind,'heard');
 assert.equal(s.subsystems.reactor.trust,1);
 assert.equal(s.cycles,5);
 result=G.recordCall(s,'reactor','core');
 assert.equal(result.kind,'verified');
 assert.equal(s.subsystems.reactor.verified,true);
 assert.equal(s.subsystems.reactor.status,'critical');
 assert.equal(s.cycles,4);
 assert.throws(()=>G.recordCall(s,'oxygen','core'),/not from this subsystem/);
 assert.equal(s.cycles,4);
 const reset=G.fresh();
 assert.equal(reset.cycles,7);
 assert.equal(reset.subsystems.reactor.trust,0);
});

test('the stable subsystem confirms as stable, the others as critical',()=>{
 const critical=G.fresh();
 confirm(critical,'reactor','oxygen');
 assert.equal(critical.subsystems.reactor.status,'critical');
 assert.equal(critical.subsystems.oxygen.status,'critical');
 const stable=G.fresh();
 confirm(stable,'comms');
 assert.equal(stable.subsystems.comms.status,'stable');
 assert.equal(G.STABLE_ID,'comms');
});

test('call validation rejects mismatched evidence before state mutation',()=>{
 const s=G.fresh();
 G.inspect(s,'array');
 const before=structuredClone(s);
 assert.throws(()=>G.validateCall(s,'reactor','array'),/not from this subsystem/);
 assert.deepEqual(s,before);
});

test('the seven-cycle reserve confirms at most two of three systems, forcing deduction',()=>{
 // Full confirm cost per system: inspect readout (1) + listen (1) + press readout (1) = 3 cycles.
 const s=G.fresh();
 confirm(s,'reactor','oxygen');   // 6 cycles spent
 assert.equal(s.cycles,1);
 assert.equal(s.subsystems.reactor.verified,true);
 assert.equal(s.subsystems.oxygen.verified,true);
 // Only one cycle left — not enough to inspect+listen+press the third system.
 G.inspect(s,'array');            // 1 cycle -> 0
 assert.equal(s.cycles,0);
 assert.throws(()=>G.recordCall(s,'comms',''),/Power reserve is gone/);
 assert.equal(s.subsystems.comms.verified,false);
});

test('trust is required before pressing a readout, and the failed press costs no reserve',()=>{
 const s=G.fresh();
 G.inspect(s,'core');
 assert.equal(s.cycles,6);
 assert.throws(()=>G.validateRecordCall(s,'reactor','core'),/Hear them out/);
 assert.equal(s.cycles,6);
 const result=G.recordCall(s,'reactor','core');
 assert.equal(result.kind,'needs_trust');
 assert.equal(s.subsystems.reactor.verified,false);
 // The no-op press must not spend a cycle: reserve is deduction currency.
 assert.equal(s.cycles,6);
 // After listening once, the same press now succeeds and spends exactly one cycle.
 G.recordCall(s,'reactor','');
 assert.equal(s.cycles,5);
 const verified=G.recordCall(s,'reactor','core');
 assert.equal(verified.kind,'verified');
 assert.equal(s.cycles,4);
});

test('canonical outcomes remain engine-owned',()=>{
 // Confirm the two survivors (reactor, oxygen) and cut the stable comms array -> crew saved.
 const win=G.fresh();confirm(win,'reactor','oxygen');
 assert.equal(G.decide(win,'comms').code,'crew_saved');
 // Confirm reactor and comms, then cut the still-failing oxygen -> cascade.
 const bad=G.fresh();confirm(bad,'reactor','comms');
 assert.equal(G.decide(bad,'oxygen').code,'cascade');
 // Deciding without confirming both survivors loses.
 const hasty=G.fresh();
 confirm(hasty,'reactor');
 assert.equal(G.decide(hasty,'comms').code,'unverified');
 assert.throws(()=>G.decide(G.fresh(),'aliens'),/Unknown subsystem/);
});

test('unverified check inspects only the two surviving systems',()=>{
 // Confirm reactor and oxygen but NOT comms, then drop comms: both survivors verified -> not unverified.
 const s=G.fresh();
 for(const [readout,sub] of [['core','reactor'],['scrubber','oxygen']]){
  G.inspect(s,readout);G.recordCall(s,sub,'');G.recordCall(s,sub,readout);
 }
 assert.equal(G.decide(s,'comms').code,'crew_saved');
});

test('specialists have distinct bounded prompts and memories',()=>{
 const s=G.fresh();
 const reactor=G.messages(s,'reactor','What is your status?');
 const comms=G.messages(s,'comms','What is your status?');
 assert.notEqual(reactor[0].content,comms[0].content);
 assert.match(reactor[0].content,/Doss Mara/);
 assert.match(comms[0].content,/Ivo Pell/);
 for(let i=0;i<8;i++)G.remember(s,'reactor','q'+i,'a'+i);
 assert.equal(s.subsystems.reactor.memory.length,4);
 assert.equal(s.subsystems.comms.memory.length,0);
 assert.equal(reactor.filter(message=>message.role==='user').length,1);
 assert.equal(reactor.filter(message=>message.role==='assistant').length,0);
 const withMemory=G.messages(s,'reactor','latest');
 assert.deepEqual(withMemory.slice(1).map(message=>message.content),['q4','a4','q5','a5','q6','a6','q7','a7','latest']);
 assert.equal(withMemory.filter(message=>message.role==='user').length,5);
 assert.equal(withMemory.filter(message=>message.role==='assistant').length,4);
 assert.equal(withMemory.at(-1).content,'latest');
 assert(!JSON.stringify(reactor).includes('api'));
});

test('endpoint validation permits HTTPS and local HTTP only',()=>{
 assert.equal(P.endpoint('https://example.test/v1/chat/completions'),'https://example.test/v1/chat/completions');
 assert.match(P.endpoint('http://127.0.0.1:8000/v1/chat/completions'),/^http:/);
 for(const value of ['http://example.test/v1','https://user:pass@example.test/v1','https://example.test/v1?key=x'])assert.throws(()=>P.endpoint(value));
});

test('provider sends bounded Chat Completions requests without putting key in body',async()=>{
 let seen;
 const fetcher=async(url,options)=>{seen={url,options};return new Response(JSON.stringify({choices:[{message:{content:'  Coolant is dropping.  '}}]}),{status:200});};
 const client=new P.Client(fetcher,50);
 const reply=await client.ask({endpoint:'https://example.test/v1/chat/completions',model:'test-model',key:'session-secret'},[{role:'user',content:'Report.'}]);
 assert.equal(reply,'Coolant is dropping.');
 assert.equal(seen.options.headers.Authorization,'Bearer session-secret');
 assert(!seen.options.body.includes('session-secret'));
 const body=JSON.parse(seen.options.body);
 assert.equal(body.stream,false);
 assert.equal(body.max_tokens,180);
 assert.equal('tools' in body,false);
});

test('provider failures, cancellation, concurrency and budgets are recoverable',async()=>{
 const malformed=new P.Client(async()=>new Response('{bad',{status:200}),50);
 await assert.rejects(()=>malformed.ask({endpoint:'https://example.test/v1',model:'m'},[{role:'user',content:'x'}]),/invalid JSON/);
 const failed=new P.Client(async()=>new Response('private response',{status:429}),50);
 await assert.rejects(()=>failed.ask({endpoint:'https://example.test/v1',model:'m'},[{role:'user',content:'x'}]),/HTTP 429/);
 const hanging=new P.Client((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')))),50);
 const pending=hanging.ask({endpoint:'https://example.test/v1',model:'m'},[{role:'user',content:'x'}]);
 await assert.rejects(()=>hanging.ask({endpoint:'https://example.test/v1',model:'m'},[{role:'user',content:'x'}]),/already in progress/);
 hanging.cancel();
 await assert.rejects(()=>pending,/cancelled/);
 const limited=new P.Client(async()=>new Response(JSON.stringify({choices:[{message:{content:'ok'}}]})),50,2);
 await limited.ask({endpoint:'https://example.test/v1',model:'m'},[{role:'user',content:'x'}]);
 await limited.ask({endpoint:'https://example.test/v1',model:'m'},[{role:'user',content:'x'}]);
 await assert.rejects(()=>limited.ask({endpoint:'https://example.test/v1',model:'m'},[{role:'user',content:'x'}]),/budget exhausted/);
});
