import { useState } from 'react';
import { FixedDock, type FixedDockItem } from '../../components/fixed-dock';
import './study.css';

function Icon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {name === 'home' ? <><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 21v-8h6v8"/></> : name === 'files' ? <><path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9H3Z"/></> : name === 'activity' ? <><path d="M3 12h4l3-7 4 14 3-7h4"/></> : name === 'settings' ? <><path d="M4 7h16M4 17h16"/><rect x="7" y="4" width="4" height="6" rx="1"/><rect x="14" y="14" width="4" height="6" rx="1"/></> : <><rect x="4" y="7" width="16" height="14" rx="3"/><path d="M8 7V5a4 4 0 0 1 8 0v2M12 13v2"/></>}
  </svg>;
}
const items: FixedDockItem[] = [
  {id:'home',label:'总览',icon:<Icon name="home"/>},
  {id:'files',label:'文件',icon:<Icon name="files"/>},
  {id:'activity',label:'活动',icon:<Icon name="activity"/>},
  {id:'settings',label:'设置',icon:<Icon name="settings"/>},
  {id:'locked',label:'团队空间',icon:<Icon name="locked"/>,disabled:true,disabledReason:'尚未加入团队'},
];
export default function Study() {
  const [value,setValue]=useState('home');
  const [disabled,setDisabled]=useState(false);
  const [changes,setChanges]=useState(0);
  const selected=items.find(item=>item.id===value)!;
  return <div className="mfd-study"><section data-capture-root className="mfd-study__stage">
    <div className="mfd-study__heading"><span>MENUFOLD / WORKSPACE</span><h2>随手抵达</h2><p>常用工具，总在熟悉的位置。</p></div>
    <div className="mfd-study__content"><span className="mfd-study__content-icon"><Icon name={value}/></span><h3>{selected.label}</h3><p>当前工作区</p></div>
    <FixedDock items={items} value={value} disabled={disabled} onValueChange={id=>{setValue(id);setChanges(n=>n+1);}}/>
    <output className="mfd-study__output" aria-live="polite">已选择：{selected.label}</output>
  </section><div className="mfd-study__fixtures"><span>Study fixture · 本地选择演示</span><label><input type="checkbox" checked={disabled} onChange={e=>setDisabled(e.target.checked)}/>禁用 Dock</label><button type="button" onClick={()=>{setValue('home');setDisabled(false);setChanges(0);}}>重置</button><output>选择回调：{changes}</output></div></div>;
}
