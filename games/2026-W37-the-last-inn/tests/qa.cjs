// Feature-freeze QA: real browser controls; explicitly scripted, never live AI.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();const errors=[],network=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.addInitScript(()=>{window.qaLongTasks=[];new PerformanceObserver(list=>window.qaLongTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});});
  await page.goto('file://'+(process.env.INN_BUILD||path.resolve(__dirname,'../index.html')));
  await page.locator('#start').focus();await page.keyboard.press('Enter');
  assert(await page.locator('#play').isVisible());
  await page.locator('#mode').selectOption('rehearsal');await page.locator('#apply').click();
  // Turn-based pause: no input means no progress or NPC network activity.
  const clock=await page.locator('#clock').innerText();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('#clock').innerText(),clock);
  await page.locator('[data-clue="ledger"]').click();
  const inspected=await page.locator('#clock').innerText();
  await page.locator('[data-clue="ledger"]').click();
  assert.equal(await page.locator('#clock').innerText(),inspected);
  await page.locator('#question').fill('   ');await page.locator('#send').click();
  assert.match(await page.locator('#notice').innerText(),/Ask a question first/);
  assert.equal(await page.locator('#clock').innerText(),inspected);
  const endings=[];
  async function restart(){await page.locator('#restart').click();assert.equal(await page.locator('#clock').innerText(),'12 beats until dawn');assert.equal(await page.locator('#ending').isVisible(),false);assert.equal(await page.locator('#dialogue').innerText(),'');assert.match(await page.locator('#journal').innerText(),/No clues yet/);}
  async function testimony(){
   for(const [clue,npc] of [['ledger','mara'],['wire','silas'],['scarf','ivo']]){
    await page.locator(`[data-clue="${clue}"]`).click();await page.locator('#npc').selectOption(npc);
    await page.locator('#question').fill('What happened?');await page.locator('#send').click();
    await page.locator('#evidence').selectOption(clue);await page.locator('#send').click();
   }
   assert.match(await page.locator('#journal').innerText(),/3\/3/);
   assert.equal(await page.locator('#clock').innerText(),'3 beats until dawn');
  }
  for(const [suspect,choice,expected] of [['silas','rescue','Truth & mercy'],['silas','stay','A cold justice'],['mara','rescue','The wrong door']]){
   await restart();await testimony();await page.locator('#suspect').selectOption(suspect);await page.locator('#choice').selectOption(choice);
   await page.locator('#decide').click();await page.locator('#confirm-decision').click();
   assert((await page.locator('#ending').innerText()).startsWith(expected));endings.push(expected);
   for(const selector of ['#send','#decide','[data-clue="wire"]'])assert(await page.locator(selector).isDisabled());
  }
  await restart();await page.locator('#decide').click();await page.locator('#confirm-decision').click();assert.match(await page.locator('#ending').innerText(),/A guess in the dark/);endings.push('unsupported');
  await restart();await page.locator('#question').fill('Tell me more.');
  for(let i=0;i<12;i++)await page.locator('#send').click();
  assert.match(await page.locator('#ending').innerText(),/The last bell/);endings.push('deadline');
  await restart();
  for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:900});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`page overflow at ${width}`);
   await page.locator('#decide').click();
   assert(await page.locator('#decision-review').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&el.scrollWidth<=el.clientWidth;}),`modal overflow at ${width}`);
   await page.keyboard.press('Escape');
  }
  const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
  const before=await cdp.send('Performance.getMetrics');
  for(let i=0;i<50;i++){await page.locator('#restart').click();await page.locator('[data-clue="ledger"]').click();}
  const after=await cdp.send('Performance.getMetrics');
  const metric=(snapshot,name)=>snapshot.metrics.find(m=>m.name===name)?.value;
  const perf=await page.evaluate(()=>({loadMs:performance.getEntriesByType('navigation')[0].loadEventEnd,domNodes:document.querySelectorAll('*').length,longTasks:window.qaLongTasks}));
  perf.taskDurationSeconds=metric(after,'TaskDuration')-metric(before,'TaskDuration');
  perf.jsHeapUsedBytes=metric(after,'JSHeapUsedSize');
  // Reload intentionally discards progress and applied connection; no save feature exists.
  await page.reload();assert(await page.locator('#opening').isVisible());
  await page.locator('#start').click();assert.equal(await page.locator('#clock').innerText(),'12 beats until dawn');
  await page.locator('#send').click();assert.match(await page.locator('#notice').innerText(),/connection|rehearsal/i);
  assert.deepEqual(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}})),{local:{},session:{}});
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  console.log(JSON.stringify({result:'PASS',endings,checks:['keyboard start','idle pause','free reread','blank question','ending locks','restart','320/390/768/1280px layouts','50 restart/inspect cycles','reload reset','empty storage','no HTTP requests','no JS errors'],performance:perf,limitation:'Headless Chromium observations, not human playtesting, live AI, audio, or cross-browser certification.'},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
