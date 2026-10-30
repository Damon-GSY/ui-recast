const {chromium}=require('/Users/damon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises');const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:960,height:720}});await page.goto('http://127.0.0.1:4231/?capture');
 const reviews={};
 await page.route('**/evidence/**/*.webm', async route => { const pathname = new URL(route.request().url()).pathname; await route.fulfill({ status: 200, contentType: 'video/webm', body: await fs.readFile(path.join(root, pathname)) }); });
 if(process.argv[2]==='reconstruction') reviews.reference=JSON.parse(await fs.readFile(path.join(root,'evidence/reference/playback-review.json'),'utf8')); 
 if(process.argv[2]==='strips') for(const t of ['reference','reconstruction']) reviews[t]=JSON.parse(await fs.readFile(path.join(root,`evidence/${t}/playback-review.json`),'utf8'));
 for(const target of process.argv[2]==='strips'?[]:process.argv[2]==='reconstruction'?['reconstruction']:['reference','reconstruction']){
  const review=await page.evaluate(async target=>{
   const v=document.createElement('video');v.src=`/evidence/${target}/lifecycle.webm`;v.muted=true;v.playsInline=true;v.style.cssText='position:fixed;inset:0;width:960px;height:720px;z-index:999;background:white';document.body.append(v);
   await new Promise((resolve,reject)=>{v.onloadedmetadata=resolve;v.onerror=reject});
   const canvas=document.createElement('canvas');canvas.width=480;canvas.height=360;const c=canvas.getContext('2d',{willReadFrequently:true});
   const samples=[];v.playbackRate=1;
   await new Promise(async resolve=>{
    const frame=(now,meta)=>{
     c.drawImage(v,240,180,480,360,0,0,480,360);
     const data=c.getImageData(0,0,480,360).data;const rows=new Uint16Array(360),cols=new Uint16Array(480);
     for(let y=0;y<360;y++)for(let x=0;x<480;x++){const i=(y*480+x)*4;if(data[i]<55&&data[i+1]<55&&data[i+2]<55){rows[y]++;cols[x]++;}}
     const ys=[...rows.keys()].filter(y=>rows[y]>80),xs=[...cols.keys()].filter(x=>cols[x]>10);
     samples.push({mediaTime:meta.mediaTime,presentedFrames:meta.presentedFrames,width:xs.length?xs.at(-1)-xs[0]+1:0,height:ys.length?ys.at(-1)-ys[0]+1:0,top:ys[0]??null});
     if(!v.ended)v.requestVideoFrameCallback(frame);
    };
    v.onended=resolve;v.requestVideoFrameCallback(frame);await v.play();
   });
   const firstOpen=samples.find((s,i)=>i>0&&s.height>44&&samples.slice(Math.max(0,i-6),i).some(p=>p.height>=36&&p.height<=42));
   const openTime=firstOpen.mediaTime;
   const firstClose=samples.find((s,i)=>s.mediaTime>openTime+.8&&s.height>45&&s.height<235&&samples.slice(Math.max(0,i-3),i).some(p=>p.height>=240));
   // Play the actual first transition at one quarter speed; keep native samples.
   v.currentTime=Math.max(0,openTime-.08);await new Promise(resolve=>v.onseeked=resolve);v.playbackRate=.25;
   const slow=[];await new Promise(async resolve=>{const frame=(now,meta)=>{slow.push({mediaTime:meta.mediaTime,presentedFrames:meta.presentedFrames});if(meta.mediaTime>=openTime+.72){v.pause();resolve();}else v.requestVideoFrameCallback(frame)};v.requestVideoFrameCallback(frame);await v.play()});
   const duration=v.duration;v.remove();return{target,duration,playbackRate:1,slowPlaybackRate:.25,openOnset:openTime,closeOnset:firstClose?.mediaTime,samples,slow};
  },target);
  reviews[target]=review;await fs.writeFile(path.join(root,`evidence/${target}/playback-review.json`),JSON.stringify(review,null,2));console.log({target,duration:review.duration,openOnset:review.openOnset,closeOnset:review.closeOnset,nativeSamples:review.samples.length});
 }
 await fs.mkdir(path.join(root,'evidence/comparison'),{recursive:true});
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
