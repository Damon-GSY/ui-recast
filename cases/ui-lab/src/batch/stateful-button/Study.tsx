import { useState } from 'react';
import { StatefulButton, type StatefulButtonState } from '../../components/stateful-button';
import './study.css';

export default function Study() {
  const [state,setState]=useState<StatefulButtonState>({status:'idle'});
  const [disabled,setDisabled]=useState(false);
  const [requests,setRequests]=useState(0);
  const request=()=>{setRequests(n=>n+1);setState({status:'pending'});};
  return <div className="mfs-study"><section data-capture-root className="mfs-study__stage">
    <header><span>MENUFOLD / PREFERENCES</span><h2>让工具按你的习惯工作</h2><p>设置就绪，随时应用。</p></header>
    <article className="mfs-study__card"><div className="mfs-study__avatar" aria-hidden="true"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M4 17h16"/><rect x="7" y="4" width="4" height="6" rx="1"/><rect x="14" y="14" width="4" height="6" rx="1"/></svg></div><div><span className="mfs-study__recipient">{state.status==='success'?'当前设置':'待应用设置'}</span><p>启动时打开 MenuFold<br/>闲置 5 秒后收起菜单栏</p></div><div className="mfs-study__action"><StatefulButton state={state} onAction={request} onRetry={request} disabled={disabled} label="应用设置" pendingLabel="应用中" successLabel="已应用" icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h14M3 14h14"/><path d="M7 3v6M13 11v6"/></svg>}/></div></article>
    <output className="mfs-study__status">{state.status === 'pending' ? '正在应用待保存的设置' : state.status === 'success' ? '设置已应用' : state.status === 'error' ? '待应用设置已保留' : '2 项设置等待应用'}</output>
  </section><div className="mfs-study__fixtures"><p>Study fixture · 仅演示 MenuFold 应用设置，不修改系统设置。用显式控制返回结果。</p><div><button type="button" disabled={state.status!=='pending'} onClick={()=>setState({status:'success'})}>Resolve · 成功</button><button type="button" disabled={state.status!=='pending'} onClick={()=>setState({status:'error',reason:'演示服务暂时不可用。待应用设置已保留，请重试。'})}>Reject · 失败</button><button type="button" onClick={()=>{setState({status:'idle'});setDisabled(false);setRequests(0);}}>重置</button><label><input type="checkbox" checked={disabled} onChange={e=>setDisabled(e.target.checked)}/>禁用按钮</label><output>请求次数：{requests}</output></div></div></div>;
}
