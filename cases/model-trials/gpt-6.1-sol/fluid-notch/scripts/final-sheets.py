from pathlib import Path
from PIL import Image, ImageDraw
import json, subprocess, tempfile
root=Path(__file__).resolve().parent.parent
ffmpeg='/Users/damon/Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac'
out=root/'evidence/comparison';out.mkdir(exist_ok=True)
reviews={t:json.loads((root/f'evidence/{t}/playback-review.json').read_text()) for t in ['reference','reconstruction']}
def extract(target,desired,tmp):
    sample=min(reviews[target]['samples'],key=lambda s:abs(s['mediaTime']-desired))
    pts=sample['mediaTime']
    subprocess.run([ffmpeg,'-loglevel','error','-y','-ss',str(pts),'-i',str(root/f'evidence/{target}/lifecycle.webm'),'-vf','crop=480:360:240:180','-frames:v','1','-c:v','png',str(tmp)],check=True)
    return Image.open(tmp).convert('RGB'), {'requested':desired,'selectedNativeMediaTime':pts,'method':'nearest recorded requestVideoFrameCallback mediaTime, FFmpeg seek and native frame extraction; no interpolation'}
with tempfile.TemporaryDirectory(dir=out,prefix='extract-') as td:
 tmp=Path(td)/'frame.png'
 for phase in ['open','close']:
  offsets=[0,.04,.08,.12,.20,.28,.36,.48,.64];sheet=Image.new('RGB',(2160,410),'#eef0f2');draw=ImageDraw.Draw(sheet);records=[]
  for row,target in enumerate(['reference','reconstruction']):
   onset=reviews[target][phase+'Onset']
   for i,offset in enumerate(offsets):
    im,record=extract(target,onset+offset,tmp);sheet.paste(im.resize((240,180)),(i*240,row*205));draw.text((i*240+5,row*205+182),f'{target} +{round(offset*1000)}ms',fill='#344054');draw.text((i*240+5,row*205+194),f'native {record["selectedNativeMediaTime"]:.3f}s',fill='#344054');records.append(dict(target=target,offset=offset,**record))
  sheet.save(out/f'{phase}-strip.png');(out/f'{phase}-strip.json').write_text(json.dumps(records,indent=2))
 for target in ['reference','reconstruction']:
  start=max(0,reviews[target]['openOnset']-.6);end=reviews[target]['duration']-.1;times=[];t=start
  while t<=end:times.append(t);t+=.6
  sheet=Image.new('RGB',(2000,((len(times)+4)//5)*320),'#eef0f2');draw=ImageDraw.Draw(sheet);records=[]
  for i,t in enumerate(times):
   im,record=extract(target,t,tmp);x=(i%5)*400;y=(i//5)*320;sheet.paste(im.resize((400,300)),(x,y));draw.text((x+8,y+304),f'native {record["selectedNativeMediaTime"]:.3f}s',fill='#344054');records.append(record)
  sheet.save(root/f'evidence/{target}/lifecycle-contact.png');(root/f'evidence/{target}/lifecycle-contact.json').write_text(json.dumps(dict(video=f'evidence/{target}/lifecycle.webm',samples=records),indent=2))
print('Final frozen-source and reference strips/contact sheets written.')
