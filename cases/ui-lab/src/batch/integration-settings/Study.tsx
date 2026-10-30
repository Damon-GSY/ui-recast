import {useEffect, useRef, useState} from 'react';
import {IntegrationSettings, type IntegrationValues} from '../../components/integration-settings';
import shopifyLogo from './shopify.svg';
import './study.css';

const initial: IntegrationValues = {enabled: true, apiKey: '', siteUrl: 'lumen-studio.com', timeZone: '(GMT +01:00) Berlin'};
const zones = ['(GMT −08:00) Los Angeles','(GMT −05:00) New York','(GMT −03:00) São Paulo','(GMT +00:00) London','(GMT +01:00) Berlin','(GMT +01:00) Amsterdam','(GMT +01:00) Warsaw','(GMT +02:00) Athens','(GMT +04:00) Dubai','(GMT +05:30) Mumbai','(GMT +08:00) Singapore','(GMT +09:00) Tokyo','(GMT +10:00) Sydney'];

export default function Study() {
  const [value, setValue] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [fixture, setFixture] = useState('sk_demo_nonfunctional_fixture_0001');
  const [keyPending, setKeyPending] = useState(false);
  const [keyIsNew, setKeyIsNew] = useState(false);
  const [version, setVersion] = useState(0);
  const [lastAction, setLastAction] = useState('Ready');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // The reference applies the sync switch immediately; only the three fields use Save.
  const dirty = value.apiKey !== baseline.apiKey || value.siteUrl !== baseline.siteUrl || value.timeZone !== baseline.timeZone;
  useEffect(() => () => clearTimeout(timer.current), []);
  const reset = () => {
    clearTimeout(timer.current);setKeyPending(false);setKeyIsNew(false);setValue({...initial});setBaseline({...initial});setVersion(v => v + 1);setLastAction('Reset fixture');
  };
  return <div className="integration-study">
    <div className="integration-study__stage">
      <IntegrationSettings variant="reference" key={version} name="Shopify store" logo={<img src={shopifyLogo} alt="" />} count={128} meta="Connected on March 4, 2026 at 09:12" value={value} dirty={dirty}
        timeZones={zones} siteHint="Your store's primary domain from Settings › Domains" keyPending={keyPending} keyIsNew={keyIsNew}
        onChange={next => {setValue(next);setLastAction('Draft changed');}}
        onSave={next => {setBaseline({...next});setKeyIsNew(false);setLastAction('Fixture snapshot accepted in memory');}}
        onDiscard={() => {clearTimeout(timer.current);setKeyPending(false);setValue({...baseline});setKeyIsNew(false);setLastAction('Draft discarded');}}
        onGenerateKey={() => {setKeyPending(true);timer.current = setTimeout(() => {setValue(v => ({...v, apiKey:fixture}));setKeyPending(false);setKeyIsNew(true);setLastAction('Loaded explicit demo key fixture');},650);}}
      />
    </div>
    <aside className="integration-study__controls">
      <button type="button" onClick={reset}>Reset preview</button>
      <label>Demo key fixture <input value={fixture} onChange={event => setFixture(event.target.value)} /></label>
      <p>Demo fixture only. Save updates this page's in-memory snapshot. Key actions load the text above; no API key is created.</p>
      <output aria-live="polite">{lastAction}</output>
    </aside>
  </div>;
}
