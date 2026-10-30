'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { AutoHeight } from './auto-height';
import './detail-accordion.css';

export interface DetailAccordionItem {
  id: string;
  title: string;
  summary?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  /** Critical errors and permission messages belong here, outside the collapsing panel. */
  notice?: ReactNode;
  disabled?: boolean;
}

export interface DetailAccordionProps {
  items: readonly DetailAccordionItem[];
  openItems: readonly string[];
  onOpenChange: (openItems: string[]) => void;
  label: string;
  className?: string;
  headingLevel?: 2 | 3 | 4;
}

/** Caller-controlled, independently expandable sections. Children remain mounted. */
export function DetailAccordion({ items, openItems, onOpenChange, label, className = '', headingLevel = 3 }: DetailAccordionProps) {
  const uid = useId();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  function navigate(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const enabled = items.filter(item => !item.disabled);
    const index = enabled.findIndex(item => item.id === id);
    let next: number;
    switch (event.key) {
      case 'ArrowDown': next = (index + 1) % enabled.length; break;
      case 'ArrowUp': next = (index + enabled.length - 1) % enabled.length; break;
      case 'Home': next = 0; break;
      case 'End': next = enabled.length - 1; break;
      default: return;
    }
    event.preventDefault();
    buttons.current.get(enabled[next].id)?.focus();
  }
  return <section className={`mf-detail-accordion ${className}`} aria-label={label}>
    {items.map(item => {
      const open = openItems.includes(item.id);
      const triggerId = `${uid}-${item.id}-trigger`;
      const panelId = `${uid}-${item.id}-panel`;
      const summaryId = `${uid}-${item.id}-summary`;
      const noticeId = `${uid}-${item.id}-notice`;
      const titleId = `${uid}-${item.id}-title`;
      return <div key={item.id} className="mf-detail-accordion__item" data-open={open}>
        <Heading className="mf-detail-accordion__heading">
          <button type="button" id={triggerId} className="mf-detail-accordion__trigger"
            ref={element => { if (element) buttons.current.set(item.id, element); else buttons.current.delete(item.id); }}
            aria-expanded={open} aria-controls={panelId} aria-labelledby={titleId} disabled={item.disabled}
            aria-describedby={[item.summary ? summaryId : '', item.notice ? noticeId : ''].filter(Boolean).join(' ') || undefined}
            onKeyDown={event => navigate(event, item.id)}
            onClick={() => onOpenChange(open ? openItems.filter(id => id !== item.id) : [...openItems, item.id])}>
            {item.icon && <span className="mf-detail-accordion__icon" aria-hidden="true">{item.icon}</span>}
            <span className="mf-detail-accordion__labels"><span id={titleId}>{item.title}</span>
              {item.summary && <span id={summaryId} className="mf-detail-accordion__summary">{item.summary}</span>}
            </span>
            <svg className="mf-detail-accordion__chevron" aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </Heading>
        <AutoHeight className="mf-detail-accordion__reveal" collapsed={!open} id={panelId} role="region" aria-labelledby={triggerId} aria-hidden={!open} inert={!open}>
          <div className="mf-detail-accordion__panel">{item.children}</div>
        </AutoHeight>
        {item.notice && <div id={noticeId} className="mf-detail-accordion__notice">{item.notice}</div>}
      </div>;
    })}
  </section>;
}
