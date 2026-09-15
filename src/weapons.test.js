import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createProgressStore} from '../server/progress-store.js';
import {decodeProgress} from './progress-text.js';
const weapons=JSON.parse(readFileSync(new URL('./weapons.json',import.meta.url)));
const quests=JSON.parse(readFileSync(new URL('./quests.json',import.meta.url)));
test('all 113 source weapons have unique IDs, provenance, and valid quest references',()=>{
 assert.equal(weapons.length,113);assert.equal(new Set(weapons.map(w=>w.id)).size,113);
 const ids=new Set(quests.map(q=>q.id));
 for(const w of weapons){assert.ok(w.name&&w.group&&w.sourceRow);assert.match(w.sourceUrl,/gid=395592532&range=/);for(const link of w.links){assert.ok(ids.has(link.questId));assert.ok(['acquisition','prerequisite','related'].includes(link.relation));}}
 const heist=quests.find(q=>q.name==='The Heist');
 assert.deepEqual(weapons.filter(w=>w.links.some(l=>l.questId===heist.id)).map(w=>w.name),['Kongou','Nehan','Satori']);
 assert.equal(weapons.find(w=>w.name==='Plan B').links[0].relation,'related');
 assert.equal(weapons.find(w=>w.name==='Kappa x-MOD2').links[0].relation,'prerequisite');
 assert.equal(weapons.find(w=>w.name==='Guts').links.length,0);
});
test('weapon file persists independently of quest progress',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'quest-armory-'));
 try{
 const questFile=join(dir,'progress.txt'),weaponFile=join(dir,'weapons.txt');
 const qs=createProgressStore(questFile,quests),ws=createProgressStore(weaponFile,weapons);
 await qs.update({type:'initialize',completed:[quests.find(q=>q.name==='The Heist').id]});
 await ws.update({type:'initialize',completed:[]});
 const before=await readFile(questFile,'utf8');
 assert.deepEqual((await ws.read()).completed,[]);
 await ws.update({type:'quest',id:'w-satori',done:true});
 assert.deepEqual((await createProgressStore(weaponFile,weapons).read()).completed,['w-satori']);
 assert.deepEqual([...decodeProgress(await readFile(weaponFile,'utf8'),weapons)],['w-satori']);
 assert.equal(await readFile(questFile,'utf8'),before);
 await ws.update({type:'quest',id:'w-satori',done:false});assert.deepEqual((await ws.read()).completed,[]);
 }finally{await rm(dir,{recursive:true,force:true});}
});
