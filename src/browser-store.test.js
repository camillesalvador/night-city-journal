import test from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserStore} from './browser-store.js';
import {parseProgressImport} from './import-progress.js';
import {encodeProgress} from './progress-text.js';

const quests=[{id:'q-1-1',name:'First quest'},{id:'q-2-2',name:'Second quest'}];
const weapons=[{id:'w-satori',name:'Satori'}];
function storage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
test('new browsers start empty and initialization preserves existing progress',()=>{
 const disk=storage(),store=createBrowserStore('quests',quests,()=>disk);
 assert.deepEqual(store.request(),{initialized:false,completed:[]});
 store.request({type:'initialize',completed:[]});
 store.request({type:'quest',id:'q-1-1',done:true});
 const reload=createBrowserStore('quests',quests,()=>disk);
 assert.deepEqual(reload.request({type:'initialize',completed:[]}).completed,['q-1-1']);
 assert.deepEqual(createBrowserStore('quests',quests,storage).request().completed,[]);
});
test('text backups migrate both checklists independently and export round trips',()=>{
 const disk=storage(),qs=createBrowserStore('quests',quests,()=>disk),ws=createBrowserStore('weapons',weapons,()=>disk);
 for(const [store,items,id] of [[qs,quests,'q-1-1'],[ws,weapons,'w-satori']]){
  const imported=parseProgressImport(encodeProgress(new Set([id]),items),items);
  store.request({type:'replace',completed:[...imported]});
  assert.deepEqual(store.request().completed,[id]);
 }
 ws.request({type:'quest',id:'w-satori',done:false});
 assert.deepEqual(qs.request().completed,['q-1-1']);
});
test('invalid or wrong-checklist imports leave existing storage untouched',()=>{
 const disk=storage(),store=createBrowserStore('quests',quests,()=>disk);
 store.request({type:'initialize',completed:['q-1-1']});
 const before=disk.getItem('quests');
 for(const input of ['not a backup',encodeProgress(new Set(),weapons),JSON.stringify({version:1,completed:['w-satori']})])assert.throws(()=>parseProgressImport(input,quests));
 assert.throws(()=>store.request({type:'replace',completed:['w-satori']}));
 assert.equal(disk.getItem('quests'),before);
});
test('a denied write is reported without losing saved progress',()=>{
 const disk=storage(),store=createBrowserStore('quests',quests,()=>disk);
 store.request({type:'initialize',completed:['q-1-1']});
 disk.setItem=()=>{throw new Error('Quota exceeded');};
 assert.throws(()=>store.request({type:'quest',id:'q-2-2',done:true}),/Quota/);
 assert.deepEqual(store.request().completed,['q-1-1']);
});
test('fresh reads retain changes from another store and imports can repair corrupt data',()=>{
 const disk=storage(),a=createBrowserStore('quests',quests,()=>disk),b=createBrowserStore('quests',quests,()=>disk);
 a.request({type:'quest',id:'q-1-1',done:true});
 b.request({type:'quest',id:'q-2-2',done:true});
 assert.deepEqual(a.request().completed,['q-1-1','q-2-2']);
 disk.setItem('quests','broken json');
 assert.throws(()=>a.request());
 a.request({type:'replace',completed:['q-2-2']});
 assert.deepEqual(a.request().completed,['q-2-2']);
});
