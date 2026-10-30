'use client';

import { useId, useRef, useState } from 'react';
import '@fontsource-variable/inter';
import { ApprovalCard, type ApprovalCardProps, type ApprovalCardStatus } from '../components/approval-card';
import reference from '../../evidence/approval-card/reference/official-preview.jpg';
import liveReference from '../../evidence/pro-tests/approval-card/reference/pending.png';
import './ApprovalCardStudy.css';

function MailIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="1.5" /><path d="m5 7 7 6 7-6" /></svg>;
}

function Recipients() {
  return <div className="approval-study__recipients">
    <span className="approval-study__avatars" aria-hidden="true">{['M', 'J', 'S', 'A'].map(letter => <span key={letter}>{letter}</span>)}</span>
    <span className="approval-study__to"><span className="approval-study__names">Mia, Jonas, Sara, Alex</span><span className="approval-study__more">+38 more</span></span>
  </div>;
}

export function ApprovalCardStudy() {
  const id = useId();
  const [version, setVersion] = useState(0);
  const generation = useRef(0);
  const [dark, setDark] = useState(false);
  const [width, setWidth] = useState(420);
  const [actions, setActions] = useState<ApprovalCardProps['actions']>('tray');
  const [risk, setRisk] = useState<NonNullable<ApprovalCardProps['risk']> | 'none'>('medium');
  const [expiresIn, setExpiresIn] = useState(0);
  const [fail, setFail] = useState(false);
  const [asyncApproval, setAsyncApproval] = useState(true);
  const [controlled, setControlled] = useState(false);
  const [status, setStatus] = useState<ApprovalCardStatus>('pending');
  const [allowAlways, setAllowAlways] = useState(true);
  const [shortcuts, setShortcuts] = useState(true);
  const [editable, setEditable] = useState(false);
  const [subject, setSubject] = useState("What's new in October");
  const subjectInput = useRef<HTMLInputElement>(null);
  const [events, setEvents] = useState<string[]>([]);

  function record(message: string) { setEvents(previous => [...previous.slice(-7), message]); }
  function reset() {
    generation.current += 1;
    setVersion(value => value + 1);
    setStatus('pending');
    setEvents([]);
  }

  return <section className="approval-study" aria-labelledby={`${id}-title`}>
    <header className="approval-study__heading">
      <div><p className="approval-study__eyebrow">IMAGE INPUT → LIVE CLASSIC / AFFECTUI PRO</p><h2 id={`${id}-title`}>Approval Card</h2></div>
      <p>批准前确认、可暂停到期计时与决策后的收合。</p>
    </header>

    <div className="approval-study__comparison">
      <figure className="approval-study__panel">
        <figcaption>原版浏览器截图 <span>Classic · pending · 420px</span></figcaption>
        <div className="approval-study__reference-live"><img src={liveReference} width="420" height="288" alt="Classic 默认审批卡：浅灰预览面板、卡内 always 复选框、灰色 tray 上的 Deny 与 Approve。" /></div>
        <details className="approval-study__full-reference"><summary>最初图像输入 · OG 营销图 · 1200 × 630</summary><img src={reference} width="1200" height="630" alt="AffectUI Approval Card 官方营销预览全图；与 live Classic 默认布局不同" /></details>
      </figure>

      <div className="approval-study__panel">
        <div className="approval-study__panel-heading">独立实现 <span>live · {width}px 容器</span></div>
        <div className="approval-study__scene" data-theme={dark ? 'dark' : 'light'}>
          <div className="approval-study__example" style={{ width }}>
            <ApprovalCard key={version}
              title="Send campaign email" description="October product update · Newsletter"
              icon={<MailIcon />} risk={risk === 'none' ? undefined : risk} actions={actions}
              preview={<Recipients />}
              details={[{ label: 'Subject', value: subject }, { label: 'Send', value: 'Today, 9:00 AM' }]}
              status={controlled ? status : undefined} expiresIn={expiresIn || undefined}
              allowAlways={allowAlways} shortcuts={shortcuts}
              onApprove={async ({ always }) => {
                const active = generation.current;
                record(`onApprove · always=${always}`);
                if (asyncApproval) await new Promise(resolve => window.setTimeout(resolve, 750));
                if (active !== generation.current) return;
                if (fail) {
                  record('rejected · 留在 pending');
                  throw new Error('Demo: approval failed. Turn off “批准失败” and try again.');
                }
                record('approved · 仅 UI 演示');
                if (controlled) setStatus('approved');
              }}
              onExpire={() => record('onExpire')}
              onDeny={({ reason }) => { record(`onDeny · reason=${reason}`); if (controlled) setStatus('denied'); }}
              onEdit={editable ? () => { record('onEdit'); subjectInput.current?.focus(); } : undefined}
            />
          </div>
        </div>
        <div className="approval-study__transport"><button type="button" onClick={reset}>重置请求</button><span>{asyncApproval ? '业务模拟等待 750ms' : '回调立即返回'} · 高度过渡 520ms</span></div>
      </div>
    </div>

    <form className="approval-study__controls" onSubmit={event => event.preventDefault()} aria-label="Approval Card 验证控件">
      <label>容器宽度<select value={width} onChange={event => setWidth(Number(event.target.value))}>{[320, 339, 340, 399, 400, 420, 440, 520].map(value => <option key={value} value={value}>{value}px</option>)}</select></label>
      <label>操作布局<select value={actions} onChange={event => setActions(event.target.value as ApprovalCardProps['actions'])}><option value="card">card</option><option value="tray">tray</option></select></label>
      <label>risk<select value={risk} onChange={event => setRisk(event.target.value as typeof risk)}>{['none', 'low', 'medium', 'high'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>到期<select value={expiresIn} onChange={event => { setExpiresIn(Number(event.target.value)); reset(); }}><option value={0}>关闭</option><option value={5}>5 秒</option><option value={12}>12 秒</option><option value={60}>60 秒</option></select></label>
      <label>外部状态<select value={status} disabled={!controlled} onChange={event => setStatus(event.target.value as ApprovalCardStatus)}><option value="pending">pending</option><option value="approved">approved</option><option value="denied">denied</option></select></label>
      <label>主题<select value={dark ? 'dark' : 'light'} onChange={event => setDark(event.target.value === 'dark')}><option value="light">浅色</option><option value="dark">暗色</option></select></label>
      <div className="approval-study__toggles">
        <label><input type="checkbox" checked={asyncApproval} onChange={event => setAsyncApproval(event.target.checked)} />异步批准（750ms）</label>
        <label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} />批准失败</label>
        <label><input type="checkbox" checked={controlled} onChange={event => { setControlled(event.target.checked); reset(); }} />受控状态</label>
        <label><input type="checkbox" checked={allowAlways} onChange={event => setAllowAlways(event.target.checked)} />always checkbox</label>
        <label><input type="checkbox" checked={shortcuts} onChange={event => setShortcuts(event.target.checked)} />快捷键提示</label>
        <label><input type="checkbox" checked={editable} onChange={event => setEditable(event.target.checked)} />Edit</label>
      </div>
      {editable && <label className="approval-study__subject">Subject<input ref={subjectInput} value={subject} onChange={event => setSubject(event.target.value)} /></label>}
    </form>
    <div className="approval-study__events"><span>回调顺序</span><ol>{events.length ? events.map((event, index) => <li key={`${version}-${index}`}>{event}</li>) : <li>等待操作</li>}</ol></div>
    <p className="approval-study__note">观察范围：原版 Classic 的 pending、approved、denied 截图、渲染测量，以及 25fps 录像的 10fps 采样帧。默认 420px / tray；决策时旧内容模糊淡出、容器收缩、单行结果延迟显现。已据此校准阶段与声明时序，模糊量和位移仍为拟合，暗色与窄容器未纳入此次原版观察。异步控件只模拟业务等待，高度过渡独立计时。演示仅触发 UI 回调。</p>
  </section>;
}
