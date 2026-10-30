import { useEffect, useRef, useState } from 'react';
import { CopyButton } from '../../components/copy-button';
import './study.css';

const diagnosticFixture='MenuFold diagnostics (Study fixture)\nAuto-hide: enabled\nIdle delay: 5s\nStatus: ready';
export default function Study() {
  const [value,setValue]=useState(diagnosticFixture);
  const [disabled,setDisabled]=useState(false);
  const [failure,setFailure]=useState(false);
  const [copied,setCopied]=useState('');
  const [fixtureIssue,setFixtureIssue]=useState('');
  const failureRef=useRef(false);
  // Deliberately isolated Study fixture. Production CopyButton always calls navigator.clipboard.
  useEffect(()=>{
    if (!navigator.clipboard) {setFixtureIssue('此环境无 Clipboard API，组件会显示真实错误。');return;}
    const clipboard=navigator.clipboard;
    const original=clipboard.writeText;
    const descriptor=Object.getOwnPropertyDescriptor(clipboard,'writeText');
    try {
      Object.defineProperty(clipboard,'writeText',{configurable:true,value:(text:string)=>failureRef.current ? Promise.reject(new DOMException('Study fixture: clipboard denied','NotAllowedError')) : original.call(clipboard,text)});
    } catch {setFixtureIssue('当前浏览器不允许注入失败 fixture。');return;}
    return ()=>{if(descriptor)Object.defineProperty(clipboard,'writeText',descriptor);else Reflect.deleteProperty(clipboard,'writeText');};
  },[]);
  return <div className="mfc-study"><section data-capture-root className="mfc-study__stage"><header><span>MENUFOLD / DIAGNOSTICS</span><h2>让问题更容易被理解</h2><p>复制诊断信息，带上完整的上下文。</p></header><div className="mfc-study__card"><span className="mfc-study__caption">诊断信息 · 示例数据</span><code>{value || '空文本'}</code><CopyButton value={value} disabled={disabled} onCopied={setCopied}/></div><output className="mfc-study__status" aria-live="polite">{copied===value&&copied ? '最近一次复制已完成' : '可编辑内容后再次复制'}</output></section>
    <div className="mfc-study__fixtures"><p>Study fixture · 正常模式实际写入系统剪贴板；失败开关仅在此演示中注入 rejected promise。</p><label className="mfc-study__field">复制内容<textarea aria-label="复制内容" value={value} onChange={e=>setValue(e.target.value)} rows={4}/></label><div className="mfc-study__controls"><label><input type="checkbox" checked={failure} onChange={e=>{failureRef.current=e.target.checked;setFailure(e.target.checked);}}/>注入复制失败</label><label><input type="checkbox" checked={disabled} onChange={e=>setDisabled(e.target.checked)}/>禁用按钮</label><button type="button" onClick={()=>{failureRef.current=false;setFailure(false);setDisabled(false);setCopied('');setValue(diagnosticFixture);}}>重置输入</button></div>{fixtureIssue&&<p role="status">{fixtureIssue}</p>}</div></div>;
}
