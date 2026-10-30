import { useMemo, useState } from 'react';
import BlockDashboard2, {type DashboardTransaction} from '../../components/block-dashboard2';
import periodFixture from './periods.json';
import transactionFixture from './transactions.json';
import observedIcons from './assets/icons.json';
import './study.css';

const asset=(name:string)=>new URL(`./assets/${name}`,import.meta.url).href;
// These are public preview fixtures, never connected to an account or financial backend.
const icons=Object.fromEntries(Object.entries(observedIcons).map(([name,svg])=>[name.replace('lucide-',''),<span key={name} aria-hidden="true" dangerouslySetInnerHTML={{__html:svg}}/>]));
const navigation=[
  {label:'Overview',items:[{label:'Dashboard',icon:icons['layout-dashboard']},{label:'Analytics',icon:icons['chart-column']},{label:'Activity',icon:icons.activity}]},
  {label:'Users',items:[{label:'Directory',icon:icons.users,children:['All users','Workspaces']},{label:'Invitations',icon:icons['user-plus']}]},
  {label:'Billing',items:[{label:'Subscriptions',icon:icons['credit-card']},{label:'Usage',icon:icons.zap},{label:'Invoices',icon:icons.receipt}]},
  {label:'Reports',items:[{label:'Saved reports',icon:icons['file-text']},{label:'Exports',icon:icons.download}]},
];
const metrics=[
  {label:'Gross Revenue',value:'$487,500.00',previous:'$426,800.00',change:'+14.2%',icon:icons['circle-dollar-sign']},
  {label:'Net Profit',value:'$213,100.00',previous:'$168,200.00',change:'+26.7%',icon:icons.wallet},
  {label:'Refund Rate',value:'3.1%',previous:'4.2%',change:'+26.2%',icon:icons['rotate-ccw']},
  {label:'Avg Transaction',value:'$74.20',previous:'$68.40',change:'+8.5%',icon:icons['credit-card']},
];
const notifications=[
  {id:'feed',title:'Bank feed synced',description:'42 new transactions imported from Northwind Business Checking.',time:'4m ago'},
  {id:'budget',title:'Budget threshold',description:'Marketing spend is at 88% of the quarterly envelope.',time:'1h ago'},
  {id:'close',title:'Reconciliation reminder',description:'3 accounts are due for month-end close review.',time:'3h ago'},
  {id:'report',title:'CFO report ready',description:'Consolidated P&L for last month is available to export.',time:'Yesterday'},
];
export default function Study(){
  const initial=useMemo(()=>transactionFixture.map(row=>({...row,avatar:row.avatar?asset(row.avatar):undefined})),[]);
  const [rows,setRows]=useState<DashboardTransaction[]>(initial),[reset,setReset]=useState(0),[event,setEvent]=useState('No demo action yet.');
  return <div className="block-dashboard2-study"><div className="block-dashboard2-study__stage"><BlockDashboard2 key={reset} brand={{name:'Shadcnblocks',description:'SaaS Platform',logo:<img src={asset('shadcnblocks-logo.svg')} alt=""/>}} user={{name:'Jack Walsh',email:'jack.walsh@example.com',avatar:asset('avatar1.webp')}} navigation={navigation} periods={periodFixture} metrics={metrics} transactions={rows} notifications={notifications} icons={icons} draftDescription="Capture a quick note for your close checklist. This demo does not persist data." onNavigate={label=>setEvent(`Navigation callback: ${label}`)} onPeriodChange={label=>setEvent(`Period callback: ${label}`)} onSaveDraft={description=>setEvent(`Draft callback: ${description || '(empty note)'}`)} onNotificationsRead={()=>setEvent('Notification callback: marked as read')} onExport={data=>{
    const csv=['ID,Customer,Amount,Type,Method,Status',...data.map(t=>[t.id,t.customer,t.amount,t.type,t.method,t.status].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','))].join('\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download='synthetic-transactions.csv';link.click();URL.revokeObjectURL(url);setEvent(`Exported ${data.length} synthetic rows.`);
  }} onTransactionAction={(action,row)=>{setEvent(`${action} callback: ${row.id}`);if(action==='Duplicate')setRows(current=>[...current,{...row,id:`DEMO-${current.length+1}`}]);if(action==='Void Transaction')setRows(current=>current.map(t=>t.id===row.id?{...t,status:'Failed'}:t));}}/></div><div className="block-dashboard2-study__controls"><p>Synthetic finance fixture · public preview values · local demo only</p><button onClick={()=>{setRows(initial);setReset(v=>v+1);setEvent('Demo reset.')}}>Reset dashboard</button><output aria-live="polite">{event}</output></div></div>
}
