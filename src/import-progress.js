import {decodeProgress} from './progress-text.js';
import {validateProgress} from './progress.js';

export function parseProgressImport(text, entries) {
  if(!text.trimStart().startsWith('{'))return decodeProgress(text,entries);
  const value=JSON.parse(text);
  const completed=validateProgress(value,entries);
  const known=new Set(entries.map(entry=>entry.id));
  if(value.completed.some(id=>!known.has(id)))throw new Error('This backup belongs to a different checklist. Choose the matching quest or weapon import.');
  return completed;
}
