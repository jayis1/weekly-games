const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../game.js');
const P=require('../provider.js');

test('hour budget, asks and clean restart form a bounded loop',()=>{
 const s=G.fresh();
 assert.equal(s.hours,6);
 assert.throws(()=>G.validateAsk(s,'nobody'),/Unknown delegate/);
 let result=G.recordAsk(s,'highland');
 assert.equal(result.kind,'asked');
 assert.equal(s.hours,5);
 assert.equal(s.delegates.highland.asked,1);
 assert.equal(s.delegates.delta.asked,0);
 for(let i=0;i<5;i++)G.recordAsk(s,'delta');
 assert.equal(s.hours,0);
 assert.throws(()=>G.recordAsk(s,'highland'),/banquet bell/);
 assert.equal(s.hours,0);
 const reset=G.fresh();
 assert.equal(reset.hours,6);
 assert.equal(reset.delegates.delta.asked,0);
});

test('the truth table is engine-owned and the two delegates conflict',()=>{
 assert.equal(G.verdict('highland','trout'),'taboo');
 assert.equal(G.verdict('highland','lentils'),'delight');
 assert.equal(G.verdict('highland','cheese'),'dislike');
 assert.equal(G.verdict('highland','barley'),'neutral');
 assert.equal(G.verdict('delta','figs'),'taboo');
 assert.equal(G.verdict('delta','rice'),'delight');
 assert.equal(G.verdict('delta','peppers'),'dislike');
 assert.throws(()=>G.verdict('delta','dragonfruit'),/Unknown ingredient/);
 // Exactly one menu of three satisfies both delights and no taboo: rice + lentils + a neutral third.
 const ids=Object.keys(G.INGREDIENTS);
 const perfect=[];
 for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++)for(let c=b+1;c<ids.length;c++){
  const menu=[ids[a],ids[b],ids[c]];
  const outcome=G.serve(G.fresh(),menu);
  if(outcome.code==='signed')perfect.push(menu.sort().join('+'));
 }
 assert.deepEqual(perfect.sort(),['barley+lentils+rice','cheese+lentils+rice','lentils+peppers+rice']);
});

test('menu validation rejects bad menus before ending the game',()=>{
 const s=G.fresh();
 for(const menu of [['rice'],['rice','rice','lentils'],['rice','lentils','dragonfruit'],['rice','lentils','barley','figs'],'rice']){
  assert.throws(()=>G.serve(s,menu));
  assert.equal(s.ended,false);
 }
});

test('endings are engine-owned: walkout, accord and signed',()=>{
 const walkout=G.serve(G.fresh(),['trout','rice','lentils']);
 assert.equal(walkout.code,'walkout');
 assert.match(walkout.text,/Maret Ilsk \(River trout\)/);
 const doubleWalkout=G.serve(G.fresh(),['trout','figs','barley']);
 assert.equal(doubleWalkout.code,'walkout');
 assert.match(doubleWalkout.text,/Maret Ilsk.*and.*Oru Venn/);
 const accord=G.serve(G.fresh(),['rice','barley','cheese']);
 assert.equal(accord.code,'accord');
 assert.match(accord.text,/Maret Ilsk wanted/);
 assert.match(accord.text,/picks around the goat cheese/);
 const signed=G.serve(G.fresh(),['rice','lentils','barley']);
 assert.equal(signed.code,'signed');
 assert.doesNotMatch(signed.text,/picks around/);
 const grumbly=G.serve(G.fresh(),['rice','lentils','peppers']);
 assert.equal(grumbly.code,'signed');
 assert.match(grumbly.text,/Oru Venn picks around the fire peppers/);
 const s=G.fresh();
 G.serve(s,['rice','lentils','barley']);
 assert.equal(s.ended,true);
 assert.throws(()=>G.serve(s,['rice','lentils','barley']),/already served/);
 assert.throws(()=>G.recordAsk(s,'highland'),/already served/);
});

test('scripted rehearsal is deterministic, keyword-driven and reveals only the asked fact',()=>{
 assert.match(G.rehearsal('highland','What can you never eat?'),/river trout/i);
 assert.doesNotMatch(G.rehearsal('highland','What can you never eat?'),/lentils/i);
 assert.match(G.rehearsal('delta','What can you never eat?'),/honey figs/i);
 assert.match(G.rehearsal('highland','What would honour your people?'),/black lentils/i);
 assert.match(G.rehearsal('delta','Is there anything you would rather not eat?'),/fire peppers/i);
 assert.match(G.rehearsal('delta','How do you feel about river trout?'),/River trout\? I have no objection/);
 assert.match(G.rehearsal('highland','Trout or figs?'),/River trout\? That I can never eat/);
 assert.match(G.rehearsal('highland','Trout or figs?'),/Honey figs\? I have no objection/);
 assert.match(G.rehearsal('highland','Good evening.'),/Ask me plainly/);
 assert.equal(G.rehearsal('highland','What can you never eat?'),G.rehearsal('highland','What can you never eat?'));
 assert.throws(()=>G.rehearsal('nobody','hi'),/Unknown delegate/);
});

test('delegates have distinct bounded prompts and separate memories',()=>{
 const s=G.fresh();
 const highland=G.messages(s,'highland','What can you never eat?');
 const delta=G.messages(s,'delta','What can you never eat?');
 assert.notEqual(highland[0].content,delta[0].content);
 assert.match(highland[0].content,/Maret Ilsk/);
 assert.match(highland[0].content,/River trout: taboo/);
 assert.doesNotMatch(highland[0].content,/Honey figs: taboo/);
 assert.match(delta[0].content,/Oru Venn/);
 assert.match(delta[0].content,/Honey figs: taboo/);
 assert.match(delta[0].content,/never speak for the other delegation/);
 for(let i=0;i<8;i++)G.remember(s,'highland','q'+i,'a'+i);
 assert.equal(s.delegates.highland.memory.length,4);
 assert.equal(s.delegates.delta.memory.length,0);
 const withMemory=G.messages(s,'highland','latest');
 assert.deepEqual(withMemory.slice(1).map(m=>m.content),['q4','a4','q5','a5','q6','a6','q7','a7','latest']);
 assert.equal(withMemory.length,10);
 assert(JSON.stringify(withMemory).length<6000);
 assert(!JSON.stringify(highland).toLowerCase().includes('api key'));
});

test('endpoint validation permits HTTPS and local HTTP only',()=>{
 assert.equal(P.endpoint('https://example.test/v1/chat/completions'),'https://example.test/v1/chat/completions');
 assert.match(P.endpoint('http://127.0.0.1:8000/v1/chat/completions'),/^http:/);
 for(const value of ['http://example.test/v1','https://user:pass@example.test/v1','https://example.test/v1?key=x','https://example.test/v1#frag','not a url'])assert.throws(()=>P.endpoint(value));
});

test('provider sends bounded Chat Completions requests without putting the key in the body',async()=>{
 let seen;
 const fetcher=async(url,options)=>{seen={url,options};return new Response(JSON.stringify({choices:[{message:{content:'  The river fish is sacred.  '}}]}),{status:200});};
 const client=new P.Client(fetcher,50);
 const reply=await client.ask({endpoint:'https://example.test/v1/chat/completions',model:'test-model',key:'session-secret'},[{role:'user',content:'What can you never eat?'}]);
 assert.equal(reply,'The river fish is sacred.');
 assert.equal(seen.options.headers.Authorization,'Bearer session-secret');
 assert(!seen.options.body.includes('session-secret'));
 assert.equal(seen.options.redirect,'error');
 assert.equal(seen.options.credentials,'omit');
 const body=JSON.parse(seen.options.body);
 assert.equal(body.stream,false);
 assert.equal(body.max_tokens,180);
 assert.equal('tools' in body,false);
 const keyless=new P.Client(fetcher,50);
 await keyless.ask({endpoint:'https://example.test/v1/chat/completions',model:'m'},[{role:'user',content:'x'}]);
 assert.equal('Authorization' in seen.options.headers,false);
});

test('provider failures, cancellation, concurrency, size and budgets are recoverable',async()=>{
 const cfg={endpoint:'https://example.test/v1',model:'m'};
 const msg=[{role:'user',content:'x'}];
 const malformed=new P.Client(async()=>new Response('{bad',{status:200}),50);
 await assert.rejects(()=>malformed.ask(cfg,msg),/invalid JSON/);
 const empty=new P.Client(async()=>new Response(JSON.stringify({choices:[{message:{content:'   '}}]}),{status:200}),50);
 await assert.rejects(()=>empty.ask(cfg,msg),/no usable/);
 const failed=new P.Client(async()=>new Response('private response',{status:429}),50);
 await assert.rejects(()=>failed.ask(cfg,msg),/HTTP 429/);
 const huge=new P.Client(async()=>new Response('x'.repeat(60000),{status:200}),50);
 await assert.rejects(()=>huge.ask(cfg,msg),/exceeds 48 KiB/);
 const hanging=new P.Client((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')))),50);
 const pending=hanging.ask(cfg,msg);
 await assert.rejects(()=>hanging.ask(cfg,msg),/already in progress/);
 hanging.cancel();
 await assert.rejects(()=>pending,/cancelled/);
 const slow=new P.Client((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')))),20);
 await assert.rejects(()=>slow.ask(cfg,msg),/timed out/);
 const limited=new P.Client(async()=>new Response(JSON.stringify({choices:[{message:{content:'ok'}}]})),50,2);
 await limited.ask(cfg,msg);
 await limited.ask(cfg,msg);
 await assert.rejects(()=>limited.ask(cfg,msg),/budget exhausted/);
 const oversized=new P.Client(async()=>new Response('{}'),50);
 await assert.rejects(()=>oversized.ask(cfg,[{role:'user',content:'y'.repeat(7000)}]),/input budget/);
});
