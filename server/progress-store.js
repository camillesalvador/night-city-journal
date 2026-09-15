import {mkdir, readFile, writeFile, rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {validateProgress} from '../src/progress.js';
import {encodeProgress,decodeProgress} from '../src/progress-text.js';
export function createProgressStore(file,quests) {
  let queue=Promise.resolve();
  async function read(){try{return {initialized:true,completed:[...decodeProgress(await readFile(file,'utf8'),quests)]};}catch(e){if(e.code==='ENOENT')return {initialized:false,completed:[]};throw e;}}
  async function write(completed){await mkdir(dirname(file),{recursive:true});const temp=`${file}.${randomUUID()}.tmp`;await writeFile(temp,encodeProgress(completed,quests),'utf8');await rename(temp,file);return {initialized:true,completed:[...completed]};}
  function update(action){const result=queue.then(async()=>{const current=await read();if(action.type==='initialize')return current.initialized?current:write(validateProgress({version:1,completed:action.completed},quests));if(action.type==='replace')return write(validateProgress({version:1,completed:action.completed},quests));if(action.type!=='quest'||typeof action.done!=='boolean'||!quests.some(q=>q.id===action.id))throw new Error('Invalid quest update.');const next=new Set(current.completed);if(action.done)next.add(action.id);else next.delete(action.id);return write(next);});queue=result.catch(()=>{});return result;}
  return {read,update};
}
export function progressPlugin(file,quests,endpoint='/api/progress') {
 const store=createProgressStore(file,quests);
 const install=server=>{server.middlewares.use(endpoint,async(req,res,next)=>{
  if(req.url!=='/'&&req.url!=='')return next();
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
  // Only the local app may write the file; never enable cross-origin writes.
  if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`){res.statusCode=403;res.end(JSON.stringify({error:'Origin not allowed'}));return;}
  try{
   if(req.method==='GET'){res.end(JSON.stringify(await store.read()));return;}
   if(req.method!=='POST'){res.statusCode=405;res.end(JSON.stringify({error:'Method not allowed'}));return;}
   if(!req.headers['content-type']?.startsWith('application/json')){res.statusCode=415;res.end(JSON.stringify({error:'JSON required'}));return;}
   let body='';for await(const chunk of req){body+=chunk;if(body.length>100000)throw new Error('Progress request too large.');}
   res.end(JSON.stringify(await store.update(JSON.parse(body))));
  }catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}));}
 });};
 return {name:`progress-file-${endpoint}`,configureServer:install,configurePreviewServer:install};
}
