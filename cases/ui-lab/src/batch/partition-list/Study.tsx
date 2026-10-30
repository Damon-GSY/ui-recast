import { useState } from 'react';
import { PartitionList, type PartitionGroup, type PartitionItem, type PartitionMove } from '../../components/partition-list';
import './study.css';

const groups: PartitionGroup[] = [
  {id:'visible',label:'Visible',description:'Always available in the menu bar.'},
  {id:'overflow',label:'Overflow',description:'Reveal when you need them.'},
  {id:'hidden',label:'Hidden',description:'Kept out of the menu bar.'},
];
const initial: PartitionItem[] = [
  {id:'calendar',label:'Calendar',groupId:'visible',description:'Next event at a glance'},
  {id:'focus',label:'Focus',groupId:'visible',description:'Protected system control',disabled:true},
  {id:'clipboard',label:'Clipboard',groupId:'overflow',description:'Recent copies'},
  {id:'camera',label:'Camera',groupId:'hidden',description:'Available on demand'},
];
export default function Study() {
  const [items,setItems] = useState(initial);
  const [pending,setPending] = useState<PartitionMove[]>([]);
  const [errors,setErrors] = useState<Record<string,string|undefined>>({});
  const [message,setMessage] = useState('No request pending.');
  const [disabled,setDisabled] = useState(false);
  const request = (itemId:string,toGroupId:string) => { setPending(current => [...current,{itemId,toGroupId}]); setErrors(current => ({...current,[itemId]:undefined})); setMessage(`Requested ${itemId} → ${toGroupId}. Awaiting fixture response.`); };
  const succeed = () => { setItems(current => current.map(item => { const move = pending.find(p => p.itemId === item.id); return move?{...item,groupId:move.toGroupId}:item; })); setPending([]); setMessage('Study server accepted the requested moves.'); };
  const fail = () => { setErrors(current => ({...current,...Object.fromEntries(pending.map(move => [move.itemId,'Could not save. The item remains in its current partition.']))})); setPending([]); setMessage('Study server rejected the requested moves.'); };
  return <section className="mf-partitions-study"><header><span>MENUFOLD / STUDY FIXTURE</span><h2>Everything in its place.</h2><p>Choose a partition, then resolve the request below. Items move only after success.</p></header>
    <div data-capture-root className="mf-partitions-study__stage"><PartitionList groups={groups} items={items} pending={pending} errors={errors} onMove={request} disabled={disabled}/></div>
    <div className="mf-partitions-study__server"><div><span>Explicit server fixture</span><span>{pending.length} pending</span></div><p role="status">{message}</p><div className="mf-partitions-study__controls"><button type="button" disabled={!pending.length} onClick={succeed}>Server success</button><button type="button" disabled={!pending.length} onClick={fail}>Server failure</button><button type="button" disabled={!pending.length} onClick={() => {setPending([]);setMessage('Request cancelled. No partitions changed.');}}>Cancel request</button><button type="button" onClick={() => {setItems(initial);setPending([]);setErrors({});setMessage('No request pending.');setDisabled(false);}}>Reset fixture</button></div><label><input type="checkbox" checked={disabled} onChange={event => setDisabled(event.target.checked)}/> Disable partition changes</label></div>
  </section>;
}
