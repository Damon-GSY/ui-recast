import { useState } from 'react';
import BlockChartCard2, {type ChartCardPeriod} from '../../components/block-chart-card2';
import './study.css';
export const trafficFixture: ChartCardPeriod[] = [
  {id:'7d',label:'7d',axisMax:260,points:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label,i)=>({label,value:[186,205,237,223,249,214,231][i]}))},
  {id:'30d',label:'30d',axisMax:2000,points:['Week 1','Week 2','Week 3','Week 4'].map((label,i)=>({label,value:[1420,1650,1580,1820][i]}))},
  {id:'90d',label:'90d',axisMax:6000,points:['Jan','Feb','Mar'].map((label,i)=>({label,value:[4200,4800,5100][i]}))},
];
export default function Study(){const [period,setPeriod]=useState('7d');const [version,setVersion]=useState(0);return <div className="block-chart-card2-study"><div className="block-chart-card2-study__stage"><BlockChartCard2 key={version} title="Website Traffic" description="Unique visitors over time" periods={trafficFixture} period={period} onPeriodChange={setPeriod}/></div><div className="block-chart-card2-study__controls"><span>Synthetic traffic fixture · public preview values, no analytics connection</span><button onClick={()=>{setPeriod('7d');setVersion(v=>v+1)}}>Reset chart</button></div></div>}
