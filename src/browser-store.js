import {makeBackup,validateProgress} from './progress.js';

// Read fresh state for each update so another tab's changes are preserved.
export function createBrowserStore(key, entries, getStorage) {
  const known=new Set(entries.map(entry=>entry.id));
  function read() {
    const raw=getStorage().getItem(key);
    if(raw===null)return {initialized:false,completed:[]};
    const completed=validateProgress(JSON.parse(raw),entries);
    return {initialized:true,completed:[...completed]};
  }
  function write(ids) {
    if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'||!known.has(id)))throw new Error('This backup contains entries for a different checklist.');
    const completed=new Set(ids);
    // Only return success after storage accepts the write.
    getStorage().setItem(key,JSON.stringify(makeBackup(completed)));
    return {initialized:true,completed:[...completed]};
  }
  function request(action) {
    if(!action)return read();
    // Explicit imports can repair invalid stored data; ordinary updates cannot.
    if(action.type==='replace')return write(action.completed);
    const current=read();
    if(action.type==='initialize')return current.initialized?current:write(action.completed);
    if(action.type!=='quest'||typeof action.done!=='boolean'||!known.has(action.id))throw new Error('Invalid checklist update.');
    const next=new Set(current.completed);
    if(action.done)next.add(action.id);else next.delete(action.id);
    return write([...next]);
  }
  return {request};
}
