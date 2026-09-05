/* No persistence: keys and character memories live only in this closure. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),G=globalThis.Inn;
 const client=new InnAI.Client();let state=G.create(),config=null,history={mara:[],silas:[],ivo:[]},generation=0;
 const note=text=>{$('notice').textContent=text;};
 function line(parent,text){const p=document.createElement('p');p.textContent=text;parent.append(p);}
 function render(){
  $('clock').textContent=`${state.beats} beats until dawn`;
  const busy=client.busy,ended=!!state.ending;
  for(const id of ['send','npc','evidence','question','decide','suspect','choice'])$(id).disabled=busy||ended;
  $('apply').disabled=busy;$('cancel').disabled=!busy;
  for(const el of document.querySelectorAll('[data-clue]'))el.disabled=busy||ended;
  const selected=$('evidence').value;$('evidence').replaceChildren(new Option('Listen first — no evidence',''));
  for(const id of state.clues)$('evidence').add(new Option(G.CLUES[id].name,id));
  if(state.clues.includes(selected))$('evidence').value=selected;
  const id=$('npc').value,n=G.NPCS[id];$('witness').textContent=`${n.name} · ${n.role} · Trust: ${state.trust[id]===0?'guarded':'listening'}${state.testimony.includes(id)?' · testimony confirmed':''}`;
  $('journal').replaceChildren();
  if(!state.clues.length)line($('journal'),'No clues yet. Search the inn.');
  for(const clue of state.clues)line($('journal'),G.CLUES[clue].name+': '+G.CLUES[clue].text);
  line($('journal'),`Confirmed testimony: ${state.testimony.length}/3`);
  for(const witness of state.testimony)line($('journal'),G.NPCS[witness].name+': '+G.NPCS[witness].secret);
  $('dialogue').replaceChildren();for(const m of history[id])line($('dialogue'),(m.role==='user'?'You: ':n.name+': ')+m.content);
  $('ending').hidden=!ended;$('ending').textContent=ended?G.ENDINGS[state.ending]:'';
 }
 $('start').onclick=()=>{$('opening').hidden=true;$('play').hidden=false;render();};
 $('settings').onsubmit=e=>{
  e.preventDefault();if(client.busy)return;
  try{
   if($('mode').value==='rehearsal'){config={mode:'rehearsal'};$('destination').textContent='SCRIPTED REHEARSAL — not live AI. No network requests. This tests rules, not model behavior.';}
   else{
    const endpoint=InnAI.endpoint($('endpoint').value.trim());const model=$('model').value.trim();
    if(!model)throw new Error('Enter your model name.');if(!$('consent').checked)throw new Error('Authorize data sharing and possible charges before connecting.');
    config={mode:'live',endpoint,model,key:$('key').value};
    $('destination').textContent=`BYO AI destination: ${endpoint} · Model: ${model} · ${client.used}/24 attempts used. No live request sent by Apply.`;
   }
   $('key').value='';history={mara:[],silas:[],ivo:[]};note('Connection applied. Send a question when ready.');render();
  }catch(error){note(error.message);}
 };
 // Editing destination/model revokes consent; the active connection stays pinned until Apply.
 for(const id of ['endpoint','model'])$(id).addEventListener('input',()=>{$('consent').checked=false;});
 $('npc').onchange=()=>{$('evidence').value='';render();};
 for(const button of document.querySelectorAll('[data-clue]'))button.onclick=()=>{
  try{$('clue-text').textContent=G.inspect(state,button.dataset.clue);note('Clue recorded. Match what you found to a witness’s story.');render();}catch(e){note(e.message);}
 };
 $('send').onclick=async()=>{
  if(!config){note('Apply your provider connection or explicitly choose scripted rehearsal first.');return;}
  if(client.busy||state.ending)return;
  const id=$('npc').value,evidence=$('evidence').value,text=$('question').value.trim(),ticket=generation;
  if(!text){note('Ask a question first.');return;}
  try{
   const messages=G.messages(state,id,text,history[id],evidence);let reply;
   if(config.mode==='rehearsal')reply='[SCRIPTED REHEARSAL — not live AI] '+(G.eligible(state,id,evidence)||state.testimony.includes(id)?G.NPCS[id].secret:G.NPCS[id].public+' Let me know what you find.');
   else{
    const request=client.ask(config,messages);note('Waiting for your provider… You may cancel.');render();
    reply=await request;
   }
   if(ticket!==generation)return;
   const feedback=G.feedback(state,id,evidence);G.converse(state,id,evidence);
   history[id]=[...history[id],{role:'user',content:text},{role:'assistant',content:reply}].slice(-6);
   note(state.ending?G.ENDINGS[state.ending]:feedback);
  }catch(e){if(ticket===generation)note(e.message);}
  finally{
   if(config?.mode==='live')$('destination').textContent=`BYO AI destination: ${config.endpoint} · Model: ${config.model} · ${client.used}/24 attempts used.`;
   render();
  }
 };
 $('cancel').onclick=()=>client.cancel();
 $('restart').onclick=()=>{generation++;client.cancel();state=G.create();history={mara:[],silas:[],ivo:[]};$('clue-text').textContent='The rain drums on shuttered windows.';note('A new night. Conversation memories cleared; session request budget is unchanged.');render();};
 $('decide').onclick=()=>{try{G.decide(state,$('suspect').value,$('choice').value);note('The night is over. Restart to explore another decision.');render();$('ending').tabIndex=-1;$('ending').focus();}catch(e){note(e.message);}};
 render();
})();
