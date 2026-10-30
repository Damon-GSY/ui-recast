import json, math
from pathlib import Path
base=Path(__file__).resolve().parent.parent/'evidence/reference'
results={}
for label,start,end in [('expand',281,340),('collapse-q2',340,281)]:
    data=json.loads((base/f'{label}-measurements.json').read_text())
    data=[(r['t']/1000,(r['w']-start)/(end-start)) for r in data if r['t']<650]
    best=(float('inf'),None)
    for offset in range(0,85,2):
      for stiffness in range(240,621,10):
       for damping in range(20,43):
        alpha=damping/2; freq2=stiffness-alpha*alpha
        if freq2<=0: continue
        freq=math.sqrt(freq2)
        err=0
        for t,y in data:
          t=max(0,t-offset/1000)
          fitted=1-math.exp(-alpha*t)*(math.cos(freq*t)+alpha/freq*math.sin(freq*t))
          err+=(y-fitted)**2
        if err<best[0]:best=(err,dict(stiffness=stiffness,damping=damping,offsetMs=offset,rmseNormalized=math.sqrt(err/len(data))))
    results[label]=best[1]
print(json.dumps(results,indent=2))
(base/'motion-fit.json').write_text(json.dumps(results,indent=2))
