import quests from './quests.json';
import weapons from './weapons.json';
import {STORAGE_KEY,WEAPONS_STORAGE_KEY} from './progress.js';
import {createBrowserStore} from './browser-store.js';

const stores={
  '/api/progress':{key:STORAGE_KEY,store:createBrowserStore(STORAGE_KEY,quests,()=>localStorage)},
  '/api/weapons':{key:WEAPONS_STORAGE_KEY,store:createBrowserStore(WEAPONS_STORAGE_KEY,weapons,()=>localStorage)},
};
export async function requestProgress(action,collection='/api/progress') {
  const selected=stores[collection];
  if(!selected)throw new Error('Unknown checklist.');
  // These names identify collections only; no requests are sent to a server.
  try{
    if(action&&navigator.locks)return await navigator.locks.request(selected.key,()=>selected.store.request(action));
    return selected.store.request(action);
  }catch(error){
    if(error.name==='QuotaExceededError'||error.name==='SecurityError')throw new Error('Browser storage is unavailable or full. Allow site storage, then retry.');
    throw error;
  }
}
