import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateProgress,makeBackup,filterQuests} from './progress.js';
const quests=JSON.parse(readFileSync(new URL('./quests.json',import.meta.url)));
test('map entries have unique persistent IDs and complete names',()=>{assert.equal(new Set(quests.map(q=>q.id)).size,360);assert.ok(quests.every(q=>q.name&&q.x>=0&&q.y>=0&&q.w>0));assert.ok(quests.some(q=>q.name.includes('No License, No Problem')));});
test('backup round trip preserves completion and removes unknown and duplicate IDs',()=>{const id=quests[0].id;const result=validateProgress(JSON.parse(JSON.stringify(makeBackup(new Set([id])))),quests);assert.deepEqual([...result],[id]);assert.deepEqual([...validateProgress({version:1,completed:[id,id,'unknown']},quests)],[id]);});
test('invalid backups are rejected before replacing progress',()=>{for(const v of [null,{}, {version:2,completed:[]},{version:1,completed:[7]}])assert.throws(()=>validateProgress(v,quests));});
test('search, category, and completion filters intersect',()=>{const q=quests.find(q=>q.name==='The Nomad');const done=new Set([q.id]);assert.equal(filterQuests(quests,done,{search:' NOMAD ',status:'completed',category:'main'}).length,1);assert.equal(filterQuests(quests,done,{search:'nomad',status:'remaining'}).length,0);assert.equal(filterQuests(quests,done,{search:'nomad',category:'side'}).length,0);});
