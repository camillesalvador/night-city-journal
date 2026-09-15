export const STORAGE_KEY = 'night-city-journal-v1';
export const WEAPONS_STORAGE_KEY = 'night-city-weapons-v1';
export function validateProgress(value, quests) {
  if (!value || value.version !== 1 || !Array.isArray(value.completed) || !value.completed.every(id => typeof id === 'string')) throw new Error('Choose a Night City Journal backup file.');
  const ids = new Set(quests.map(q => q.id));
  return new Set(value.completed.filter(id => ids.has(id)));
}
export function makeBackup(completed) { return {version:1, completed:[...completed], savedAt:new Date().toISOString()}; }
export function filterQuests(quests, completed, {category='all', status='all', search=''}) {
  const term = search.trim().toLocaleLowerCase();
  return quests.filter(q => (category==='all' || q.category===category) && (status==='all' || completed.has(q.id)===(status==='completed')) && `${q.name} ${q.contact}`.toLocaleLowerCase().includes(term));
}
