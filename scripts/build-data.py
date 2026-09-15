import json, re
bs=json.load(open('/tmp/quest-ocr.json'))
colors={(0,192,0):'gig',(0,192,255):'side',(255,255,0):'main',(128,128,255):'ncpd',(192,64,255):'tarot',(255,0,255):'phantom',(0,224,224):'cyberpsycho',(0,255,192):'criminal',(224,224,224):'interlude'}
qs=[]
fixes={'GIG: LOUSY KLEPPERS':'GIG: LOUSY KLEPPERS','ICAN SEE CLEARLY NOW':'I CAN SEE CLEARLY NOW','TOTALIMMORTAL':'TOTALIMMORTAL'}
for b in bs:
 lines=b.pop('lines');title=' '.join(l['text'] for l in lines if .18<l['y']<.8 and l['height']>.075)
 title=fixes.get(title,title)
 cat=colors.get(tuple(b['color']),'ending-phantom' if b['x']>7000 and b['y']!=4893 else 'ending')
 if title=='NEVER FADE AWAY':cat='interlude'
 contact=' '.join(l['text'] for l in lines if l['y']>.82)
 qs.append(dict(id=f"q-{b['x']}-{b['y']}",name=title.title(),category=cat,contact=contact.title(),x=b['x'],y=b['y'],w=b['w'],h=b['h']))
qs.extend([dict(id='q-2081-3873',name='Love Like Fire',category='interlude',contact='Johnny Silverhand',x=2081,y=3873,w=188,h=188),dict(id='q-4897-3105',name='Chippin’ In — Johnny’s Interlude',category='side-interlude',contact='Johnny Silverhand',x=4897,y=3105,w=188,h=188)])
# Main story comes first. Map coordinates preserve the source layout, not an inferred unlock order.
order=['main','phantom','side','gig','cyberpsycho','ncpd','tarot','criminal','interlude','side-interlude','ending','ending-phantom']
for q in qs:
 q['name']=re.sub(r"(?<=[a-zA-Z])'([A-Z])",lambda m: "'"+m[1].lower(),q['name'])
 q['contact']=q['contact'].replace('Hanako Arasako','Hanako Arasaka').replace('Hanako Arasakd','Hanako Arasaka').replace('Ncpd','NCPD')
 if q['name']=='Nocturne Op55N1':q['name']='Nocturne OP55N1'
 if q['name']=='Gig: Mia':q['name']='Gig: MIA'
 if q['name']=='Kold Mirage':q['contact']='Nix'
qs.sort(key=lambda q:(order.index(q['category']),q['x'] if q['category']=='main' else q['y'],q['y'] if q['category']=='main' else q['x']))
json.dump(qs,open('src/quests.json','w'),ensure_ascii=False,indent=2)
for q in qs:
 if not q['name']:print('EMPTY',q)
print(len(qs))
