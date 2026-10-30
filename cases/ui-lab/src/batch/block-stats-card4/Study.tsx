import { useState } from 'react';
import BlockStatsCard4 from '../../components/block-stats-card4';
import './study.css';
const currency = (n: number) => `$${n.toLocaleString('en-US')}`;
export default function Study() {
  const [reversed, setReversed] = useState(false);
  return <div className="block-stats-card4-study"><div className="block-stats-card4-study__stage"><BlockStatsCard4 title="Revenue" current={reversed ? 10230 : 12450} previous={reversed ? 12450 : 10230} currentLabel={reversed ? 'Last month' : 'This month'} previousLabel={reversed ? 'This month' : 'Last month'} formatValue={currency} /></div><div className="block-stats-card4-study__controls"><span>Synthetic comparison fixture</span><button onClick={() => setReversed(v => !v)}>Swap periods</button><button onClick={() => setReversed(false)}>Reset comparison</button></div></div>;
}
