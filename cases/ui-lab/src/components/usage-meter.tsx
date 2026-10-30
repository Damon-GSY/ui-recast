'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import './usage-meter.css';

export type UsageMeterState = 'ok' | 'warn' | 'limit';
export type UsageCategory = { label: string; value: number; color?: string };
export type UsageLimit = { label: string; used: number; total?: number | null; unit?: string; decimals?: number };
export type UsageDay = { label: string; value: number | null };
export type UsagePeriod = { id: string; label: string };

export interface UsageMeterProps {
  total: number;
  used: UsageCategory[];
  limits?: UsageLimit[];
  periods?: UsagePeriod[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (id: string) => void;
  resetAt?: Date | string | number;
  daily?: UsageDay[];
  onUpgrade?: (state: UsageMeterState) => void;
  title?: string;
  plan?: string;
  unit?: string;
  warnAt?: number;
  upgradeLabel?: string;
  topUpLabel?: string;
  className?: string;
}

const palette = ['#2f6bff', '#74a0ff', '#b4cbff', '#a8a8ae', '#c8c8cb'];
const number = (value: number, decimals?: number) => value.toLocaleString('en-US', {
  minimumFractionDigits: decimals ?? 0,
  maximumFractionDigits: decimals ?? 2,
});
const stateText: Record<UsageMeterState, string> = { ok: 'Within plan', warn: 'Running low', limit: 'Limit reached' };
const ease = [.22, 1, .36, 1] as const;
const numberSpring = { type: 'spring' as const, stiffness: 220, damping: 28, restDelta: .05, restSpeed: .05 };

function useAnimatedValue(value: number, reduceMotion: boolean, initialValue = value) {
  const current = useMotionValue(reduceMotion ? value : initialValue);
  useEffect(() => {
    if (reduceMotion) { current.jump(value); return; }
    // A replacement animation starts at the interrupted visual value, not the previous target.
    const animation = animate(current, value, numberSpring);
    return () => animation.stop();
  }, [value, current, reduceMotion]);
  return current;
}

function MotionNumber({ value, decimals }: { value: MotionValue<number>; decimals?: number }) {
  const formatted = useTransform(() => number(value.get(), decimals));
  return <motion.span>{formatted}</motion.span>;
}

function AnimatedNumber({ value, decimals, reduceMotion, fromZero = false }: { value: number; decimals?: number; reduceMotion: boolean; fromZero?: boolean }) {
  const current = useAnimatedValue(value, reduceMotion, fromZero ? 0 : value);
  const precision = decimals ?? (Number.isInteger(value) ? 0 : Math.min(2, String(value).split('.')[1]?.length ?? 0));
  return <MotionNumber value={current} decimals={precision} />;
}

function CategoryRow({ category, total, reduceMotion, enterFromZero, active, onSelect, onEnter, onLeave }: {
  category: UsageCategory & { color: string }; total: MotionValue<number>; reduceMotion: boolean;
  enterFromZero: boolean; active: boolean; onSelect: () => void; onEnter: () => void; onLeave: () => void;
}) {
  const present = useIsPresent();
  const value = useAnimatedValue(present ? category.value : 0, reduceMotion, enterFromZero ? 0 : category.value);
  const share = useTransform(() => total.get() > 0 ? value.get() / total.get() * 100 : 0);
  return <motion.li initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0, transition: { delay: reduceMotion ? 0 : .44, duration: reduceMotion ? 0 : .32, ease } }}
    transition={{ duration: reduceMotion ? 0 : .32, ease }}>
    <button type="button" className="usage-meter__legend-row" tabIndex={-1}
      data-active={active} onClick={onSelect} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <span className="usage-meter__swatch" style={{ backgroundColor: category.color }} aria-hidden="true" />
      <span className="usage-meter__category-label" title={category.label}>{category.label}</span>
      <span className="usage-meter__category-value"><MotionNumber value={value} decimals={Number.isInteger(category.value) ? 0 : undefined} /></span>
      <span className="usage-meter__category-share"><MotionNumber value={share} decimals={0} />%</span>
    </button>
  </motion.li>;
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
function getReducedMotion() { return window.matchMedia(reducedMotionQuery).matches; }
function getServerReducedMotion() { return false; }

function stateFor(used: number, total: number | null | undefined, warnAt: number): UsageMeterState {
  if (total == null || !Number.isFinite(total)) return 'ok';
  if (total <= 0) return used > 0 ? 'limit' : 'ok';
  return used >= total ? 'limit' : used / total >= warnAt ? 'warn' : 'ok';
}

function resetInfo(value: Date | string | number | undefined) {
  if (value === undefined) return null;
  // Date-only billing dates are calendar dates in the viewer's timezone.
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  const label = days > 1 ? `Resets in ${days} days` : days === 1 ? 'Resets in 1 day' : days === 0 ? 'Resets today' : 'Reset date passed';
  return { label, date: date.toISOString(), full: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
}

function nextIndex(event: KeyboardEvent, index: number, length: number) {
  if (!length) return null;
  if (event.key === 'ArrowRight') return index < 0 ? 0 : (index + 1) % length;
  if (event.key === 'ArrowLeft') return index < 0 ? length - 1 : (index - 1 + length) % length;
  if (event.key === 'Home') return 0;
  if (event.key === 'End') return length - 1;
  return null;
}

/** Data belongs to the caller; choosing a period only changes the selected id. */
export function UsageMeter({
  total, used, limits = [], periods = [], period, defaultPeriod, onPeriodChange,
  resetAt, daily = [], onUpgrade, title = 'Usage', plan, unit = 'credits', warnAt = .8,
  upgradeLabel = 'Upgrade', topUpLabel = 'Add credits', className,
}: UsageMeterProps) {
  const id = useId();
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [localPeriod, setLocalPeriod] = useState(defaultPeriod ?? periods[0]?.id);
  const selectedPeriod = period ?? localPeriod;
  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);
  const [dayLabel, setDayLabel] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const dailyRef = useRef<HTMLDivElement>(null);
  const periodRefs = useRef(new Map<string, HTMLButtonElement>());
  // First-seen labels retain their shade when callers reorder or omit categories.
  const colors = useRef(new Map<string, string>());
  const categories = used.map(category => {
    if (!colors.current.has(category.label)) colors.current.set(category.label, palette[colors.current.size % palette.length]);
    return { ...category, value: Math.max(0, category.value), color: category.color ?? colors.current.get(category.label)! };
  });
  const usedTotal = categories.reduce((sum, category) => sum + category.value, 0);
  const animatedTotal = useAnimatedValue(usedTotal, reduceMotion, 0);
  const finiteTotal = Number.isFinite(total);
  const capacity = Math.max(0, total);
  const boundedMeter = finiteTotal && capacity > 0;
  const creditState = stateFor(usedTotal, total, warnAt);
  const limitStates = limits.map(limit => stateFor(limit.used, limit.total, warnAt));
  const allStates = [creditState, ...limitStates];
  // Secondary warnings stay next to that limit; exhausted limits still require action.
  const state: UsageMeterState = allStates.includes('limit') ? 'limit' : creditState;
  const affected = [
    ...(creditState === state && state !== 'ok' ? [unit] : []),
    ...limits.filter((_, index) => limitStates[index] === state && state !== 'ok').map(limit => limit.label),
  ];
  const percentage = finiteTotal ? (capacity > 0 ? Math.round(usedTotal / capacity * 100) : usedTotal > 0 ? 100 : 0) : null;
  const animatedPercentage = useTransform(() => capacity > 0 ? animatedTotal.get() / capacity * 100 : animatedTotal.get() > 0 ? 100 : 0);
  const animatedRemaining = useTransform(() => Math.max(0, capacity - animatedTotal.get()));
  // Overages keep the full breakdown visible; the actual overage remains in the value text.
  const barScale = Math.max(finiteTotal ? capacity : usedTotal, usedTotal, 1);
  const valueText = `${number(usedTotal)} of ${finiteTotal ? number(capacity) : 'unlimited'} ${unit}`;
  const categoryIndex = categories.findIndex(category => category.label === categoryLabel);
  const activeCategory = categories[categoryIndex];
  const categoryPosition = activeCategory
    ? (categories.slice(0, categoryIndex).reduce((sum, category) => sum + category.value, 0) + activeCategory.value / 2) / barScale * 100
    : 0;
  const dayIndex = daily.findIndex(day => day.label === dayLabel);
  const activeDay = daily[dayIndex];
  const knownDays = daily.filter((day): day is UsageDay & { value: number } => day.value !== null);
  const average = knownDays.length ? knownDays.reduce((sum, day) => sum + day.value, 0) / knownDays.length : null;
  const maxDay = Math.max(1, ...knownDays.map(day => day.value));
  const reset = resetInfo(resetAt);
  const transition = { duration: reduceMotion ? 0 : .36, ease };
  const tabPeriod = periods.some(option => option.id === selectedPeriod) ? selectedPeriod : periods[0]?.id;
  const actionLabel = state === 'ok' ? upgradeLabel : topUpLabel;
  const footerText = state === 'ok' && finiteTotal ? `${number(Math.max(0, capacity - usedTotal))} ${unit} left` : stateText[state];

  function choosePeriod(next: string) {
    if (next === selectedPeriod) return;
    if (period === undefined) setLocalPeriod(next);
    setCategoryLabel(null);
    setDayLabel(null);
    onPeriodChange?.(next);
  }

  function pickCategory(label: string) {
    barRef.current?.focus({ preventScroll: true });
    setCategoryLabel(label);
  }

  function pickDay(label: string) {
    dailyRef.current?.focus({ preventScroll: true });
    setDayLabel(label);
  }

  return <section className={`usage-meter${className ? ` ${className}` : ''}`} aria-labelledby={`${id}-title`} data-state={state}>
    <div className="usage-meter__card">
      <div className="usage-meter__header">
        <div className="usage-meter__identity">
          <h3 id={`${id}-title`} className="usage-meter__title" title={title}>{title}</h3>
          {(plan || reset) && <div className="usage-meter__subtitle">
            {plan && <span className="usage-meter__plan" title={plan}>{plan}</span>}
            {plan && reset && <span aria-hidden="true">·</span>}
            {reset && <time dateTime={reset.date} title={reset.full}>{reset.label}</time>}
          </div>}
        </div>
        {periods.length > 0 && <div className="usage-meter__periods" role="radiogroup" aria-label="Usage period">
          {periods.map((option, index) => <button key={option.id} type="button" role="radio"
            ref={node => { if (node) periodRefs.current.set(option.id, node); else periodRefs.current.delete(option.id); }}
            className="usage-meter__period" aria-checked={selectedPeriod === option.id}
            tabIndex={tabPeriod === option.id ? 0 : -1} title={option.label}
            onClick={() => choosePeriod(option.id)} onKeyDown={event => {
              const next = nextIndex(event, index, periods.length);
              if (next === null) return;
              event.preventDefault();
              choosePeriod(periods[next].id);
              periodRefs.current.get(periods[next].id)?.focus();
            }}>
            {selectedPeriod === option.id && <motion.span className="usage-meter__period-pill" aria-hidden="true"
              layoutId={`${id}-period`} transition={{ duration: reduceMotion ? 0 : .32, ease }} />}
            <span className="usage-meter__period-label">{option.label}</span>
          </button>)}
        </div>}
      </div>

      <div className="usage-meter__summary">
        <div className="usage-meter__amount"><strong><MotionNumber value={animatedTotal} decimals={Number.isInteger(usedTotal) ? 0 : undefined} /></strong>
          <span>of {finiteTotal ? <AnimatedNumber value={capacity} reduceMotion={reduceMotion} /> : '∞'} {unit}</span>
        </div>
        <span className="usage-meter__percentage" data-state={creditState}>
          {creditState !== 'ok' && <i className="usage-meter__status-dot" aria-hidden="true" />}
          <span>{percentage === null ? 'Unlimited' : <><MotionNumber value={animatedPercentage} decimals={0} />%</>}</span>
          <span className="usage-meter__sr"> · {stateText[creditState]}</span>
        </span>
      </div>

      <div className="usage-meter__breakdown">
        <div className="usage-meter__readout" role="status" aria-live="polite" aria-atomic="true" data-open={!!activeCategory}
          style={{ left: `${categoryPosition}%`, transform: `translateX(-${categoryPosition}%)` }}>
          {activeCategory && <><span className="usage-meter__readout-name"><i className="usage-meter__swatch" style={{ background: activeCategory.color }} />{activeCategory.label}</span>
            <span className="usage-meter__readout-value">{number(activeCategory.value)} {unit}<span> · {number(usedTotal ? activeCategory.value / usedTotal * 100 : 0, 0)}%</span></span></>}
        </div>
        <div className="usage-meter__bar-target" role={boundedMeter ? 'meter' : 'group'} ref={barRef} tabIndex={0}
          aria-label={boundedMeter ? `${title} ${unit}` : `${title}: ${valueText}`} aria-valuemin={boundedMeter ? 0 : undefined}
          aria-valuemax={boundedMeter ? capacity : undefined} aria-valuenow={boundedMeter ? Math.min(usedTotal, capacity) : undefined}
          aria-valuetext={boundedMeter ? valueText : undefined} aria-describedby={`${id}-category-help`}
          onFocus={() => { if (categoryLabel === null && categories.length) setCategoryLabel(categories[0].label); }}
          onBlur={() => setCategoryLabel(null)}
          onPointerLeave={() => { if (document.activeElement !== barRef.current) setCategoryLabel(null); }}
          onKeyDown={event => {
            if (event.key === 'Escape') { event.preventDefault(); setCategoryLabel(null); return; }
            const next = nextIndex(event, categoryIndex, categories.length);
            if (next !== null) { event.preventDefault(); setCategoryLabel(categories[next].label); }
          }}>
          <div className="usage-meter__track" data-highlighted={!!activeCategory} aria-hidden="true">
            <AnimatePresence>{categories.map(category => <motion.span key={category.label} className="usage-meter__segment"
              data-active={category.label === categoryLabel} style={{ backgroundColor: category.color }}
              initial={{ width: '0%' }} animate={{ width: `${category.value / barScale * 100}%` }} exit={{ width: '0%' }}
              transition={reduceMotion ? { duration: 0 } : numberSpring}
              onPointerEnter={() => setCategoryLabel(category.label)} onClick={() => pickCategory(category.label)} />)}</AnimatePresence>
          </div>
        </div>
        <span id={`${id}-category-help`} className="usage-meter__sr">Use left and right arrow keys to explore categories. Escape hides the readout.</span>
        <ul className="usage-meter__legend" data-highlighted={!!activeCategory}>
          <AnimatePresence initial={false}>{categories.map(category => <CategoryRow key={category.label}
            category={category} total={animatedTotal} reduceMotion={reduceMotion} enterFromZero={true} active={categoryLabel === category.label}
            onSelect={() => pickCategory(category.label)} onEnter={() => setCategoryLabel(category.label)}
            onLeave={() => { if (document.activeElement !== barRef.current) setCategoryLabel(null); }} />)}</AnimatePresence>
        </ul>
      </div>

      {daily.length > 0 && <div className="usage-meter__daily">
        <div className="usage-meter__daily-heading"><span>Per day</span>
          <span className="usage-meter__daily-read" role="status" aria-live="polite" aria-atomic="true">
            <AnimatePresence initial={false} mode="popLayout"><motion.span key={activeDay?.label ?? 'average'}
              initial={{ opacity: 0, y: 3, filter: 'blur(3px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .22, ease }}>
              {activeDay ? <>{activeDay.label} · <strong>{activeDay.value === null ? '—' : number(activeDay.value)}</strong>{activeDay.value === null ? '' : ` ${unit}`}</>
                : <>Avg <strong>{average === null ? '—' : number(Math.round(average))}</strong> / day</>}
            </motion.span></AnimatePresence>
          </span>
        </div>
        <motion.div initial={false} className="usage-meter__sparkline" data-highlighted={!!activeDay} data-short={daily.length <= 7} role="group" tabIndex={0} ref={dailyRef}
          aria-label="Daily usage" aria-describedby={`${id}-daily-help`}
          onFocus={() => { if (dayLabel === null) setDayLabel(daily[0].label); }} onBlur={() => setDayLabel(null)}
          onPointerLeave={() => { if (document.activeElement !== dailyRef.current) setDayLabel(null); }}
          onKeyDown={event => {
            if (event.key === 'Escape') { event.preventDefault(); setDayLabel(null); return; }
            const next = nextIndex(event, dayIndex, daily.length);
            if (next !== null) { event.preventDefault(); setDayLabel(daily[next].label); }
          }}>
          {/* A slot keeps its visual identity when equal-length periods replace its date/value. */}
          {daily.map((day, index) => <span key={`${daily.length}-${index}`} className="usage-meter__day-target" aria-hidden="true"
            data-active={dayLabel === day.label} data-future={day.value === null}
            onPointerEnter={() => setDayLabel(day.label)} onClick={() => pickDay(day.label)}>
            <motion.span className="usage-meter__day-bar" initial={{ height: '0%' }}
              animate={{ height: `${day.value === null ? 2 / 34 * 100 : Math.max(5, day.value / maxDay * 100)}%` }}
              transition={{ ...transition, delay: reduceMotion ? 0 : index * .012 }} />
          </span>)}
        </motion.div>
        <span id={`${id}-daily-help`} className="usage-meter__sr">Use left and right arrow keys to explore days. Escape hides the readout. Flat stubs are days not yet available.</span>
      </div>}

      {limits.length > 0 && <div className="usage-meter__limits">
        {limits.map((limit, index) => {
          const unlimited = limit.total == null || !Number.isFinite(limit.total);
          const limitTotal = Math.max(0, limit.total ?? 0);
          const limitValue = Math.max(0, limit.used);
          const boundedLimit = !unlimited && limitTotal > 0;
          const text = `${number(limitValue, limit.decimals)} of ${unlimited ? 'unlimited' : number(limitTotal, limit.decimals)}${limit.unit ? ` ${limit.unit}` : ''}`;
          return <div key={limit.label} className="usage-meter__limit" data-state={limitStates[index]} data-unlimited={unlimited}
            role={boundedLimit ? 'meter' : 'group'} aria-label={boundedLimit ? limit.label : `${limit.label}: ${text}. ${stateText[limitStates[index]]}`}
            aria-valuemin={boundedLimit ? 0 : undefined} aria-valuemax={boundedLimit ? limitTotal : undefined}
            aria-valuenow={boundedLimit ? Math.min(limitValue, limitTotal) : undefined} aria-valuetext={boundedLimit ? `${text}. ${stateText[limitStates[index]]}` : undefined}>
            <span className="usage-meter__limit-label" title={limit.label}><span>{limit.label}</span>
              {limitStates[index] !== 'ok' && <i className="usage-meter__status-dot" aria-hidden="true" />}
            </span>
            <span className="usage-meter__limit-value"><strong><AnimatedNumber fromZero value={limitValue} decimals={limit.decimals} reduceMotion={reduceMotion} /></strong> of {unlimited ? '∞' : <AnimatedNumber value={limitTotal} decimals={limit.decimals} reduceMotion={reduceMotion} />}{limit.unit ? ` ${limit.unit}` : ''}</span>
            <span className="usage-meter__limit-track" aria-hidden="true">
              {!unlimited && <motion.span initial={{ width: 0 }} animate={{ width: `${limitTotal > 0 ? Math.min(100, limitValue / limitTotal * 100) : limitValue > 0 ? 100 : 0}%` }} transition={transition} />}
            </span>
          </div>;
        })}
      </div>}
    </div>
    <div className="usage-meter__footer">
      <div className="usage-meter__status" role="status" aria-live="polite" aria-atomic="true">
        {state !== 'ok' && <i className="usage-meter__status-dot" aria-hidden="true" />}
        <AnimatePresence initial={false} mode="wait">
          <motion.span key={state} aria-hidden="true" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
            transition={{ duration: reduceMotion ? 0 : .13 }}>
            {state === 'ok' && finiteTotal ? <><MotionNumber value={animatedRemaining} decimals={Number.isInteger(usedTotal) ? 0 : undefined} /> {unit} left</> : stateText[state]}
          </motion.span>
        </AnimatePresence>
        <span className="usage-meter__sr">{footerText}{affected.length > 0 ? `: ${affected.join(', ')}` : ''}</span>
      </div>
      <motion.button layout="size" transition={{ duration: reduceMotion ? 0 : .32, ease }} className="usage-meter__upgrade"
        type="button" aria-label={actionLabel} disabled={!onUpgrade} onClick={() => onUpgrade?.(state)}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={actionLabel} aria-hidden="true" initial={{ opacity: 0, y: 3, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -3, filter: 'blur(3px)' }}
            transition={{ duration: reduceMotion ? 0 : .26 }}>{actionLabel}</motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  </section>;
}
