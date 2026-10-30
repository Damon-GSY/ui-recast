import { useState } from 'react';
import BlockStatsCard3 from '../../components/block-stats-card3';
import './study.css';
const currency = (n: number) => `$${n.toLocaleString('en-US')}`;
export default function Study() {
  const [value, setValue] = useState(7500);
  return <div className="block-stats-card3-study">
    <div className="block-stats-card3-study__stage"><BlockStatsCard3 title="Monthly Goal" value={value} target={10000} formatValue={currency} /></div>
    <div className="block-stats-card3-study__controls"><p>Synthetic goal fixture · values stay in this demo.</p><label>Current value <input type="range" min="0" max="12500" step="250" value={value} onChange={e => setValue(Number(e.target.value))} /></label><button onClick={() => setValue(7500)}>Reset goal</button></div>
  </div>;
}
