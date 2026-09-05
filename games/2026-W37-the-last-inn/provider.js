(function(root){
 'use strict';
 function endpoint(value){
  let u;try{u=new URL(value);}catch{throw new Error('Enter a complete Chat Completions URL.');}
  const local=['localhost','127.0.0.1','[::1]'].includes(u.hostname);
  if((u.protocol!=='https:'&&!(u.protocol==='http:'&&local))||u.username||u.password||u.search||u.hash)throw new Error('Use HTTPS, or HTTP on localhost; no URL credentials, query or fragment.');
  return u.href;
 }
 class Client{
  constructor(fetcher=globalThis.fetch.bind(globalThis),timeout=20000){this.fetcher=fetcher;this.timeout=timeout;this.used=0;this.busy=false;this.controller=null;}
  cancel(){if(this.controller)this.controller.abort();}
  async ask(config,messages){
   if(this.busy)throw new Error('A request is already in progress.');
   if(this.used>=24)throw new Error('Session request budget exhausted (24). Reload only if you authorize a new budget.');
   const url=endpoint(config.endpoint);if(!config.model||config.model.length>120)throw new Error('Enter a model name (1–120 characters).');
   if(messages.length>8||JSON.stringify(messages).length>6500)throw new Error('Conversation context exceeds the input budget.');
   this.busy=true;this.used++;const controller=new AbortController();this.controller=controller;let timedOut=false;
   const timer=setTimeout(()=>{timedOut=true;controller.abort();},this.timeout);
   try{
    const headers={'Content-Type':'application/json'};if(config.key)headers.Authorization='Bearer '+config.key;
    const response=await this.fetcher(url,{method:'POST',headers,body:JSON.stringify({model:config.model,messages,max_tokens:220,stream:false}),signal:controller.signal,redirect:'error',credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw new Error('Provider HTTP '+response.status+'. Check endpoint/model/key, then retry.');
    const reader=response.body.getReader();let size=0,text='';const decoder=new TextDecoder();
    try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();throw new Error('Provider response exceeds 64 KiB.');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}
    let data;try{data=JSON.parse(text);}catch{throw new Error('Provider returned invalid JSON.');}
    const content=data?.choices?.[0]?.message?.content;
    if(typeof content!=='string'||!content.trim())throw new Error('Provider returned no usable text. Requires Chat Completions choices[0].message.content.');
    if(controller.signal.aborted)throw new Error('aborted');
    return content.slice(0,1200);
   }catch(e){
    if(controller.signal.aborted)throw new Error(timedOut?'Request timed out after 20 seconds. Retry or change connection.':'Request cancelled. No investigation beat spent.');
    // Never expose raw provider error bodies or fetch errors (which may contain credentials).
    if(/^Provider (HTTP|response exceeds|returned)/.test(e.message))throw e;
    throw new Error('Connection failed. Check network, CORS, endpoint and model. No automatic retry.');
   }finally{clearTimeout(timer);this.busy=false;this.controller=null;}
  }
 }
 const api={endpoint,Client};if(typeof module!=='undefined')module.exports=api;else root.InnAI=api;
})(globalThis);
