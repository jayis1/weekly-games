const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const http=require('node:http');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const game=process.env.INN_BUILD||path.resolve(__dirname,'../index.html');
 const requests=[];let responseMode='ok';
 const server=http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  let body='';req.on('data',b=>body+=b);req.on('end',()=>{
   requests.push({body:JSON.parse(body),authorization:req.headers.authorization});
   if(responseMode==='hang')return;
   if(responseMode==='error'){res.writeHead(429);res.end('private error fixture');return;}
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content:'<img src=x onerror=alert(1)> I remember the storm.'}}]}));
  });
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  await page.goto('file://'+game);
  await page.getByRole('button',{name:'Begin the night',exact:true}).click();
  await page.getByRole('button',{name:'Send question',exact:true}).click();
  assert.match(await page.locator('#notice').innerText(),/connection|rehearsal/i);
  await page.locator('#mode').selectOption('rehearsal');await page.getByRole('button',{name:'Apply connection',exact:true}).click();
  // Reviewing a decision is free, reversible, and never contacts a provider.
  const reviewClock=await page.locator('#clock').innerText();
  await page.locator('#decide').click();
  assert.equal(await page.locator('#ending').isVisible(),false);
  assert.equal(await page.locator('#decision-review').isVisible(),true);
  assert.match(await page.locator('#decision-summary').innerText(),/Mara Vale/);
  assert.match(await page.locator('#decision-summary').innerText(),/rope team/);
  assert.match(await page.locator('#decision-summary').innerText(),/0\/3.*unsupported/i);
  assert.equal(await page.locator('#clock').innerText(),reviewClock);
  assert.equal(requests.length,0);
  await page.locator('#keep-investigating').click();
  assert.equal(await page.locator('#decision-review').isVisible(),false);
  assert.equal(await page.locator('#decide').evaluate(el=>el===document.activeElement),true);
  await page.locator('#suspect').selectOption('ivo');await page.locator('#choice').selectOption('stay');
  await page.locator('#decide').click();
  assert.match(await page.locator('#decision-summary').innerText(),/Ivo Finch/);
  assert.match(await page.locator('#decision-summary').innerText(),/safe inside/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#decision-review').isVisible(),false);
  assert.equal(await page.locator('#clock').innerText(),reviewClock);
  async function fullLoop(){
   for(const [clue,npc] of [['ledger','mara'],['wire','silas'],['scarf','ivo']]){
    await page.locator(`[data-clue="${clue}"]`).click();await page.locator('#npc').selectOption(npc);
    await page.locator('#evidence').selectOption('');await page.locator('#question').fill('Tell me what happened.');await page.locator('#send').click();
    await page.waitForFunction(()=>!document.querySelector('#send').disabled);
    await page.locator('#evidence').selectOption(clue);await page.locator('#question').fill('Please explain this evidence.');await page.locator('#send').click();
    await page.waitForFunction(()=>!document.querySelector('#send').disabled);
   }
  }
  await page.locator('[data-clue="ledger"]').click();
  await page.locator('#npc').selectOption('ivo');await page.locator('#send').click();
  assert.match(await page.locator('#notice').innerText(),/Ivo.*trust/i);
  await page.locator('#evidence').selectOption('ledger');await page.locator('#send').click();
  assert.match(await page.locator('#notice').innerText(),/Ivo.*does not connect/i);
  assert.match(await page.locator('#journal').innerText(),/0\/3/);
  for(let i=0;i<9;i++)await page.locator('#send').click();
  assert.match(await page.locator('#notice').innerText(),/The last bell/);
  assert.equal(await page.locator('#send').isDisabled(),true);
  await page.locator('#restart').click();
  await fullLoop();assert.match(await page.locator('#journal').innerText(),/courier is alive/);
  await page.locator('#suspect').selectOption('silas');await page.locator('#choice').selectOption('rescue');await page.locator('#decide').click();await page.locator('#confirm-decision').click();
  assert.match(await page.locator('#ending').innerText(),/Truth & mercy/);
  await page.locator('#restart').click();assert.match(await page.locator('#clock').innerText(),/12/);
  await page.locator('#decide').click();await page.locator('#confirm-decision').click();assert.match(await page.locator('#ending').innerText(),/guess in the dark/);
  await page.locator('#restart').click();
  await page.locator('#mode').selectOption('live');await page.locator('#endpoint').fill(`http://127.0.0.1:${server.address().port}/v1/chat/completions`);
  await page.locator('#model').fill('protocol-fixture');await page.locator('#key').fill('fixture-only-not-a-real-key');
  await page.locator('#consent').check();await page.locator('#apply').click();assert.equal(await page.locator('#key').inputValue(),'');
  const idleRequests=requests.length;
  await page.locator('#decide').click();
  assert.equal(await page.locator('#keep-investigating').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#decide').evaluate(el=>el===document.activeElement),true);
  await page.locator('#decide').click();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#decision-review').isVisible(),false);
  await page.locator('#decide').click();await page.locator('#confirm-decision').click();
  assert.equal(await page.locator('#ending').evaluate(el=>el===document.activeElement),true);
  assert.equal(requests.length,idleRequests);
  await page.locator('#restart').click();
  for(const npc of ['mara','silas','ivo']){
   await page.locator('#npc').selectOption(npc);await page.locator('#question').fill('What do you know?');await page.locator('#send').click();
   await page.waitForFunction(()=>!document.querySelector('#send').disabled);
   assert.equal(await page.locator('#dialogue img').count(),0);assert.match(await page.locator('#dialogue').innerText(),/<img/);
  }
  assert.equal(requests.length,3);assert.equal(new Set(requests.map(r=>r.body.messages[0].content)).size,3);
  for(const r of requests){assert.equal(r.authorization,'Bearer fixture-only-not-a-real-key');assert(!JSON.stringify(r.body).includes('fixture-only-not-a-real-key'));}
  const storage=await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}));assert.deepEqual(storage,{local:{},session:{}});
  responseMode='error';const before=await page.locator('#clock').innerText();await page.locator('#send').click();await page.waitForFunction(()=>!document.querySelector('#send').disabled);
  assert.match(await page.locator('#notice').innerText(),/HTTP 429/);assert.equal(await page.locator('#clock').innerText(),before);
  responseMode='hang';await page.locator('#send').click();await page.locator('#cancel').click();await page.waitForFunction(()=>!document.querySelector('#send').disabled);
  assert.match(await page.locator('#notice').innerText(),/cancelled/);assert.equal(await page.locator('#clock').innerText(),before);
  responseMode='ok';await page.locator('#send').click();await page.waitForFunction(()=>!document.querySelector('#send').disabled);assert.notEqual(await page.locator('#clock').innerText(),before);
  responseMode='hang';await page.locator('#send').click();await page.locator('#restart').click();
  await page.waitForFunction(()=>!document.querySelector('#send').disabled);
  assert.match(await page.locator('#clock').innerText(),/12/);assert.equal(await page.locator('#dialogue').innerText(),'');
  assert.match(await page.locator('#journal').innerText(),/0\/3/);assert.match(await page.locator('#notice').innerText(),/new night/);
  responseMode='ok';await fullLoop();await page.locator('#suspect').selectOption('silas');await page.locator('#choice').selectOption('rescue');await page.locator('#decide').click();await page.locator('#confirm-decision').click();
  assert.match(await page.locator('#ending').innerText(),/Truth & mercy/);
  console.log('PASS additional: restart while request pending; complete winning loop through local HTTP provider adapter.');
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  fs.mkdirSync(path.resolve('artifacts'),{recursive:true});await page.screenshot({path:path.resolve('artifacts/last-inn-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1280,height:900});await page.screenshot({path:path.resolve('artifacts/last-inn-desktop.png'),fullPage:true});
  await page.locator('#restart').click();await page.locator('#decide').click();
  assert.match(await page.locator('#decision-summary').innerText(),/0\/3.*unsupported/i);
  await page.screenshot({path:path.resolve('artifacts/last-inn-confirm-desktop.png')});
  await page.setViewportSize({width:390,height:844});
  assert(await page.locator('#decision-review').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&el.scrollWidth<=el.clientWidth;}));
  await page.screenshot({path:path.resolve('artifacts/last-inn-confirm-mobile.png')});
  await page.keyboard.press('Escape');
  assert.deepEqual(errors,[]);
  console.log('PASS Chromium: rehearsal full win, unsupported loss, restart, all 3 NPC HTTP requests, key isolation, XSS text rendering, 429 recovery, cancel, retry, mobile overflow, no JS errors.');
  console.log('Provider fixture only — no live AI provider tested.');
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
