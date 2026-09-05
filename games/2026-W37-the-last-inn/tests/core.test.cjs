const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../game.js');
const A=require('../provider.js');

test('clues are canonical, unique and cost beats; unknown inputs rejected',()=>{
 const s=G.create(); assert.throws(()=>G.inspect(s,'fake')); G.inspect(s,'ledger'); G.inspect(s,'ledger');
 assert.deepEqual(s.clues,['ledger']); assert.equal(s.beats,11);
});
test('trust requires listening, then owned matching evidence unlocks distinct testimony',()=>{
 const s=G.create(); G.inspect(s,'ledger');
 G.converse(s,'mara','ledger'); assert.equal(s.testimony.length,0);
 G.converse(s,'mara','ledger'); assert.deepEqual(s.testimony,['mara']);
 assert.throws(()=>G.converse(s,'silas','wire')); assert.throws(()=>G.converse(s,'fake',''));
});
test('full win requires corroboration and rescue; alternative decisions have costs',()=>{
 function prepared(){let s=G.create();for(const [id,n] of [['ledger','mara'],['wire','silas'],['scarf','ivo']]){G.inspect(s,id);G.converse(s,n,'');G.converse(s,n,id);}return s;}
 let s=prepared(); G.decide(s,'silas','rescue'); assert.equal(s.ending,'truth-and-mercy'); assert.throws(()=>G.inspect(s,'wire'));
 s=prepared();G.decide(s,'mara','rescue');assert.equal(s.ending,'wrong-accusation');
 s=prepared();G.decide(s,'silas','stay');assert.equal(s.ending,'truth-without-mercy');
 s=G.create();G.decide(s,'silas','rescue');assert.equal(s.ending,'unsupported');
});
test('deadline, invalid choices and clean restart',()=>{
 let s=G.create();assert.throws(()=>G.decide(s,'other','rescue')); assert.throws(()=>G.decide(s,'silas','other'));
 for(let i=0;i<12;i++)G.converse(s,'mara','');assert.equal(s.ending,'too-late');assert.throws(()=>G.converse(s,'mara',''));
 assert.equal(G.create().beats,12);
});
test('character knowledge and memory stay bounded and separate',()=>{
 let s=G.create();let m=G.messages(s,'mara','hello',[],'');assert(!JSON.stringify(m).includes(G.NPCS.silas.secret));
 for(let i=0;i<2;i++)G.converse(s,'mara','');G.inspect(s,'ledger');
 m=G.messages(s,'mara','x'.repeat(900),Array.from({length:20},()=>({role:'user',content:'y'.repeat(1000)})),'ledger');
 assert(m.length<=8);assert(m.at(-1).content.length<900);assert(JSON.stringify(m).includes(G.NPCS.mara.secret));
});
test('endpoint allowlist prevents credential URLs, insecure nonlocal destinations and redirects',()=>{
 for(const url of ['http://example.com/v1/chat/completions','https://user:pass@host/x','https://host/x?key=x','file:///x','https://host/x#x'])assert.throws(()=>A.endpoint(url));
 assert.equal(A.endpoint('http://localhost:1234/v1/chat/completions'),'http://localhost:1234/v1/chat/completions');
});
test('provider sends bounded protocol and key only in Authorization; no tools',async()=>{
 let seen;const c=new A.Client(async(url,options)=>{seen={url,options};return new Response(JSON.stringify({choices:[{message:{content:'I remember the bell.'}}]}));});
 const text=await c.ask({endpoint:'https://example.test/v1/chat/completions',model:'local',key:'fixture-not-a-secret'},[{role:'user',content:'hi'}]);
 assert.equal(text,'I remember the bell.');let body=JSON.parse(seen.options.body);
 assert.equal(body.max_tokens,220);assert.equal(body.stream,false);assert.equal(body.tools,undefined);assert(!seen.options.body.includes('fixture-not-a-secret'));assert.equal(seen.options.redirect,'error');
});
test('malformed, oversized and failed responses are recoverable and do not expose body',async()=>{
 for(const response of [new Response('private detail',{status:401}),new Response('{}'),new Response('x'.repeat(70000))]){
 let c=new A.Client(async()=>response);await assert.rejects(c.ask({endpoint:'https://example.test/x',model:'x'},[]),e=>!e.message.includes('private detail'));
 assert.equal(c.busy,false);
 }
});
test('attempt budget, concurrency, cancellation and timeout are enforced',async()=>{
 const config={endpoint:'https://example.test/x',model:'x'};
 const hang=async(u,o)=>new Promise((resolve,reject)=>o.signal.addEventListener('abort',()=>reject(new Error('aborted'))));
 const c=new A.Client(hang,10);const p=c.ask(config,[]);await assert.rejects(c.ask(config,[]),/in progress/);await assert.rejects(p,/timed out/);
 const d=new A.Client(hang);let q=d.ask(config,[]);d.cancel();await assert.rejects(q,/cancelled/);
 d.used=24;await assert.rejects(d.ask(config,[]),/budget/);
});
