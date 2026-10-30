"use client";

import { useId, useState } from 'react';
import { AutonomyDial, type AgentAction, type AutonomyLevel } from '../components/autonomy-dial';
import referenceImage from '../../evidence/pro-tests/autonomy-dial/reference/if-risky.png';
import './AutonomyDialStudy.css';

// Independent, hand-drawn brand approximations; no original SVG paths are used.
function ServiceIcon({ service }: { service: 'notion' | 'gmail' | 'crm' | 'drive' | 'payments' }) {
  const id = useId();
  return (
    <svg viewBox={service === 'gmail' ? '1 2 18 16' : '1 1 18 18'} fill="none" aria-hidden="true" focusable="false">
      {service === 'notion' && <><path d="m3 2 13-.4 2 2.5v13.3L5 18l-2-2.5Z" fill="#fff" stroke="#171717" /><path d="M3 2 5 4.3l13-.2M5 4.3V18M7 14V7l6 7V7M6 7h3m3 0h3m-9 7h3" stroke="#171717" strokeWidth="1.4" strokeLinejoin="round" /></>}
      {service === 'gmail' && <><defs><linearGradient id={`${id}-left`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fc413d" /><stop offset="1" stopColor="#c90000" /></linearGradient><linearGradient id={`${id}-right`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffda45" /><stop offset=".5" stopColor="#35c46a" /><stop offset="1" stopColor="#1fa7f0" /></linearGradient></defs><path d="M2 16V4l8 6 8-6v12" stroke="#fc413d" strokeWidth="3" strokeLinejoin="round" /><path d="M2 5v11" stroke={`url(#${id}-left)`} strokeWidth="3" /><path d="m10 10 8-6v12" stroke={`url(#${id}-right)`} strokeWidth="3" strokeLinejoin="round" /></>}
      {service === 'crm' && <g stroke="#ff7a59" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="10" r="3.5" /><path d="M9.5 7.5 4 3m8 3.5V2m2.5 10-4 4" /><circle cx="4" cy="3" r="1" fill="#ff7a59" /><circle cx="12" cy="2" r="1" fill="#ff7a59" /><circle cx="10" cy="17" r="1.5" /></g>}
      {service === 'drive' && <><path d="m7 2 6 0 6 11-3 5Z" fill="#1aa768" /><path d="M7 2 1 13l3 5 6-11Z" fill="#1aa768" /><path d="M1 13h12l3 5H4Z" fill="#1aa768" /><path d="m10 7 3 6H7Z" fill="#fff" /></>}
      {service === 'payments' && <><rect x="2" y="2" width="16" height="16" rx="4" fill="#635bff" /><path d="M13 6.3c-1.1-.8-5-.9-5 1.3 0 2 5 1.5 5 3.9 0 2.3-3.7 2.8-6 1.3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></>}
    </svg>
  );
}

const actions: AgentAction[] = [
  { id: 'read', label: 'Read files and docs', risk: 'safe', icon: <ServiceIcon service="notion" /> },
  { id: 'draft', label: 'Draft emails', risk: 'safe', icon: <ServiceIcon service="gmail" /> },
  { id: 'crm', label: 'Update CRM records', risk: 'risky', icon: <ServiceIcon service="crm" /> },
  { id: 'send', label: 'Send emails', risk: 'risky', icon: <ServiceIcon service="gmail" /> },
  { id: 'delete', label: 'Delete files', risk: 'destructive', icon: <ServiceIcon service="drive" /> },
  { id: 'spend', label: 'Spend money', risk: 'destructive', icon: <ServiceIcon service="payments" /> },
];

export function AutonomyDialStudy() {
  const id = useId();
  const [level, setLevel] = useState<AutonomyLevel>(1);
  const [pinned, setPinned] = useState(['spend']);
  const [dark, setDark] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [width, setWidth] = useState(420);

  function reset() {
    setLevel(1);
    setPinned(['spend']);
    setDark(false);
    setReducedMotion(false);
    setWidth(420);
  }

  return (
    <section className="autonomy-dial-study" data-theme={dark ? 'dark' : 'light'} aria-labelledby={`${id}-title`}>
      <header className="autonomy-dial-study__heading">
        <p className="autonomy-dial-study__eyebrow">affectUI · Component study</p>
        <h1 id={`${id}-title`}>Autonomy Dial</h1>
        <p>Three levels of autonomy. Each action shows what your agent may do on its own.</p>
      </header>

      <div className="autonomy-dial-study__controls" role="group" aria-label="Preview controls">
        <button type="button" aria-pressed={dark} onClick={() => setDark(value => !value)}>Dark theme</button>
        <label className="autonomy-dial-study__motion"><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} /> Reduce motion</label>
        <label className="autonomy-dial-study__width">Width <select value={width} onChange={event => setWidth(Number(event.target.value))}><option value={420}>420px</option><option value={400}>400px</option><option value={320}>320px</option><option value={280}>280px</option></select></label>
        <button type="button" onClick={reset}>Reset</button>
      </div>

      <div className="autonomy-dial-study__comparison">
        <figure className="autonomy-dial-study__reference">
          <figcaption>Public preview capture · If risky · 420 × 480</figcaption>
          <div className="autonomy-dial-study__stage">
            <img src={referenceImage} width={420} height={480} alt="Autonomy Dial public preview: Sales agent, If risky selected, two actions run on their own and four ask first. Spend money is the only locked action." />
          </div>
          <a href="https://www.affectui.com/components/autonomy-dial?style=classic" target="_blank" rel="noreferrer">View public reference ↗</a>
        </figure>
        <div className="autonomy-dial-study__preview">
          <p className="autonomy-dial-study__caption">Interactive reconstruction</p>
          <div className="autonomy-dial-study__stage">
            <div className="autonomy-dial-study__sizer" style={{ maxWidth: width }}>
              <AutonomyDial title="Sales agent" actions={actions} level={level} onLevelChange={setLevel} pinned={pinned} onPinnedChange={setPinned} reducedMotion={reducedMotion} />
            </div>
          </div>
          <p className="autonomy-dial-study__hint">Arrow keys choose a level. Tab to a lock; Space toggles it. System reduced motion is always respected.</p>
        </div>
      </div>
      <p className="autonomy-dial-study__note">Calibrated to the public Classic preview captures, measured styles and sampled interaction video. Motion animates row positions, container height and directional counts. Icons and brand marks are independent approximations; row timing is fitted to the recording.</p>
    </section>
  );
}
