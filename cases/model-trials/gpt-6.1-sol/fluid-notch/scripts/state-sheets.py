from PIL import Image, ImageDraw
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
out=root/'evidence/comparison';out.mkdir(parents=True,exist_ok=True)
groups=[['idle','question-1','question-2','question-3'],['completion','narrow-question-1','dark-question','mode-wide-grain-no-dust']]
for groupnum,names in enumerate(groups,1):
 sheet=Image.new('RGB',(960,len(names)*390),'#eef0f2');draw=ImageDraw.Draw(sheet)
 for row,name in enumerate(names):
  for col,target in enumerate(['reference','reconstruction']):
   im=Image.open(root/'evidence'/target/(name+'.png')).convert('RGB')
   cx,cy=im.width/2,im.height/2
   if name.startswith('narrow'):
    crop=im.crop((0,int(cy-180),im.width,int(cy+180)))
    cell=Image.new('RGB',(480,360),'white');cell.paste(crop,((480-crop.width)//2,0))
   else: cell=im.crop((int(cx-240),int(cy-180),int(cx+240),int(cy+180)))
   sheet.paste(cell,(col*480,row*390));draw.text((col*480+12,row*390+370),f'{target} / {name}',fill='#344054')
 sheet.save(out/f'states-{groupnum}.png')
reference=json.loads((root/'evidence/reference/states.json').read_text())
local=json.loads((root/'evidence/reconstruction/states.json').read_text())
rows=[]
for r in reference:
 l=next((l for l in local if l['name']==r['name']),None)
 if l and 'rect'in r:rows.append({'state':r['name'],'reference':r['rect'],'reconstruction':l['rect']})
(out/'state-geometry.json').write_text(json.dumps(rows,indent=2))
print(json.dumps(rows,indent=2))
