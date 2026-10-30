"""Build paired README GIF excerpts from original recordings (Pillow + FFmpeg).
No interpolation or time stretching. Per-side offsets/crops are explicit in clips.json.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, os, subprocess, tempfile, sys
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/readme/showcase'
SPECS=json.loads((OUT/'clips.json').read_text())
FF=os.environ.get('FFMPEG','ffmpeg')
FONT_PATH='/System/Library/Fonts/Supplemental/Arial.ttf'
try: FONT=ImageFont.truetype(FONT_PATH,22)
except OSError: FONT=ImageFont.load_default(size=22)
FPS=12.5

def build(item):
 name,spec=item;w,h=spec['panel'];frames=[]
 with tempfile.TemporaryDirectory(prefix='ui-recast-gif-') as temp:
  for section,segment in enumerate(spec['segments']):
   sides=[]
   for side,source in enumerate(spec['sources']):
    folder=Path(temp)/f'{section}-{side}';folder.mkdir()
    subprocess.run([FF,'-hide_banner','-loglevel','error','-ss',str(segment['starts'][side]),'-i',str(ROOT/source),'-t',str(segment['duration']),'-r',str(FPS),'-threads','1',str(folder/'%04d.png')],check=True)
    sides.append(sorted(folder.glob('*.png')))
   count=min(map(len,sides))
   for i in range(count):
    canvas=Image.new('RGB',(w*2+24,h+52),'white');draw=ImageDraw.Draw(canvas)
    draw.text((12,12),'Reference',font=FONT,fill='#262626');draw.text((w+24,12),'Reconstruction',font=FONT,fill='#262626')
    for side in range(2):
     with Image.open(sides[side][i]) as source_image:
      im=source_image.convert('RGB')
      if 'crops' in spec:im=im.crop(spec['crops'][side])
      im=ImageOps.contain(im,(w,h),Image.Resampling.LANCZOS)
      canvas.paste(im,(12+side*(w+12)+(w-im.width)//2,48+(h-im.height)//2))
    draw.line((w+18,0,w+18,h+52),fill='#e5e5e5');frames.append(canvas)
   # Readability holds repeat a real settled frame and are disclosed in the manifest.
   for _ in range(round(segment.get('hold',0)*FPS)):frames.append(frames[-1].copy())
  # One palette for both panels and the whole sequence prevents palette flicker.
  samples=[f.resize((128,64)) for f in frames[::max(1,len(frames)//24)]]
  sheet=Image.new('RGB',(128,64*len(samples)))
  for i,sample in enumerate(samples):sheet.paste(sample,(0,64*i))
  base=sheet.quantize(colors=192,method=Image.Quantize.MEDIANCUT)
  # Preserve small accent/portrait colors that a mostly neutral UI palette can lose.
  colored=[]
  for frame in frames[::max(1,len(frames)//24)]:
   sample=frame.copy();sample.thumbnail((384,192))
   colored.extend(rgb for rgb in sample.getdata() if max(rgb)-min(rgb)>25)
  if colored:
   colored=colored[::max(1,len(colored)//50000)]
   swatch=Image.new('RGB',(len(colored),1));swatch.putdata(colored)
   accents=swatch.quantize(colors=64,method=Image.Quantize.MEDIANCUT)
   palette=Image.new('P',(1,1));palette.putpalette(base.getpalette()[:192*3]+accents.getpalette()[:64*3])
  else:palette=sheet.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
  indexed=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in frames]
  target=OUT/f'{name}.gif';indexed[0].save(target,save_all=True,append_images=indexed[1:],duration=80,loop=0,optimize=True,disposal=1)
  with Image.open(target) as gif:
   duration=sum(gif.seek(i) or gif.info.get('duration',0) for i in range(gif.n_frames))
   result={'name':name,'size':list(gif.size),'frames':gif.n_frames,'durationMs':duration,'bytes':target.stat().st_size,'loop':gif.info.get('loop')}
  print(json.dumps(result),flush=True);return result
names=sys.argv[1:] or list(SPECS)
with ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(build,[(n,SPECS[n])for n in names]))
all_results=[]
for name in SPECS:
 target=OUT/f'{name}.gif'
 if not target.exists():continue
 with Image.open(target) as gif:
  duration=sum(gif.seek(i) or gif.info.get('duration',0) for i in range(gif.n_frames))
  all_results.append({'name':name,'size':list(gif.size),'frames':gif.n_frames,'durationMs':duration,'bytes':target.stat().st_size,'loop':gif.info.get('loop')})
(OUT/'generated.json').write_text(json.dumps(all_results,indent=2)+'\n')
