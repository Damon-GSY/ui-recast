import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {KeyboardEvent, ReactNode} from 'react';
import type {DraftDecisions, RunDraft} from './types';
import './diff.css';

export interface AgentRunDiffProps {
  draft: RunDraft;
  onChange?: (decisions: DraftDecisions, resolvedText: string) => void;
  /** Parent-owned decisions before the last review action; Undo restores this snapshot. */
  undoDecisions?: DraftDecisions;
}

type TextPart = {kind: 'same'; text: string} | {kind: 'change'; id: string; before: string; after: string};
type ChangePart = Extract<TextPart, {kind: 'change'}>;
const EMPTY_DECISIONS: DraftDecisions = {};

/** Word/punctuation LCS, coalescing whitespace-only gaps into one reviewable change. */
function diffText(original: string, suggested: string): TextPart[] {
  const tokenize = (text: string) => text.match(/[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu) ?? [];
  const before = tokenize(original);
  const after = tokenize(suggested);
  const lengths = Array.from({length: before.length + 1}, () => new Uint32Array(after.length + 1));
  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      lengths[i][j] = before[i] === after[j]
        ? lengths[i + 1][j + 1] + 1
        : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const operations: {kind: 'same' | 'before' | 'after'; text: string}[] = [];
  const append = (kind: 'same' | 'before' | 'after', text: string) => {
    const last = operations.at(-1);
    if (last?.kind === kind) last.text += text;
    else operations.push({kind, text});
  };
  let i = 0;
  let j = 0;
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      append('same', before[i++]);
      j++;
    } else if (i < before.length && (j === after.length || lengths[i + 1][j] >= lengths[i][j + 1])) {
      append('before', before[i++]);
    } else append('after', after[j++]);
  }
  const parts: TextPart[] = [];
  let count = 0;
  for (let index = 0; index < operations.length; index++) {
    const operation = operations[index];
    if (operation.kind === 'same') {
      const last = parts.at(-1);
      // A space between edits belongs to both versions, not a separate suggestion.
      if (last?.kind === 'change' && /^\s+$/.test(operation.text) && operations[index + 1]?.kind !== 'same' && index + 1 < operations.length) {
        last.before += operation.text;
        last.after += operation.text;
      } else parts.push({kind: 'same', text: operation.text});
    } else {
      let last = parts.at(-1);
      if (last?.kind !== 'change') {
        last = {kind: 'change', id: `suggestion-${++count}`, before: '', after: ''};
        parts.push(last);
      }
      last[operation.kind] += operation.text;
    }
  }
  return parts;
}

function resolvedText(parts: TextPart[], decisions: DraftDecisions): string {
  return parts.map(part => part.kind === 'same' ? part.text : decisions[part.id] === 'accepted' ? part.after : part.before).join('');
}

function Icon({children, className}: {children: ReactNode; className?: string}) {
  return <svg className={className} viewBox="0 0 16 16" aria-hidden="true">{children}</svg>;
}
const check = <path d="M3.75 8.4 6.6 11.1 12.25 5" pathLength="1" />;

export function AgentRunDiff({draft, onChange, undoDecisions}: AgentRunDiffProps) {
  const parts = useMemo(() => diffText(draft.original, draft.suggested), [draft.original, draft.suggested]);
  const changes = useMemo(() => parts.filter((part): part is ChangePart => part.kind === 'change'), [parts]);
  const decisions = draft.decisions ?? EMPTY_DECISIONS;
  const pending = changes.filter(part => !decisions[part.id]);
  const done = pending.length === 0;
  const [active, setActive] = useState<string | null>(null);
  const [position, setPosition] = useState({left: 0, top: 0});
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const changeRefs = useRef(new Map<string, HTMLSpanElement>());
  const requestedFocus = useRef<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const selected = pending.find(part => part.id === active);

  useEffect(() => {
    setActive(null);
    return () => window.clearTimeout(hoverTimer.current);
  }, [draft.original, draft.suggested]);

  const keepPopover = () => window.clearTimeout(hoverTimer.current);
  const leaveSuggestion = () => {
    keepPopover();
    // Keep the short pointer crossing to the floating actions usable.
    hoverTimer.current = window.setTimeout(() => {
      setActive(changes.find(part => changeRefs.current.get(part.id) === document.activeElement)?.id ?? null);
    }, 180);
  };

  useLayoutEffect(() => {
    const popup = popRef.current;
    if (!popup) return;
    // Reviewing reflows the sentence: move to the next anchor without chasing it.
    popup.dataset.settling = 'true';
    const timer = window.setTimeout(() => { delete popup.dataset.settling; }, 460);
    return () => { window.clearTimeout(timer); delete popup.dataset.settling; };
  }, [decisions]);

  useLayoutEffect(() => {
    const target = requestedFocus.current;
    if (!target) return;
    requestedFocus.current = null;
    if (target === 'undo') undoRef.current?.focus({preventScroll: true});
    else changeRefs.current.get(target)?.focus({preventScroll: true});
  }, [decisions]);

  useLayoutEffect(() => {
    if (!selected) return;
    const card = cardRef.current;
    const popup = popRef.current;
    const target = changeRefs.current.get(selected.id);
    if (!card || !popup || !target) return;
    const place = () => {
      const bounds = card.getBoundingClientRect();
      const line = target.getClientRects()[0];
      if (!line) return;
      const left = Math.max(8, Math.min(bounds.width - popup.offsetWidth - 8, line.left - bounds.left + line.width / 2 - popup.offsetWidth / 2));
      const top = line.top - bounds.top - popup.offsetHeight - 6;
      setPosition(previous => previous.left === left && previous.top === top ? previous : {left, top});
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(card);
    card.addEventListener('transitionend', place);
    window.addEventListener('resize', place);
    return () => { observer.disconnect(); card.removeEventListener('transitionend', place); window.removeEventListener('resize', place); };
  }, [selected?.id, decisions]);

  useEffect(() => {
    if (!selected) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setActive(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [selected?.id]);

  const navigate = (direction: number, focus: boolean) => {
    if (!pending.length) return;
    const current = pending.findIndex(part => part.id === active);
    const index = current < 0 ? direction > 0 ? 0 : pending.length - 1 : (current + direction + pending.length) % pending.length;
    const next = pending[index].id;
    setActive(next);
    if (focus) changeRefs.current.get(next)?.focus({preventScroll: true});
  };

  const review = (decision: 'accepted' | 'rejected', all = false, target = selected) => {
    if (!onChange || (!all && !target)) return;
    const targets = all ? pending : [target!];
    const next = {...decisions};
    targets.forEach(part => { next[part.id] = decision; });
    const remaining = changes.filter(part => !next[part.id]);
    const currentIndex = changes.findIndex(part => part.id === targets.at(-1)?.id);
    const nextActive = remaining.find(part => changes.indexOf(part) > currentIndex) ?? remaining[0];
    setActive(all ? null : nextActive?.id ?? null);
    requestedFocus.current = all ? null : nextActive?.id ?? 'undo';
    onChange(next, resolvedText(parts, next));
  };

  const undo = () => {
    if (!onChange || !undoDecisions) return;
    const firstRestored = changes.find(part => decisions[part.id] && !undoDecisions[part.id]);
    setActive(firstRestored?.id ?? null);
    requestedFocus.current = firstRestored?.id ?? null;
    onChange({...undoDecisions}, resolvedText(parts, undoDecisions));
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    const keyboardTarget = pending.find(part => changeRefs.current.get(part.id) === document.activeElement) ?? selected;
    if (key === 'escape') {
      setActive(null);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      event.stopPropagation();
    } else if (keyboardTarget && (key === 'y' || key === 'n')) {
      event.preventDefault();
      event.stopPropagation();
      review(key === 'y' ? 'accepted' : 'rejected', false, keyboardTarget);
    }
  };

  return <div className="ar-diff" ref={rootRef} onKeyDown={handleKey} onPointerLeave={leaveSuggestion} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null);
  }}>
    {draft.label && <div className="ar-diff__label">
      <Icon><path d="M8 1.75c.3 2.9 1.35 3.95 4.25 4.25-2.9.3-3.95 1.35-4.25 4.25C7.7 7.35 6.65 6.3 3.75 6 6.65 5.7 7.7 4.65 8 1.75Z" /><path d="M12.5 10.25c.15 1.25.6 1.7 1.75 1.75-1.15.15-1.6.6-1.75 1.75-.15-1.15-.6-1.6-1.75-1.75 1.15-.05 1.6-.5 1.75-1.75Z" /></Icon>
      <span title={draft.label}>{draft.label}</span>
    </div>}
    <div className="ar-diff__card" ref={cardRef}>
      <div className="ar-diff__head"><div className="ar-diff__bar">
        <div className="ar-diff__layer" data-show={!done} inert={done} aria-hidden={done}>
          <span className="ar-diff__count"><span className="ar-diff__num">{pending.length}</span><span className="ar-diff__sr"> suggestions</span></span>
          <span className="ar-diff__actions"><span className="ar-diff__nav">
            <button type="button" className="ar-diff__icon" aria-label="Previous suggestion" disabled={done} onMouseDown={event => event.preventDefault()} onClick={event => navigate(-1, event.detail === 0)}><Icon><path d="M10 12.5 5.5 8 10 3.5" /></Icon></button>
            <button type="button" className="ar-diff__icon" aria-label="Next suggestion" disabled={done} onMouseDown={event => event.preventDefault()} onClick={event => navigate(1, event.detail === 0)}><Icon><path d="M6 3.5 10.5 8 6 12.5" /></Icon></button>
          </span><button type="button" className="ar-diff__btn" disabled={done || !onChange} onClick={() => review('rejected', true)}>Reject all</button><button type="button" className="ar-diff__btn ar-diff__btn--primary" disabled={done || !onChange} onClick={() => review('accepted', true)}>Accept all</button></span>
        </div>
        <div className="ar-diff__layer" data-show={done} inert={!done} aria-hidden={!done}>
          <span className="ar-diff__count"><Icon className="ar-diff__ok">{check}</Icon>All changes reviewed</span>
          <button ref={undoRef} type="button" className="ar-diff__btn" disabled={!done || !onChange || !undoDecisions} onClick={undo}><Icon><path d="M5.5 4 2.75 6.75 5.5 9.5" /><path d="M3 6.75h6.5a3.75 3.75 0 0 1 0 7.5H7.5" /></Icon>Undo</button>
        </div>
      </div></div>
      <div className="ar-diff__body"><p className="ar-diff__text">{parts.map((part, index) => {
        if (part.kind === 'same') return <span key={`text-${index}`}>{part.text}</span>;
        const decision = decisions[part.id];
        const description = part.before && part.after ? `replace “${part.before.trim()}” with “${part.after.trim()}”` : part.before ? `remove “${part.before.trim()}”` : `add “${part.after.trim()}”`;
        return <span key={part.id} ref={node => { if (node) changeRefs.current.set(part.id, node); else changeRefs.current.delete(part.id); }} className="ar-diff__change" data-state={decision ?? 'pending'} data-active={selected?.id === part.id || undefined}
          tabIndex={decision ? -1 : 0} role={decision ? undefined : 'button'} aria-label={decision ? undefined : `Suggestion ${changes.indexOf(part) + 1} of ${changes.length}: ${description}. Press Y to accept, N to reject`}
          onFocus={() => { if (!decision) { keepPopover(); setActive(part.id); } }} onClick={() => { if (!decision) setActive(part.id); }}
          onPointerEnter={() => { if (!decision) { keepPopover(); setActive(part.id); } }} onPointerLeave={leaveSuggestion}
          onKeyDown={event => { if (!decision && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setActive(part.id); } }}>
          {part.before && <del className="ar-diff__del" aria-hidden={decision === 'accepted'}>{part.before}</del>}{part.after && <ins className="ar-diff__ins" aria-hidden={decision === 'rejected'}>{part.after}</ins>}
        </span>;
      })}</p></div>
      <div ref={popRef} className="ar-diff__pop" role="group" aria-label="Review suggestion" data-open={!!selected} aria-hidden={!selected} inert={!selected} style={position} onPointerEnter={keepPopover} onPointerLeave={leaveSuggestion}>
        <button type="button" className="ar-diff__pbtn" aria-label="Accept suggestion" tabIndex={-1} disabled={!onChange} onMouseDown={event => event.preventDefault()} onClick={() => review('accepted')}><Icon>{check}</Icon>Accept<kbd>Y</kbd></button>
        <span className="ar-diff__sep" aria-hidden="true" />
        <button type="button" className="ar-diff__pbtn" aria-label="Reject suggestion" tabIndex={-1} disabled={!onChange} onMouseDown={event => event.preventDefault()} onClick={() => review('rejected')}><Icon><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" /></Icon>Reject<kbd>N</kbd></button>
      </div>
    </div>
    <span className="ar-diff__sr" role="status" aria-live="polite">{done ? 'All changes reviewed.' : `${pending.length} suggestions left.`}</span>
  </div>;
}
