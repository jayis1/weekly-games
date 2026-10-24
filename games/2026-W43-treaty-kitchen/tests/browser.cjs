const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const http=require('node:http');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
 const requests=[];let responseMode='ok';
 const server=http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{
   requests.push({body:JSON.parse(body),authorization:req.headers.authorization});
   if(responseMode==='hang')return;
   if(responseMode==='error'){res.writeHead(429);res.end('private fixture body');return;}
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content:'<img src=x onerror=alert(1)> The river fish is sacred to the clans.'}}]}));
  });
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const askButton=()=>page.getByRole('button',{name:'Ask',exact:true});
 const idle=()=>page.waitForFunction(()=>!document.querySelector('#ask').disabled);
 try{
  const target=process.env.TREATY_BUILD||path.resolve(__dirname,'../index.html');
  await page.goto('file://'+target);
  await page.getByRole('button',{name:'Light the stove'}).click();
  await page.locator('#mode').selectOption('rehearsal');
  await page.getByRole('button',{name:'Apply connection'}).click();
  assert.match(await page.locator('#connection-status').innerText(),/scripted rehearsal.*not live AI/i);
  // Rehearsal winning path: learn both taboos and both delights (4 hours), serve rice + lentils + barley.
  for(const [delegate,question] of [['highland','What can you never eat?'],['highland','What would honour your people?'],['delta','What can you never eat?'],['delta','What would honour your people?']]){
   await page.locator('#delegate').selectOption(delegate);await page.locator('#question').fill(question);await askButton().click();await idle();
  }
  const dialogue=await page.locator('#dialogue').innerText();
  for(const fact of ['river trout','black lentils','honey figs','saffron rice'])assert.match(dialogue,new RegExp(fact,'i'));
  assert.match(await page.locator('#hour-status').innerText(),/2 hours remain/);
  assert.match(await page.locator('#roster [data-delegate="highland"] .badge').innerText(),/Asked 2 times/i);
  // Pantry enforces exactly three.
  for(const id of ['rice','lentils','barley'])await page.locator(`#pantry input[value="${id}"]`).check();
  await page.locator('#pantry input[value="figs"]').check().catch(()=>{});
  assert.equal(await page.locator('#pantry input[value="figs"]').isChecked(),false);
  assert.match(await page.locator('#menu-status').innerText(),/3\/3 chosen/);
  await page.getByRole('button',{name:'Serve the meal'}).click();
  assert.match(await page.locator('#ending').innerText(),/Treaty signed/);
  assert(await page.locator('#serve').isDisabled());
  await page.getByRole('button',{name:'Start a new banquet'}).click();
  assert.match(await page.locator('#hour-status').innerText(),/6 hours remain/);
  assert.match(await page.locator('#menu-status').innerText(),/0\/3 chosen/);
  // Serving fewer than three is rejected without ending the game; a taboo menu walks out.
  await page.locator('#pantry input[value="trout"]').check();
  await page.getByRole('button',{name:'Serve the meal'}).click();
  assert.match(await page.locator('#notice').innerText(),/exactly 3/);
  assert(await page.locator('#ending').isHidden());
  for(const id of ['rice','lentils'])await page.locator(`#pantry input[value="${id}"]`).check();
  await page.getByRole('button',{name:'Serve the meal'}).click();
  assert.match(await page.locator('#ending').innerText(),/table empties/);
  await page.getByRole('button',{name:'Start a new banquet'}).click();

  // Live mode: invalid endpoint clears key and reports error.
  await page.locator('#mode').selectOption('live');
  await page.locator('#endpoint').fill('http://example.test/v1/chat/completions');
  await page.locator('#model').fill('protocol-fixture');await page.locator('#api-key').fill('must-clear-on-error');await page.locator('#consent').check();
  await page.getByRole('button',{name:'Apply connection'}).click();
  assert.equal(await page.locator('#api-key').inputValue(),'');
  assert.match(await page.locator('#connection-status').innerText(),/Use HTTPS/);
  await page.locator('#endpoint').fill(`http://127.0.0.1:${server.address().port}/v1/chat/completions`);
  await page.locator('#api-key').fill('fixture-session-key');
  await page.getByRole('button',{name:'Apply connection'}).click();
  assert.equal(await page.locator('#api-key').inputValue(),'');
  // Consent revocation blocks live calls.
  await page.locator('#consent').uncheck();
  await askButton().click();
  assert.equal(requests.length,0);assert.match(await page.locator('#notice').innerText(),/authorize live transmissions/i);
  await page.locator('#consent').check();
  // Two distinct delegates get distinct system prompts; key only in header.
  for(const delegate of ['highland','delta']){
   await page.locator('#delegate').selectOption(delegate);await page.locator('#question').fill('What can you never eat?');await askButton().click();await idle();
  }
  assert.equal(requests.length,2);
  assert.equal(new Set(requests.map(request=>request.body.messages[0].content)).size,2);
  for(const request of requests){assert.equal(request.authorization,'Bearer fixture-session-key');assert(!JSON.stringify(request.body).includes('fixture-session-key'));assert.equal(request.body.max_tokens,180);}
  assert.match(await page.locator('#hour-status').innerText(),/4 hours remain/);
  // Model output rendered as inert text, never HTML.
  assert.equal(await page.locator('#dialogue img').count(),0);assert.match(await page.locator('#dialogue').innerText(),/<img/);
  assert.deepEqual(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}})),{local:{},session:{}});
  // HTTP 429 recovery: no hour spent.
  responseMode='error';const before=await page.locator('#hour-status').innerText();await askButton().click();await idle();
  assert.match(await page.locator('#notice').innerText(),/HTTP 429/);assert.equal(await page.locator('#hour-status').innerText(),before);
  // Cancellation recovery.
  responseMode='hang';await askButton().click();await page.getByRole('button',{name:'Cancel request'}).click();await idle();
  assert.match(await page.locator('#notice').innerText(),/cancelled/i);assert.equal(await page.locator('#hour-status').innerText(),before);
  // Edge case: while a live request is in flight, Ask and Serve stay locked even if the
  // connection is re-applied; Cancel is available; cancelling restores both controls.
  responseMode='hang';await askButton().click();
  assert(await page.locator('#ask').isDisabled());assert(await page.locator('#serve').isDisabled());assert(await page.locator('#cancel').isEnabled());
  await page.getByRole('button',{name:'Apply connection'}).click();
  assert(await page.locator('#ask').isDisabled());assert(await page.locator('#serve').isDisabled());assert(await page.locator('#cancel').isEnabled());
  await page.getByRole('button',{name:'Cancel request'}).click();await idle();
  assert(await page.locator('#serve').isEnabled());assert(await page.locator('#cancel').isDisabled());
  assert.equal(await page.locator('#hour-status').innerText(),before);
  // Edge case: restart during an in-flight request discards the reply and clears Cancel.
  await askButton().click();assert(await page.locator('#cancel').isEnabled());
  await page.getByRole('button',{name:'Start a new banquet'}).click();await idle();
  assert(await page.locator('#cancel').isDisabled());assert(await page.locator('#serve').isEnabled());
  assert.match(await page.locator('#hour-status').innerText(),/6 hours remain/);
  assert.equal(await page.locator('#dialogue .turn').count(),0);
  responseMode='ok';
  const liveRequestsBefore=requests.length;
  await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(requests.length,liveRequestsBefore);
  // Edge case: zero-hour bell. Spend all six hours in rehearsal; Ask locks, Serve still works.
  await page.locator('#mode').selectOption('rehearsal');await page.getByRole('button',{name:'Apply connection'}).click();
  for(let i=0;i<6;i++){await page.locator('#question').fill('Good evening.');await askButton().click();await page.waitForFunction(h=>document.querySelector('#hour-status').innerText!==h,`${6-i} hour${6-i===1?'':'s'} remain`);}
  assert.match(await page.locator('#hour-status').innerText(),/0 hours remain/);
  assert.match(await page.locator('#notice').innerText(),/banquet bell rings/);
  assert(await page.locator('#ask').isDisabled());assert(await page.locator('#serve').isEnabled());
  for(const id of ['rice','lentils','cheese'])await page.locator(`#pantry input[value="${id}"]`).check();
  await page.getByRole('button',{name:'Serve the meal'}).click();
  assert.match(await page.locator('#ending').innerText(),/Treaty signed/);assert.match(await page.locator('#ending').innerText(),/picks around the goat cheese/);
  await page.getByRole('button',{name:'Start a new banquet'}).click();
  assert(await page.locator('#ask').isEnabled());
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(pageErrors,[]);
  console.log('PASS Chromium: rehearsal treaty-signed/walkout/restart; pantry limit; two delegates through local protocol fixture; key isolation; XSS-as-text; consent gate; HTTP recovery; cancellation; in-flight lockout across re-apply; restart mid-request; zero-hour bell then serve; responsive layout; no page errors.');
  console.log('Local fixture and scripted rehearsal only — no live AI model tested.');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
