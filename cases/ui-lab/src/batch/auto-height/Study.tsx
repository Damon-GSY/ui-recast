import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AutoHeight } from '../../components/auto-height';
import './study.css';

export default function Study() {
  const [expanded, setExpanded] = useState(false);
  const [detailsMounted, setDetailsMounted] = useState(false);
  const reduced = useReducedMotion();
  const [notes, setNotes] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const [tip, setTip] = useState(false);
  useEffect(() => {
    if (expanded) { setDetailsMounted(true); return; }
    if (reduced) { setDetailsMounted(false); return; }
    const timeout = window.setTimeout(() => setDetailsMounted(false), 200);
    return () => window.clearTimeout(timeout);
  }, [expanded, reduced]);
  return <div className="mf-height-study">
    <div className="mf-height-study__stage" data-capture-root>
      <header><span className="mf-height-study__eyebrow">MENUFOLD / CONTENT</span><h2>A little room to grow.</h2><p>Details find their space. Everything below moves with them.</p></header>
      <div className="mf-height-study__example" style={{ maxWidth: narrow ? 290 : 432 }}>
        <AutoHeight className="mf-height-study__card" role="region" aria-label="Adaptive content">
          <div className="mf-height-study__body">
            <div className="mf-height-study__title"><span className="mf-height-study__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9h8M8 13h5M8 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span><strong>Your menu, considered.</strong></div>
            <p>Keep the things you reach for close by. Give the rest a quiet place to live.</p>
            {detailsMounted && <motion.div className="mf-height-study__details" inert={!expanded} aria-hidden={!expanded}
              initial={reduced ? false : { opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: expanded ? 1 : 0, filter: expanded ? 'blur(0px)' : 'blur(2px)' }}
              transition={{ duration: reduced ? 0 : expanded ? .3 : .2, ease: [.215, .61, .355, 1] }}>
              <p>MenuFold brings small preferences together, so your menu bar can stay focused on what matters.</p><p>Content changes, images load, and words wrap. The container follows their natural height.</p><label>Personal note<textarea aria-label="Personal note" defaultValue="Try resizing this field vertically." rows={2}/></label></motion.div>}
            {Array.from({ length: notes }, (_, index) => <div className="mf-height-study__note" key={index}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span> A caller-owned detail with room to breathe.</div>)}
            <div className="mf-height-study__help"><button type="button" aria-expanded={tip} onClick={() => setTip(value => !value)}>About this preview</button>{tip && <span role="note" className="mf-height-study__tooltip">This floating note stays visible after the height animation settles.</span>}</div>
          </div>
        </AutoHeight>
        <div className="mf-height-study__actions"><button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show less' : 'Show more'}<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : undefined }}><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button><span className="mf-height-study__neighbor">A continuous neighbor</span></div>
      </div>
      <div className="mf-height-study__fixtures"><span>Study fixture · local state only</span><div><button type="button" onClick={() => setNotes(count => count + 1)}>Add detail</button><button type="button" disabled={!notes} onClick={() => setNotes(count => Math.max(0, count - 1))}>Remove detail</button><button type="button" aria-pressed={narrow} onClick={() => setNarrow(value => !value)}>Narrow content</button></div></div>
    </div>
  </div>;
}
