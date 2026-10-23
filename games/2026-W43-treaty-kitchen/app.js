(()=>{
 'use strict';
 const G=globalThis.TreatyKitchenGame,P=globalThis.TreatyKitchenAI;
 let state=G.fresh(),config=null,client=new P.Client(),generation=0;
 const $=selector=>document.querySelector(selector);
 const elements={game:$('#game'),status:$('#hour-status'),pips:$('#hour-pips'),statusbar:$('.statusbar'),notice:$('#notice'),dialogue:$('#dialogue'),ask:$('#ask'),cancel:$('#cancel'),connection:$('#connection-status'),ending:$('#ending'),pantry:$('#pantry'),menuStatus:$('#menu-status'),serve:$('#serve')};
 function setNotice(text){elements.notice.textContent=text;}
 function chosenMenu(){return [...elements.pantry.querySelectorAll('input:checked')].map(input=>input.value);}
 function buildPantry(){
  elements.pantry.replaceChildren();
  for(const [id,ingredient] of Object.entries(G.INGREDIENTS)){
   const label=document.createElement('label');label.className='ingredient';
   const input=document.createElement('input');input.type='checkbox';input.value=id;input.name='menu';
   input.addEventListener('change',()=>{if(chosenMenu().length>G.MENU_SIZE){input.checked=false;setNotice(`Only ${G.MENU_SIZE} ingredients fit on the table.`);}render();});
   const text=document.createElement('span');text.textContent=ingredient.name;
   label.append(input,text);elements.pantry.append(label);
  }
 }
 function renderMeters(){
  elements.pips.replaceChildren();
  for(let i=0;i<G.HOURS;i++){const pip=document.createElement('span');pip.className='pip'+(i<state.hours?'':' spent');elements.pips.append(pip);}
  elements.statusbar.classList.toggle('low',state.hours<=2&&!state.ended);
  document.querySelectorAll('#roster [data-delegate]').forEach(li=>{const d=state.delegates[li.dataset.delegate];const badge=li.querySelector('.badge');li.classList.toggle('heard',d.asked>0);badge.textContent=d.asked>0?`Asked ${d.asked} time${d.asked===1?'':'s'}`:'Not yet asked';});
 }
 function render(){
  renderMeters();
  elements.status.textContent=`${state.hours} hour${state.hours===1?'':'s'} remain`;
  const menu=chosenMenu();
  elements.menuStatus.textContent=`${menu.length}/${G.MENU_SIZE} chosen`;
  elements.pantry.querySelectorAll('input').forEach(input=>{input.disabled=state.ended;});
  elements.ask.disabled=state.ended||state.hours<=0||!config;
  elements.serve.disabled=state.ended;
 }
 function addTurn(delegateId,question,reply){
  const turn=document.createElement('div');turn.className='turn';
  const label=document.createElement('strong');label.textContent=G.DELEGATES[delegateId].name;
  const q=document.createElement('p');q.textContent=`You: ${question}`;
  const a=document.createElement('p');a.textContent=reply;
  turn.append(label,q,a);elements.dialogue.append(turn);turn.scrollIntoView({block:'nearest'});
 }
 $('#begin').addEventListener('click',()=>{elements.game.hidden=false;$('#begin').disabled=true;render();elements.game.scrollIntoView({behavior:'smooth'});});
 $('#apply').addEventListener('click',()=>{
  const key=$('#api-key').value;$('#api-key').value='';
  try{
   const mode=$('#mode').value;
   if(mode==='live'){
    if(!$('#consent').checked)throw new Error('Authorize live transmissions first.');
    const endpoint=P.endpoint($('#endpoint').value);
    const model=$('#model').value.trim();
    if(!model)throw new Error('Enter a model name.');
    config={mode,endpoint,model,key};
    elements.connection.textContent='Live BYO-AI ready. No request is sent until you press Ask.';
   }else{
    config={mode};
    elements.connection.textContent='Scripted rehearsal active — offline demonstration, not live AI.';
   }
   setNotice('Connection applied. Choose a delegate and ask.');render();
  }catch(error){elements.connection.textContent=error.message;config=null;render();}
 });
 elements.ask.addEventListener('click',async()=>{
  const delegateId=$('#delegate').value,question=$('#question').value.trim();
  if(!question){setNotice('Enter a question before asking.');return;}
  try{
   if(config.mode==='live'&&!$('#consent').checked)throw new Error('Authorize live transmissions before each request.');
   G.validateAsk(state,delegateId);
  }catch(error){setNotice(error.message);return;}
  const requestGeneration=generation;
  elements.ask.disabled=true;elements.cancel.disabled=config.mode!=='live';
  setNotice(config.mode==='live'?'Asking your provider…':'Running labeled scripted rehearsal…');
  try{
   const reply=config.mode==='live'?await client.ask(config,G.messages(state,delegateId,question)):G.rehearsal(delegateId,question);
   if(requestGeneration!==generation)return;
   const outcome=G.recordAsk(state,delegateId);
   G.remember(state,delegateId,question,reply);
   addTurn(delegateId,question,reply);
   setNotice(outcome.text);
  }catch(error){if(requestGeneration===generation)setNotice(error.message);}
  finally{if(requestGeneration===generation){elements.cancel.disabled=true;render();}}
 });
 elements.cancel.addEventListener('click',()=>client.cancel());
 elements.serve.addEventListener('click',()=>{
  try{
   const outcome=G.serve(state,chosenMenu());
   elements.ending.hidden=false;elements.ending.classList.toggle('bad',outcome.code!=='signed');elements.ending.classList.toggle('mixed',outcome.code==='accord');
   elements.ending.replaceChildren();
   const title=document.createElement('h3');title.textContent=outcome.title;
   const text=document.createElement('p');text.textContent=outcome.text;
   elements.ending.append(title,text);elements.ending.focus();render();
  }catch(error){setNotice(error.message);}
 });
 $('#restart').addEventListener('click',()=>{
  generation++;client.cancel();state=G.fresh();
  elements.dialogue.replaceChildren();elements.ending.hidden=true;elements.ending.replaceChildren();
  elements.pantry.querySelectorAll('input').forEach(input=>{input.checked=false;});
  setNotice('A new banquet begins. Connection choice remains for this page session.');render();
 });
 buildPantry();render();
})();
