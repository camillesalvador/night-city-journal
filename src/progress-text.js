export function encodeProgress(completed, quests) {
  return '# Night City Journal — progress v1\n# Change [ ] to [x] to complete a quest. Keep entry IDs unchanged.\n\n'+quests.map(q=>`[${completed.has(q.id)?'x':' '}] ${q.id} | ${q.name}`).join('\n')+'\n';
}
export function decodeProgress(text, quests) {
  const known=new Set(quests.map(q=>q.id)), seen=new Set(), completed=new Set();
  for(const line of text.split(/\r?\n/)) {
    if(!line.trim()||line.startsWith('#'))continue;
    const m=line.match(/^\[([ xX])\] ([a-z0-9-]+) \| .+$/);
    if(!m||!known.has(m[2])||seen.has(m[2]))throw new Error('Invalid progress entry. Restore the IDs and checkbox format.');
    seen.add(m[2]);if(m[1].toLowerCase()==='x')completed.add(m[2]);
  }
  if(seen.size!==known.size)throw new Error('The progress file is missing entries. Restore the complete file before saving.');
  return completed;
}
