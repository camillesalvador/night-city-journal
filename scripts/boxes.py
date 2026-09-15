import json
from collections import deque
p=open('/tmp/quest-pixels.raw','rb').read(); w,h=9984,7936; step=4
W,H=w//step,h//step
mask=set()
for y in range(H):
 for x in range(W):
  i=(y*step*w+x*step)*4;r,g,b=p[i:i+3]
  if max(r,g,b)-min(r,g,b)>100 and max(r,g,b)>140: mask.add(y*W+x)
boxes=[]
while mask:
 seed=mask.pop(); stack=[seed]; xmin=xmax=seed%W;ymin=ymax=seed//W;n=0
 while stack:
  a=stack.pop();x=a%W;y=a//W;n+=1;xmin=min(xmin,x);xmax=max(xmax,x);ymin=min(ymin,y);ymax=max(ymax,y)
  for v in (a-1,a+1,a-W,a+W):
   if v in mask:mask.remove(v);stack.append(v)
 if 38<xmax-xmin<55 and 38<ymax-ymin<55:
  x=xmin*step;y=ymin*step
  if x>8300 and y<4000:continue
  i=((y+8)*w+x+8)*4
  boxes.append(dict(x=x-3,y=y-3,w=(xmax-xmin)*step+7,h=(ymax-ymin)*step+7,color=list(p[i:i+3])))
boxes.sort(key=lambda b:(round(b['y']/100),b['x']))
json.dump(boxes,open('/tmp/quest-boxes.json','w'));print(len(boxes))
