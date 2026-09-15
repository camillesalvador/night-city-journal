import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createProgressStore} from './progress-store.js';
import {encodeProgress,decodeProgress} from '../src/progress-text.js';
const quests=[{id:'q-1-1',name:'The Nomad'},{id:'q-2-2',name:'The Rescue'}];
test('text format supports manual edits and rejects incomplete files',()=>{
 const text=encodeProgress(new Set(),quests).replace('[ ] q-1-1','[x] q-1-1');
 assert.deepEqual([...decodeProgress(text,quests)],['q-1-1']);
 assert.throws(()=>decodeProgress('[x] q-1-1 | The Nomad\n',quests));
 assert.throws(()=>decodeProgress(text+'[x] q-1-1 | Duplicate\n',quests));
});
test('file persists across store instances, migrates once, and serializes concurrent quest updates',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'quest-store-'));const file=join(dir,'progress.txt');
 try{
 const store=createProgressStore(file,quests);
 assert.equal((await store.read()).initialized,false);
 await store.update({type:'initialize',completed:['q-1-1']});
 await store.update({type:'initialize',completed:[]});
 assert.deepEqual((await createProgressStore(file,quests).read()).completed,['q-1-1']);
 await Promise.all([store.update({type:'quest',id:'q-2-2',done:true}),store.update({type:'quest',id:'q-1-1',done:false})]);
 assert.deepEqual((await store.read()).completed,['q-2-2']);
 assert.match(await readFile(file,'utf8'),/\[x\] q-2-2 \| The Rescue/);
 await assert.rejects(store.update({type:'quest',id:'unknown',done:true}));
 await writeFile(file,'damaged file');
 await assert.rejects(store.update({type:'quest',id:'q-1-1',done:true}));
 assert.equal(await readFile(file,'utf8'),'damaged file');
 }finally{await rm(dir,{recursive:true,force:true});}
});
