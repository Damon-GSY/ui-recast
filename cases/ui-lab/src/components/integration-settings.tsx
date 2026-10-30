'use client';

import {useEffect, useId, useRef, useState, type ReactNode} from 'react';
import './integration-settings.css';

export interface IntegrationValues {
  enabled: boolean;
  apiKey: string;
  siteUrl: string;
  timeZone: string;
}

export interface IntegrationReferenceProps {
  /** Explicit opt-in to the original API-key/site/time-zone fidelity fixture. */
  variant: 'reference';
  name: string;
  logo?: ReactNode;
  count?: number;
  meta?: string;
  value: IntegrationValues;
  dirty: boolean;
  onChange: (value: IntegrationValues) => void;
  onSave: (value: IntegrationValues) => void;
  onDiscard: () => void;
  timeZones: readonly string[];
  siteHint?: string;
  validateSite?: (siteUrl: string) => string | undefined;
  /** Caller owns key creation. There is no built-in random key generator. */
  onGenerateKey?: () => void;
  keyPending?: boolean;
  keyIsNew?: boolean;
  onCopyKey?: (key: string) => void | Promise<void>;
  className?: string;
}

export interface IntegrationFormProps {
  variant?: 'integration';
  name: string;
  logo?: ReactNode;
  count?: number;
  meta?: string;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  /** Parent renders and owns its actual Harness/plugin fields and validation. */
  children?: ReactNode;
  fields?: ReactNode;
  dirty: boolean;
  pending?: boolean;
  disabled?: boolean;
  validationError?: ReactNode;
  saveError?: ReactNode;
  onSave?: () => void;
  onDiscard?: () => void;
  className?: string;
}

export type IntegrationSettingsProps = IntegrationFormProps | IntegrationReferenceProps;

/** No schema, persistence, credential creation, or optimistic business state is built in. */
export function IntegrationSettings(props: IntegrationSettingsProps) {
  if (props.variant === 'reference') return <ReferenceIntegrationSettings {...props}/>;
  return <IntegrationForm {...props}/>;
}

function IntegrationForm({name, logo, count, meta, enabled, onEnabledChange, children, fields, dirty, pending = false, disabled = false, validationError, saveError, onSave, onDiscard, className = ''}: IntegrationFormProps) {
  const id = useId();
  const locked = pending || disabled;
  const canSave = dirty && !locked && !validationError && !!onSave;
  return <section className={`integration-settings ${className}`} data-variant="integration" aria-label={`${name} settings`} aria-busy={pending} data-capture-root>
    <header className="integration-settings__head">
      {logo && <span className="integration-settings__logo">{logo}</span>}
      <span className="integration-settings__who"><span className="integration-settings__name"><span title={name}>{name}</span>{count !== undefined && <span className="integration-settings__count">{count}</span>}</span>{meta && <span className="integration-settings__meta" title={meta}>{meta}</span>}</span>
      {enabled !== undefined && <button className="integration-settings__switch" type="button" role="switch" aria-label={`${name} enabled`} aria-checked={enabled} disabled={locked || !onEnabledChange} onClick={() => onEnabledChange?.(!enabled)}><span/></button>}
    </header>
    <form aria-label={`${name} configuration`} aria-describedby={validationError || saveError ? `${id}-error` : undefined} onSubmit={event => {event.preventDefault(); if (canSave) onSave?.();}}>
      <fieldset className="integration-settings__fields" disabled={locked}>{fields ?? children}</fieldset>
      {(validationError || saveError) && <p id={`${id}-error`} className="integration-settings__form-error" role="alert">{validationError || saveError}</p>}
      <div className="integration-settings__save" data-open={dirty || pending || !!saveError} inert={!dirty && !pending && !saveError}>
        <div className="integration-settings__save-inner"><span className="integration-settings__save-text" role="status">{pending ? 'Saving…' : 'Unsaved changes'}</span><div className="integration-settings__save-actions">
          <button className="integration-settings__btn" type="button" disabled={locked || !dirty || !onDiscard} onClick={onDiscard}>Discard</button>
          <button className="integration-settings__btn integration-settings__btn--primary" type="submit" disabled={!canSave}>{pending ? 'Saving…' : 'Save'}</button>
        </div></div>
      </div>
    </form>
  </section>;
}

// Geometry transcribed from the public preview's rendered SVGs; see study notes.
const paths = {
  check: 'm3.5 8.5 3 3 6-7',
  clock: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM8 4.5V8l2.5 1.5',
  search: 'M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM13.5 13.5 10.6 10.6',
  copy: 'M5.5 5.5V3.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M3.5 5.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z',
  eye: 'M2 8s2.2-4.5 6-4.5S14 8 14 8s-2.2 4.5-6 4.5S2 8 2 8ZM8 9.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
  hidden: 'M2 8s2.2-4.5 6-4.5S14 8 14 8s-2.2 4.5-6 4.5S2 8 2 8ZM2.5 2.5l11 11',
  key: 'M10.5 1.5a4 4 0 0 0-3.86 5.05L1.8 11.4a1 1 0 0 0-.3.7v1.9a.5.5 0 0 0 .5.5h1.9a.5.5 0 0 0 .5-.5V13h1v-1h1v-1l.95-.95A4 4 0 1 0 10.5 1.5Zm1 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
};
function Icon({name, pop = false}: {name: keyof typeof paths; pop?: boolean}) {
  return <svg className={`integration-settings__icon${pop ? ' integration-settings__icon--pop' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill={name === 'key' ? 'currentColor' : 'none'} stroke={name === 'key' ? undefined : 'currentColor'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function domainError(value: string) {
  if (!value || /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(value.trim())) return undefined;
  return "That doesn't look like a domain – try something like yourstore.com";
}

function ReferenceIntegrationSettings({name, logo, count, meta, value, dirty, onChange, onSave, onDiscard, timeZones, siteHint, validateSite = domainError, onGenerateKey, keyPending = false, keyIsNew = false, onCopyKey, className = ''}: IntegrationReferenceProps) {
  const id = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [revealed, setRevealed] = useState(keyIsNew);
  const [copied, setCopied] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const siteError = validateSite(value.siteUrl);
  const choices = timeZones.filter(zone => zone.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const change = (patch: Partial<IntegrationValues>) => onChange({...value, ...patch});

  useEffect(() => {if (!keyPending) {setRevealed(keyIsNew); setCopied(false);}}, [value.apiKey, keyIsNew, keyPending]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => {if (!zoneRef.current?.contains(event.target as Node)) setMenuOpen(false);};
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [menuOpen]);

  const closeMenu = () => {setMenuOpen(false); triggerRef.current?.focus();};
  async function copyKey() {
    try {
      if (onCopyKey) await onCopyKey(value.apiKey);
      else await navigator.clipboard.writeText(value.apiKey);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1400);
    } catch {setCopied(false);}
  }

  return <section className={`integration-settings ${className}`} aria-label={`${name} settings`} data-capture-root>
    <header className="integration-settings__head">
      <span className="integration-settings__logo">{logo}</span>
      <span className="integration-settings__who">
        <span className="integration-settings__name"><span title={name}>{name}</span>{count !== undefined && <span className="integration-settings__count">{count}</span>}</span>
        <span className="integration-settings__meta" title={value.enabled ? meta : 'Paused – no data is synced'}>{value.enabled ? meta : 'Paused – no data is synced'}</span>
      </span>
      <button className="integration-settings__switch" type="button" role="switch" aria-label={`${name} sync`} aria-checked={value.enabled} onClick={() => {setMenuOpen(false); change({enabled: !value.enabled});}}><span /></button>
    </header>
    <div className="integration-settings__fold" data-open={value.enabled} inert={!value.enabled}>
      <div className="integration-settings__fold-inner">
        <div className="integration-settings__section">
          <span className="integration-settings__label">API key</span>
          {!value.apiKey ? <button type="button" className="integration-settings__generate" disabled={keyPending || !onGenerateKey} onClick={onGenerateKey}>
            <span className={keyPending ? 'integration-settings__shimmer' : undefined} data-text={keyPending ? 'Generating…' : undefined}>{keyPending ? 'Generating…' : 'Generate a new API key'}</span><Icon name="key" />
          </button> : <div className="integration-settings__key" data-fresh={keyIsNew && revealed}>
            <code>{revealed ? value.apiKey : `${value.apiKey.slice(0, 8)}••••••••••••••${value.apiKey.slice(-4)}`}</code>
            <button type="button" className="integration-settings__mini" aria-label={revealed ? 'Hide key' : 'Show key'} onClick={() => setRevealed(!revealed)}><Icon name={revealed ? 'hidden' : 'eye'} /></button>
            <button type="button" className="integration-settings__mini" aria-label={copied ? 'Copied' : 'Copy key'} onClick={copyKey} data-copied={copied}><Icon name={copied ? 'check' : 'copy'} pop={copied} /></button>
            <button type="button" className="integration-settings__regen" aria-label="Regenerate" disabled={keyPending || !onGenerateKey} onClick={onGenerateKey}>{keyPending ? <span className="integration-settings__spinner" aria-label="Generating" /> : 'Regenerate'}</button>
          </div>}
          {value.apiKey && keyIsNew && revealed && <p key={copied ? 'copied' : 'fresh'} className="integration-settings__note" role="status">{copied ? 'Copied to clipboard.' : 'Copy it now – it is shown in full only once.'}</p>}
        </div>
        <div className="integration-settings__section">
          <label className="integration-settings__label" htmlFor={id}>Site address</label>
          <div className="integration-settings__field" data-invalid={Boolean(siteError)}>
            <span className="integration-settings__prefix">https://</span>
            <input id={id} value={value.siteUrl} onChange={event => change({siteUrl: event.target.value.replace(/^https?:\/\//i, '')})} placeholder="yourstore.com" inputMode="url" autoComplete="off" spellCheck={false} aria-invalid={Boolean(siteError)} aria-describedby={`${id}-hint`} />
            {!siteError && value.siteUrl && <span className="integration-settings__ok"><Icon name="check" /></span>}
          </div>
          {(siteError || siteHint) && <p className="integration-settings__hint" id={`${id}-hint`} data-error={Boolean(siteError)}>{siteError || siteHint}</p>}
        </div>
        <div className="integration-settings__section">
          <span className="integration-settings__label" id={`${id}-tz`}>Time zone</span>
          <div className="integration-settings__zone" ref={zoneRef} onKeyDown={event => {
            if (event.key === 'Escape' && menuOpen) {event.preventDefault(); closeMenu();}
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && menuOpen) {
              event.preventDefault();
              const options = [...(zoneRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
              const index = options.indexOf(document.activeElement as HTMLButtonElement);
              options[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
            }
          }}>
            <button ref={triggerRef} type="button" className="integration-settings__field integration-settings__zone-btn" aria-haspopup="listbox" aria-expanded={menuOpen} aria-labelledby={`${id}-tz`} aria-controls={`${id}-zones`} onClick={() => {setQuery(''); setMenuOpen(!menuOpen);}}>
              <span title={value.timeZone}>{value.timeZone}</span><Icon name="clock" />
            </button>
            {menuOpen && <div className="integration-settings__menu">
              <div className="integration-settings__menu-search"><Icon name="search" /><input autoFocus aria-label="Search time zones" placeholder="Search city or offset" value={query} onChange={event => setQuery(event.target.value)} /></div>
              <div className="integration-settings__menu-list" role="listbox" id={`${id}-zones`} aria-labelledby={`${id}-tz`}>
                {choices.map(zone => <button key={zone} type="button" role="option" aria-selected={zone === value.timeZone} className="integration-settings__option" onClick={() => {change({timeZone: zone}); closeMenu();}}>{zone}{zone === value.timeZone && <Icon name="check" pop />}</button>)}
                {!choices.length && <span className="integration-settings__empty">No time zone matches.</span>}
              </div>
            </div>}
          </div>
        </div>
        <div className="integration-settings__save" data-open={dirty} inert={!dirty}>
          <div className="integration-settings__save-inner">
            <span className="integration-settings__save-text">Unsaved changes</span>
            <div className="integration-settings__save-actions">
              <button className="integration-settings__btn" type="button" onClick={() => {setMenuOpen(false); onDiscard();}}>Discard</button>
              <button className="integration-settings__btn integration-settings__btn--primary" type="button" disabled={Boolean(siteError)} onClick={() => onSave(value)}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
