const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../game.js');
const P=require('../provider.js');

test('signals, calls, route confirmations and clean restart form a bounded loop',()=>{
 const s=G.fresh();
 assert.equal(s.beats,6);
 assert.throws(()=>G.inspect(s,'invented'),/Unknown signal/);
 G.inspect(s,'shoal');
 assert.deepEqual(s.signals,['shoal']);
 assert.equal(s.beats,5);
 let result=G.recordCall(s,'ferry','');
 assert.equal(result.kind,'heard');
 assert.equal(s.vessels.ferry.trust,1);
 assert.equal(s.beats,4);
 result=G.recordCall(s,'ferry','shoal');
 assert.equal(result.kind,'confirmed');
 assert.equal(s.vessels.ferry.confirmed,true);
 assert.equal(s.beats,3);
 assert.throws(()=>G.recordCall(s,'freighter','shoal'),/does not belong/);
 assert.equal(s.beats,3);
 G.inspect(s,'tug');
 G.recordCall(s,'freighter','');
 G.recordCall(s,'freighter','tug');
 assert.equal(s.beats,0);
 assert.deepEqual(G.decide(s,'ferry','send').code,'safe_harbor');
 const reset=G.fresh();
 assert.equal(reset.beats,6);
 assert.equal(reset.vessels.ferry.trust,0);
});

test('call validation rejects mismatched evidence before state mutation',()=>{
 const s=G.fresh();
 G.inspect(s,'tug');
 const before=structuredClone(s);
 assert.throws(()=>G.validateCall(s,'ferry','tug'),/does not belong/);
 assert.deepEqual(s,before);
});

test('canonical outcomes remain engine-owned and unsupported decisions lose',()=>{
 assert.equal(G.decide(G.fresh(),'ferry','send').code,'unverified');
 assert.throws(()=>G.decide(G.fresh(),'pirates','send'),/Unknown docking order/);
 assert.throws(()=>G.decide(G.fresh(),'ferry','launch'),/Unknown tug order/);
 const s=G.fresh();
 for(const [signal,vessel] of [['shoal','ferry'],['tug','freighter']]){
  G.inspect(s,signal);G.recordCall(s,vessel,'');G.recordCall(s,vessel,signal);
 }
 assert.equal(G.decide(s,'freighter','send').code,'collision');
 assert.equal(G.decide(s,'ferry','hold').code,'grounded');
});

test('captains have distinct bounded prompts and memories',()=>{
 const s=G.fresh();
 const ferry=G.messages(s,'ferry','Can you cross the shoal?');
 const freighter=G.messages(s,'freighter','Can you cross the shoal?');
 assert.notEqual(ferry[0].content,freighter[0].content);
 assert.match(ferry[0].content,/Morrow Bell/);
 assert.match(freighter[0].content,/Ashwing/);
 for(let i=0;i<8;i++)G.remember(s,'ferry','q'+i,'a'+i);
 assert.equal(s.vessels.ferry.memory.length,4);
 assert.equal(s.vessels.freighter.memory.length,0);
 assert(!JSON.stringify(ferry).includes('api'));
});

test('endpoint validation permits HTTPS and local HTTP only',()=>{
 assert.equal(P.endpoint('https://example.test/v1/chat/completions'),'https://example.test/v1/chat/completions');
 assert.match(P.endpoint('http://127.0.0.1:8000/v1/chat/completions'),/^http:/);
 for(const value of ['http://example.test/v1','https://user:pass@example.test/v1','https://example.test/v1?key=x'])assert.throws(()=>P.endpoint(value));
});

test('provider sends bounded Chat Completions requests without putting key in body',async()=>{
 let seen;
 const fetcher=async(url,options)=>{seen={url,options};return new Response(JSON.stringify({choices:[{message:{content:'  Keep the north lamp steady.  '}}]}),{status:200});};
 const client=new P.Client(fetcher,50);
 const reply=await client.ask({endpoint:'https://example.test/v1/chat/completions',model:'test-model',key:'session-secret'},[{role:'user',content:'Report.'}]);
 assert.equal(reply,'Keep the north lamp steady.');
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
