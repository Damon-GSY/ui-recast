'use client';

// Adapted from affectUI Tool Call Card Clean (MIT); see PROVENANCE.md.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
export type ToolCopyHandler = (text: string, section: string) => void | Promise<void>;

const OPEN_MAX = 640;

export function CodeSection({ label, value, cap, onCopy }: { label: string; value: unknown; cap: number; onCopy?: ToolCopyHandler }) {
  const { text, json } = toText(value);
  const pre = useRef<HTMLPreElement>(null);
  const [full, setFull] = useState(false);
  const [height, setHeight] = useState(0);

  // Natural height of the block – decides whether it needs the cap and how far "Show all" opens
  useLayoutEffect(() => {
    const el = pre.current;
    const inner = el?.firstElementChild;
    if (!el || !inner) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [text]);

  const capped = height > cap + 24;

  return (
    <div className="ui-tcc__section">
      <div className="ui-tcc__section-head">
        <span className="ui-tcc__label">{label}</span>
        <CopyButton text={text} label={label.toLowerCase()} onCopy={onCopy} />
      </div>
      <pre
        ref={pre}
        className="ui-tcc__code"
        data-capped={(capped && !full) || undefined}
        data-scroll={(capped && full && height > OPEN_MAX) || undefined}
        // Open, a very long block stops at a few screens and scrolls inside – no 200,000px card
        style={capped ? { maxHeight: full ? Math.min(height, OPEN_MAX) : cap } : undefined}
      >
        <code>{text === "" ? <span className="ui-tcc__empty">Empty string</span> : json ? highlight(text) : text}</code>
      </pre>
      {capped && (
        <button type="button" className="ui-tcc__more" aria-expanded={full} onClick={() => setFull(!full)}>
          {full ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
}

function CopyButton({ text, label, onCopy }: { text: string; label: string; onCopy?: ToolCopyHandler }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setCopied(false); setFailed(false); }, [text]);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <>
    {failed && <span role="status" className="ui-tcc__copy-feedback">Copy failed</span>}
    <button
      type="button"
      className="ui-tcc__copy"
      data-copied={copied || undefined}
      aria-label={copied ? "Copied" : `Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      onClick={async () => {
        setFailed(false);
        try {
          if (onCopy) await onCopy(text, label);
          else await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch { setFailed(true); }
      }}
    >
      <svg className="ui-tcc__copy-icon" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="5.5" y="5.5" width="8.5" height="8.5" rx="2" />
        <path d="M10.5 3.75v-.25A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h.25" />
      </svg>
      <svg className="ui-tcc__copy-done" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength={1} />
      </svg>
    </button>
    </>
  );
}

export function Spinner() {
  return (
    <svg className="ui-tcc__spinner" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2a6 6 0 0 1 6 6" />
    </svg>
  );
}

export function ErrorIcon() {
  return (
    <svg className="ui-tcc__err" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" />
      <path d="M8 4.9v3.5M8 10.9v.1" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg className="ui-tcc__chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3.5 5.25 6 7.75l2.5-2.5" />
    </svg>
  );
}

export function WrenchIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M10.2 2.4a3.5 3.5 0 0 0-4.3 4.6L2.6 10.3a1.4 1.4 0 0 0 2 2L7.9 9a3.5 3.5 0 0 0 4.6-4.3l-2 2-1.6-.4-.4-1.6 1.7-2.3Z" />
    </svg>
  );
}

function toText(value: unknown): { text: string; json: boolean } {
  if (typeof value === "string") {
    const t = value.trim();
    if (t.startsWith("{") || t.startsWith("[")) {
      try {
        return { text: JSON.stringify(JSON.parse(t), null, 2), json: true };
      } catch {
        /* not JSON – shown as plain text */
      }
    }
    return { text: value, json: false };
  }
  try {
    const s = JSON.stringify(value, null, 2);
    return s === undefined ? { text: String(value), json: false } : { text: s, json: true };
  } catch {
    return { text: String(value), json: false };
  }
}

// Strings (keys when followed by a colon), literals and numbers – everything else stays punctuation
const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

function highlight(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(TOKEN.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(
        <span key={m.index} className="ui-tcc__t-key">
          {m[1]}
        </span>,
        m[2],
      );
    } else {
      const kind = m[1] ? "str" : /^[tfn]/.test(m[0]) ? "lit" : "num";
      out.push(
        <span key={m.index} className={`ui-tcc__t-${kind}`}>
          {m[0]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

