import weapons from './weapons.json';
import quests from './quests.json';
import {requestProgress} from './browser-progress.js';
import {encodeProgress} from './progress-text.js';
export {weapons};
export const weaponState={collected:new Set(),ready:false,busy:false,error:'',group:'all',questId:null};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const weaponsForQuest=id=>weapons.filter(w=>w.links.some(link=>link.questId===id));
export async function loadWeapons(){
 if(weaponState.busy)return;
 weaponState.busy=true;
 try{let data=await requestProgress(undefined,'/api/weapons');if(!data.initialized)data=await requestProgress({type:'initialize',completed:[]},'/api/weapons');weaponState.collected=new Set(data.completed);weaponState.ready=true;weaponState.error='';}
 catch(e){weaponState.ready=false;weaponState.error=e.message;}
 finally{weaponState.busy=false;}
}
export async function toggleWeapon(id){
 if(!weaponState.ready||weaponState.busy)return false;
 weaponState.busy=true;
 try{const data=await requestProgress({type:'quest',id,done:!weaponState.collected.has(id)},'/api/weapons');weaponState.collected=new Set(data.completed);weaponState.error='';return true;}
 catch(e){weaponState.error=e.message;return false;}
 finally{weaponState.busy=false;}
}
export async function restoreWeapons(completed){
 if(weaponState.busy)return false;
 weaponState.busy=true;
 try{const data=await requestProgress({type:'replace',completed:[...completed]},'/api/weapons');weaponState.collected=new Set(data.completed);weaponState.ready=true;weaponState.error='';return true;}
 catch(e){weaponState.error=e.message;return false;}
 finally{weaponState.busy=false;}
}
function collectionCheckbox(w){return `<input type="checkbox" class="check" data-weapon="${w.id}" aria-label="Collected ${esc(w.name)}" ${weaponState.collected.has(w.id)?'checked':''} ${!weaponState.ready||weaponState.busy?'disabled':''}>`;}
export function questWeaponBadge(q){const count=weaponsForQuest(q.id).length;return count?`<button class="weapon-badge" data-weapons-for="${q.id}" aria-label="Iconic weapons for ${esc(q.name)}">◇ ${count} iconic${count===1?'':'s'}</button>`:'';}
export function questWeaponDetails(q){const items=weaponsForQuest(q.id);if(!items.length)return '';return `<div class="quest-weapons"><div class="eyebrow">ICONIC WEAPONS · ${items.length}</div>${weaponState.error?`<p role="alert">${esc(weaponState.error)}</p>`:''}${items.map(w=>`<div class="quest-weapon"><label>${collectionCheckbox(w)}<span>${esc(w.name)}</span></label><p>${esc(w.links.find(l=>l.questId===q.id).relation==='acquisition'?'Acquisition mission':w.links.find(l=>l.questId===q.id).relation==='prerequisite'?'Prerequisite mission':'Related mission')} · ${esc(w.notes||w.location)}</p></div>`).join('')}<button class="btn" data-weapons-for="${q.id}">View weapon details ↗</button><p>Collected separately from quest completion.</p></div>`;}
export function renderWeapons({search='',status='all'},completed){
 const term=search.toLowerCase().trim();
 const selectedQuest=quests.find(q=>q.id===weaponState.questId);
 const rows=weapons.filter(w=>(weaponState.group==='all'||w.group===weaponState.group)&&(!selectedQuest||w.links.some(l=>l.questId===selectedQuest.id))&&(status==='all'||weaponState.collected.has(w.id)===(status==='completed'))&&`${w.name} ${w.mission} ${w.location} ${w.notes}`.toLowerCase().includes(term));
 return `<div class="weapon-intro"><div><div class="eyebrow">THE ARMORY</div><h3>${weaponState.collected.size}<small> / ${weapons.length} iconic weapons collected</small></h3><p>Track the weapon itself. Completing a mission doesn’t automatically collect its rewards.</p></div><div class="hero-actions"><button class="btn" id="export-weapons">↓ Export weapon progress</button><button class="btn" id="import-weapons">↑ Import weapon backup</button></div></div>
 <div class="weapon-tools"><label>Acquisition <select id="weapon-group" aria-label="Weapon acquisition source"><option value="all">All sources</option>${[...new Set(weapons.map(w=>w.group))].map(g=>`<option ${weaponState.group===g?'selected':''}>${esc(g)}</option>`).join('')}</select></label><span class="mono">${rows.length} weapons shown · ${weaponState.busy?'Saving…':weaponState.ready?'Saved in this browser':'Browser save unavailable'}</span>${selectedQuest?`<button class="btn" id="clear-weapon-quest">${esc(selectedQuest.name)} ×</button>`:''}</div>
 ${weaponState.error?`<div class="map-info" role="alert">${esc(weaponState.error)} <button class="btn" id="retry-weapons">Retry browser storage</button></div>`:''}
 <div class="weapon-grid">${rows.map(w=>`<article class="weapon-card ${weaponState.collected.has(w.id)?'collected':''}"><div class="weapon-card-top"><label>${collectionCheckbox(w)}<span>${esc(w.name)}</span></label><span class="weapon-source">${esc(w.group)}</span></div><div class="weapon-location">${esc(w.mission||w.location||'See acquisition notes')}</div>${w.notes?`<p class="weapon-notes">${esc(w.notes)}</p>`:''}<div class="weapon-quests">${w.links.map(l=>{const q=quests.find(q=>q.id===l.questId);return `<button class="weapon-quest-link" data-locate="${q.id}"><span>${l.relation==='acquisition'?'Mission':l.relation==='prerequisite'?'Prerequisite':'Related mission'} · ${completed.has(q.id)?'✓ Complete':'○ Incomplete'}</span>${esc(q.name)} ↗</button>`;}).join('')||'<p class="unlinked">No specific mission linked in this list.</p>'}</div><a class="source-link" href="${esc(w.sourceUrl)}" target="_blank" rel="noopener">Source row ${w.sourceRow} ↗</a></article>`).join('')||'<div class="empty">No weapons match these filters.</div>'}</div>
 <p class="weapon-source-note">Imported from <a href="${weapons[0].sourceUrl.split('&range=')[0]}" target="_blank" rel="noopener">your iconic weapons spreadsheet</a>. Acquisition notes may include spoilers and branch conditions. “Hidden Spot” and reward availability follow the sheet; exact locations are only shown where provided.</p>`;
}
export function exportWeapons(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([encodeProgress(weaponState.collected,weapons)],{type:'text/plain'}));a.download='night-city-weapons.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
