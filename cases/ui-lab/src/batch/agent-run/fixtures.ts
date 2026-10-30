import type {RunDraft, RunStep} from '../../components/agent-run';

export const runTitle='Prepare the Q3 board update';
export const runDraft:RunDraft={
  label:'Board memo – Q3 · Revenue',
  original:'Revenue grew 18% in Q3 to $4.2M, mostly driven by new enterprise customers. Churn stayed flat at 2.1%, and we expect the pipeline to carry into Q4 without changes to the plan.',
  suggested:'Revenue grew 21% in Q3 to $4.3M, driven by six new enterprise customers. Churn fell to 1.8%, and the pipeline supports raising the Q4 target by 5%.',
};

export function makeSteps():RunStep[]{return [
  {id:'revenue',title:'Pull Q3 revenue and churn',detail:'From Stripe, July to September',tool:'stripe.query',status:'pending',calls:[
    {id:'revenue-months',name:'stripe.query',summary:'Revenue by month, Q3',status:'pending',durationMs:700,args:{metric:'revenue',from:'2026-07-01',to:'2026-09-30',group_by:'month'},result:{total:4310000,months:[1380000,1420000,1510000],growth:.21}},
    {id:'churn',name:'stripe.query',summary:'Customer churn, Q3',status:'pending',durationMs:500,args:{metric:'churn_rate',period:'quarter'},result:{churn_rate:.018,previous:.021}},
  ]},
  {id:'read',title:"Read last quarter's board memo",detail:'Keeps the structure the board knows',tool:'search',status:'pending',calls:[
    {id:'search',name:'search',summary:'Drive: “board memo Q2”',status:'pending',durationMs:900,args:{query:'board memo Q2',source:'drive',limit:5},result:[{title:'Board memo – Q2 2026',owner:'Maya Chen',edited:'Jul 9'}]},
    {id:'read-doc',name:'docs.read',summary:'Board memo – Q2 2026',status:'pending',durationMs:700,args:{doc:'Board memo – Q2 2026'},result:'6 sections · 1,240 words'},
  ]},
  {id:'write',title:'Update the memo draft',detail:'Revenue, churn and the Q4 outlook',tool:'docs.write',status:'pending',calls:[
    {id:'write-revenue',name:'docs.write',summary:'Rewrote the revenue paragraph',status:'pending',durationMs:1100,args:{doc:'Board memo – Q3 2026',section:'Revenue'},result:{changed_words:21}},
    {id:'write-chart',name:'docs.write',summary:'Added the churn chart',status:'pending',durationMs:600,args:{doc:'Board memo – Q3 2026',insert:'chart',data:'churn_rate'},result:{ok:true}},
  ]},
  {id:'email',title:'Send the draft to Maya',detail:'Needs your approval first',tool:'gmail.send',status:'pending',approval:{title:'Send the draft to Maya',description:'Emails the Q3 board memo draft for review before Friday.',risk:'medium',status:'pending',details:[{label:'To',value:'Maya Chen (CFO)'},{label:'Subject',value:'Q3 board update – draft'},{label:'Attachment',value:'Board memo – Q3 2026'}]},calls:[
    {id:'send',name:'gmail.send',summary:'Sent to maya@acme.com',status:'pending',durationMs:600,args:{to:'maya@acme.com',subject:'Q3 board update – draft',attach:'Board memo – Q3 2026'},result:{id:'msg_8f2c',status:'sent'}},
  ]},
  {id:'calendar',title:'Book a review with Maya',detail:'30 minutes before the board meeting',tool:'calendar.create',status:'pending',calls:[
    {id:'book',name:'calendar.create',summary:'Thu, Oct 15 · 10:00',status:'pending',durationMs:700,args:{title:'Q3 board memo review',with:['maya@acme.com'],duration:30},result:{event:'evt_31a',time:'2026-10-15T10:00'}},
  ]},
];}
