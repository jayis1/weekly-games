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
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content:'<img src=x onerror=alert(1)> Hold the lamp steady.'}}]}));
  });
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const target=process.env.LANTERN_BUILD||path.resolve(__dirname,'../index.html');
  await page.goto('file://'+target);
  await page.getByRole('button',{name:'Begin the watch'}).click();
  await page.locator('#mode').selectOption('rehearsal');
  await page.getByRole('button',{name:'Apply connection'}).click();
  assert.match(await page.locator('#connection-status').innerText(),/scripted rehearsal.*not live AI/i);
  await page.locator('[data-signal="shoal"]').click();
  await page.locator('#captain').selectOption('ferry');
  await page.locator('#question').fill('Can your passengers cross safely?');
  await page.getByRole('button',{name:'Transmit'}).click();
  await page.locator('#present-signal').selectOption('shoal');
  await page.getByRole('button',{name:'Transmit'}).click();
  await page.locator('[data-signal="tug"]').click();
  await page.locator('#captain').selectOption('freighter');
  await page.locator('#present-signal').selectOption('');
  await page.getByRole('button',{name:'Transmit'}).click();
  await page.locator('#present-signal').selectOption('tug');
  await page.getByRole('button',{name:'Transmit'}).click();
  assert.match(await page.locator('#watch-status').innerText(),/0 watches/);
  await page.locator('#first-vessel').selectOption('ferry');await page.locator('#tug-order').selectOption('send');
  await page.getByRole('button',{name:'Commit harbor order'}).click();
  assert.match(await page.locator('#ending').innerText(),/Safe harbor/);
  await page.getByRole('button',{name:'Restart watch'}).click();
  assert.match(await page.locator('#watch-status').innerText(),/6 watches/);

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
  await page.locator('#consent').uncheck();
  await page.getByRole('button',{name:'Transmit'}).click();
  assert.equal(requests.length,0);assert.match(await page.locator('#notice').innerText(),/authorize live transmissions/i);
  await page.locator('#consent').check();
  for(const captain of ['ferry','freighter']){
   await page.locator('#captain').selectOption(captain);await page.locator('#question').fill('State your safest route.');await page.getByRole('button',{name:'Transmit'}).click();
   await page.waitForFunction(()=>!document.querySelector('#transmit').disabled);
  }
  assert.equal(requests.length,2);
  assert.equal(new Set(requests.map(request=>request.body.messages[0].content)).size,2);
  for(const request of requests){assert.equal(request.authorization,'Bearer fixture-session-key');assert(!JSON.stringify(request.body).includes('fixture-session-key'));}
  assert.equal(await page.locator('#dialogue img').count(),0);assert.match(await page.locator('#dialogue').innerText(),/<img/);
  assert.deepEqual(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}})),{local:{},session:{}});

  await page.locator('[data-signal="tug"]').click();await page.locator('#captain').selectOption('ferry');await page.locator('#present-signal').selectOption('tug');
  await page.getByRole('button',{name:'Transmit'}).click();
  assert.equal(requests.length,2);assert.match(await page.locator('#notice').innerText(),/does not belong/);
  await page.locator('#present-signal').selectOption('');

  responseMode='error';const before=await page.locator('#watch-status').innerText();await page.getByRole('button',{name:'Transmit'}).click();await page.waitForFunction(()=>!document.querySelector('#transmit').disabled);
  assert.match(await page.locator('#notice').innerText(),/HTTP 429/);assert.equal(await page.locator('#watch-status').innerText(),before);
  responseMode='hang';await page.getByRole('button',{name:'Transmit'}).click();await page.getByRole('button',{name:'Cancel request'}).click();await page.waitForFunction(()=>!document.querySelector('#transmit').disabled);
  assert.match(await page.locator('#notice').innerText(),/cancelled/i);assert.equal(await page.locator('#watch-status').innerText(),before);
  responseMode='ok';
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(pageErrors,[]);
  console.log('PASS Chromium: complete rehearsal win/restart; both captains through local protocol fixture; key isolation; XSS-as-text; HTTP recovery; cancellation; responsive layout; no page errors.');
  console.log('Local fixture and scripted rehearsal only — no live AI model tested.');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
