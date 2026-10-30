'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
import './bento-grid.css';

export type BentoGridItem = {
  id: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  /** Caller-provided visual or module content; never synthesized data. */
  header?: ReactNode;
  content?: ReactNode;
  columnSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  action?: { label: string; onAction: () => void; disabled?: boolean };
};
export type BentoGridProps = {
  items: readonly BentoGridItem[];
  label: string;
  columns?: 2 | 3;
  selectedId?: string | null;
  className?: string;
};

/** Explicit content-driven modules inspired by Aceternity's Bento Grid. */
export function BentoGrid({ items, label, columns = 3, selectedId = null, className = '' }: BentoGridProps) {
  const uid = useId();
  return <section className={`mf-bento ${className}`} aria-label={label} data-columns={columns}>
    {items.map(item => <article key={item.id} className="mf-bento__item"
      aria-labelledby={`${uid}-${item.id}`} data-selected={selectedId === item.id || undefined}
      data-column-span={Math.min(item.columnSpan ?? 1, columns)}
      style={{ '--mf-bento-columns': Math.min(item.columnSpan ?? 1, columns), '--mf-bento-rows': item.rowSpan ?? 1 } as CSSProperties}>
      {item.header && <div className="mf-bento__header">{item.header}</div>}
      <div className="mf-bento__body">
        {item.icon && <span className="mf-bento__icon" aria-hidden="true">{item.icon}</span>}
        <h3 id={`${uid}-${item.id}`}>{item.title}</h3>
        {item.description && <div className="mf-bento__description">{item.description}</div>}
        {item.content && <div className="mf-bento__content">{item.content}</div>}
        {item.action && <button className="mf-bento__action" type="button" disabled={item.action.disabled}
          onClick={item.action.onAction}>{item.action.label}<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 10h11m-4-4 4 4-4 4"/></svg></button>}
      </div>
    </article>)}
  </section>;
}
