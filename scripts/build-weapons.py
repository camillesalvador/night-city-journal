import csv,json,re,unicodedata
from pathlib import Path
root=Path(__file__).resolve().parent.parent
rows=list(csv.reader((root/'sources/iconic-weapons.csv').open()))
quests=json.loads((root/'src/quests.json').read_text())
url='https://docs.google.com/spreadsheets/d/1StSHyeT7RB-yUyAvr_4WDNGRElfhBro3A1JQNEJiu58/edit?gid=395592532'
def norm(s):
 s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower().replace('gig: ','').replace(' (corpo)','')
 return re.sub(r'[^a-z0-9]','',s)
lookup={norm(q['name']):q['id'] for q in quests}
for alias,name in [('Beat on the Brat: Arroyo','Beat On The Brat: Champion Of Arroyo'),('Sacrum Profanum','Losing My Religion / Sacrum Profanum')]:lookup[norm(alias)]=next(q['id'] for q in quests if q['name']==name)
weapons=[]
for col in [0,3,8]:
 group='';section='';expansion=False
 for index,row in enumerate(rows):
  value=row[col]
  if value not in ['FALSE','TRUE']:
   if value:
    section=value
    if col==0:
     group={'Airdrops (Phantom Liberty) [Airdrop-Specific Checklist Here]':'Airdrops','Airdrops / Amazon Prime Reward':'Airdrops / Prime rewards','"My Rewards" Goodies':'My Rewards','Suspected Organized Crime Activity':'NCPD activities','Increased Criminal Activity (Phantom Liberty)':'Criminal activities','Weapon Vendors':'Vendors'}.get(value,group)
    if value in ['Main Missions','Side Jobs','Gigs','Hidden in World']:group=value
    if value in ['Main Missions','Side Jobs','Gigs','Hidden in World','GENERAL (BASE GAME)']:expansion=False
    if 'PHANTOM LIBERTY' in value.upper():expansion=True
   continue
  if col==0 and index<23:continue # Source decision checkboxes are not weapon entries.
  name=row[col+1];location=row[col+2];notes=row[col+3] if col else ''
  if not name:continue
  linked=[]
  if group in ['Main Missions','Side Jobs','Gigs'] and location!='---':
   if norm(location) in lookup:linked.append({'questId':lookup[norm(location)],'relation':'acquisition'})
   else:print('UNMATCHED',name,location)
  # Explicit connections in notes/world descriptions; no geographic inference.
  for text,target,relation in [('Led There During KOLD MIRAGE','Kold Mirage','related'),('Complete: Spy in the Jungle','Gig: Spy In The Jungle','prerequisite'),('Complete Lucretia My Reflection','Lucretia My Reflection','prerequisite')]:
   if text in notes or text in location:linked.append({'questId':lookup[norm(target)],'relation':relation})
  weapons.append(dict(id='w-'+re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-'),name=name,group=group,section=section,mission=location if group in ['Main Missions','Side Jobs','Gigs'] and location!='---' else '',location=location if location!='---' else '',notes=notes if notes!='---' else '',links=linked,sourceUrl=url+'&range='+chr(65+col+1)+str(index+1)+':'+chr(65+(col+3 if col else 2))+str(index+1),sourceRow=index+1))
weapons.sort(key=lambda w:w['name'].lower())
(root/'src/weapons.json').write_text(json.dumps(weapons,indent=2,ensure_ascii=False)+'\n')
print(len(weapons),'weapons;',sum(bool(w['links']) for w in weapons),'with quest links')
