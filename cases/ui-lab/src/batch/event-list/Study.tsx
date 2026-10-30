import { useRef, useState } from 'react';
import { EventList, type EventListItem } from '../../components/event-list';
import './study.css';

const initial: EventListItem[] = [
  { id: 'scan', title: 'Menu items detected', description: '24 items available in your menu bar.', timestamp: '09:41', dateTime: '2026-10-30T09:41:00+08:00', status: {label:'Complete',tone:'success'} },
  { id: 'sync', title: 'Preferences requested', description: 'Waiting for an explicit fixture response.', timestamp: '09:40', dateTime: '2026-10-30T09:40:00+08:00', status: {label:'Pending',tone:'pending'} },
  { id: 'system', title: 'System item preserved', description: 'System controls are read-only.', timestamp: '09:39', dateTime: '2026-10-30T09:39:00+08:00', disabled: true, status:{label:'Read-only'} },
];
export default function Study() {
  const [items,setItems] = useState(initial);
  const [selected,setSelected] = useState<string>();
  const nextId = useRef(1);
  const [hidden,setHidden] = useState(false);
  const [instance,setInstance] = useState(0);
  const respond = (success:boolean) => setItems(current => current.map(item => item.id === 'sync' ? {...item, description: success ? 'Preferences saved by the Study fixture.' : 'Save failed. Existing preferences are unchanged.',status:success?{label:'Saved',tone:'success'}:{label:'Failed',tone:'error'}} : item));
  return <section className="mf-events-study"><header><span>MENUFOLD / STUDY FIXTURE</span><h2>Activity, in your order.</h2><p>Three initial records are immediately visible. New stable IDs enter once.</p></header>
    <div className="mf-events-study__stage" data-capture-root><div className="mf-events-study__heading"><span>Recent activity</span><span>{items.length} records</span></div>
      <EventList key={instance} items={hidden ? items.filter(item => item.id !== 'scan') : items} selectedId={selected} onItemAction={setSelected}/>
      <output aria-label="Selected event">{selected ? `Selected: ${selected}` : 'Select a record to inspect it.'}</output>
    </div>
    <div className="mf-events-study__controls"><button type="button" onClick={() => {const id = nextId.current++; setItems(current => [{id:`event-${id}`,title:`Menu preference ${id}`,description:'Added by an explicit Study action.',timestamp:'09:42',dateTime:'2026-10-30T09:42:00+08:00',status:{label:'Recorded',tone:'success'}},...current]);}}>Add event</button><button type="button" onClick={() => respond(true)}>Server success</button><button type="button" onClick={() => respond(false)}>Server failure</button><button type="button" onClick={() => setItems(current => [...current].reverse())}>Reverse order</button><button type="button" onClick={() => setHidden(value => !value)}>{hidden?'Restore known ID':'Hide known ID'}</button><button type="button" onClick={() => setItems([])}>Clear records</button><button type="button" onClick={() => {setItems(initial);setSelected(undefined);setHidden(false);nextId.current=1;setInstance(value => value+1);}}>Reset fixture</button></div>
    <p className="mf-events-study__note">Server controls are simulated Study responses. Timestamps and ordering remain exactly as supplied.</p>
  </section>;
}
