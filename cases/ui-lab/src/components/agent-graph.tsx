'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, animate, motion, motionValue, useIsPresent, useReducedMotion, useTransform, type MotionStyle, type MotionValue } from 'motion/react';
import './agent-graph.css';

export interface GraphNode {
  id: string;
  name: string;
  kind: 'agent' | 'tool' | 'user';
  short?: string;
  icon?: ReactNode;
  detail?: string;
  doing?: string;
  status?: 'idle' | 'working' | 'waiting' | 'error' | 'done';
  cost?: number;
  lead?: boolean;
  /** Center in the reference 756 × 486 coordinate system. */
  position?: [number, number];
}

export interface GraphCall {
  id: string;
  from: string;
  to: string;
  /** Milliseconds in the same business clock as `now`. */
  at: number;
  status?: 'pending' | 'ok' | 'error';
  label?: string;
  ms?: number;
}

export interface AgentGraphProps {
  nodes: GraphNode[];
  calls?: GraphCall[];
  edges?: [string, string][];
  now: number;
  height?: number;
  onSelect?: (node: GraphNode | null) => void;
  title?: string;
  className?: string;
}

type Point = { x: number; y: number };
type Placement = Point & { above: boolean; delay: number };
type MovingPoint = { x: MotionValue<number>; y: MotionValue<number>; target: Point; fresh: boolean };
type Pulse = { key: string; call: GraphCall; returning: boolean; color: string };
type Ripple = { key: string; nodeId: string; color: string };
const NO_CALLS: GraphCall[] = [];
const NO_EDGES: [string, string][] = [];
const POP_EASE = [0.32, 0.72, 0.24, 1] as const;
const STATUS_LABEL = { idle: 'Idle', working: 'Working', waiting: 'Needs you', error: 'Failed', done: 'Done' };
const COLORS = { pending: '#4389ff', ok: '#30a46c', error: '#e5484d' };
const diameter = (node: GraphNode) => node.kind === 'agent' ? node.lead ? 56 : 46 : 34;
const money = (value: number) => `$${value.toFixed(2)}`;

/** Geometry follows the supplied DOM measurements; small screens use readable rows. */
function placeNodes(nodes: GraphNode[], width: number, requestedHeight: number) {
  const positions = new Map<string, Placement>();
  const lead = nodes.find(node => node.kind === 'agent' && node.lead)
    ?? nodes.find(node => node.kind === 'agent');
  const agents = nodes.filter(node => node.kind === 'agent' && node !== lead);
  const outer = nodes.filter(node => node.kind !== 'agent');
  const order = [ ...(lead ? [lead] : []), ...agents, ...outer ];
  // Enter clockwise from the top; explicit caller positions retain their geometry.
  const outerEntrance = [...outer].sort((a, b) => {
    const angle = (node: GraphNode) => node.position
      ? (Math.atan2(node.position[1] - 243, node.position[0] - 378) + Math.PI * 2.5) % (Math.PI * 2)
      : outer.indexOf(node) * Math.PI * 2 / Math.max(1, outer.length);
    return angle(a) - angle(b);
  });
  const delays = new Map(order.map((node, index) => [node.id,
    node === lead ? 0 : node.kind === 'agent' ? 0.4 + (index - 1) * 0.09 : 0.88 + outerEntrance.indexOf(node) * 0.07]));
  if (width < 600) {
    const columns = Math.max(1, Math.min(3, Math.floor(width / 116)));
    let y = 52;
    const rows = (group: GraphNode[], rowHeight: number, cols = columns) => {
      for (let start = 0; start < group.length; start += cols) {
        const row = group.slice(start, start + cols);
        row.forEach((node, index) => positions.set(node.id, {
          x: width * (index + 1) / (row.length + 1), y,
          above: false, delay: delays.get(node.id) ?? 0,
        }));
        y += rowHeight;
      }
    };
    rows(outer.filter(node => node.kind === 'user'), 78);
    rows(lead ? [lead] : [], 106, 1);
    rows(agents, 106);
    rows(outer.filter(node => node.kind === 'tool'), 78);
    return { positions, height: Math.max(requestedHeight, y - 12) };
  }
  order.forEach(node => {
    let x = 378;
    let y = 243;
    if (node !== lead && node.kind === 'agent') {
      const angle = -Math.PI / 4 + agents.indexOf(node) * Math.PI * 2 / agents.length;
      x += Math.cos(angle) * 135.765;
      y += Math.sin(angle) * 100.55;
    } else if (node.kind !== 'agent') {
      const angle = -Math.PI / 2 + outer.indexOf(node) * Math.PI * 2 / outer.length;
      x += Math.cos(angle) * 282;
      y += Math.sin(angle) * 177;
    }
    if (node.position) [x, y] = node.position;
    positions.set(node.id, {
      x: x * width / 756, y: y * requestedHeight / 486,
      above: node.kind !== 'agent' && y < 122, delay: delays.get(node.id) ?? 0,
    });
  });
  return { positions, height: requestedHeight };
}

function roundedRoute(ax: number, ay: number, bx: number, by: number, vertical: boolean, lane: number) {
  if (Math.abs(ax - bx) < 0.5 || Math.abs(ay - by) < 0.5) return `M${ax} ${ay}L${bx} ${by}`;
  const sx = ax + (vertical ? lane : 0);
  const dx = Math.sign(bx - sx);
  const dy = Math.sign(by - ay);
  const radius = Math.min(8, Math.abs(bx - sx) / 2, Math.abs(by - ay) / 2);
  return vertical
    ? `M${sx} ${ay}L${sx} ${by - dy * radius}Q${sx} ${by} ${sx + dx * radius} ${by}L${bx} ${by}`
    : `M${sx} ${ay}L${bx - dx * radius} ${ay}Q${bx} ${ay} ${bx} ${ay + dy * radius}L${bx} ${by}`;
}

function useRoute(a: MovingPoint, b: MovingPoint, vertical: boolean, lane: number) {
  return useTransform(() => roundedRoute(a.x.get(), a.y.get(), b.x.get(), b.y.get(), vertical, lane));
}

function Edge({ a, b, vertical, lane, delay, dim, active, reduced }: {
  a: MovingPoint; b: MovingPoint; vertical: boolean; lane: number; delay: number;
  dim: boolean; active: boolean; reduced: boolean;
}) {
  const d = useRoute(a, b, vertical, lane);
  return <motion.path className="agent-graph__edge" d={d}
    initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
    animate={{ pathLength: 1, opacity: dim ? 0.15 : 1, stroke: active ? '#cbd8e9' : '#e8e8e8' }}
    exit={{ pathLength: reduced ? 1 : 0, opacity: 0, transition: { duration: reduced ? 0.1 : 0.3 } }}
    transition={{ pathLength: { duration: reduced ? 0 : 0.56, delay, ease: POP_EASE }, opacity: { duration: 0.32 }, stroke: { duration: 0.3 } }} />;
}

function CallPulse({ pulse, a, b, vertical, lane, reversedEdge, reduced, onArrive }: {
  pulse: Pulse; a: MovingPoint; b: MovingPoint; vertical: boolean; lane: number;
  reversedEdge: boolean; reduced: boolean; onArrive: (pulse: Pulse) => void;
}) {
  const d = useRoute(a, b, vertical, lane);
  const backwards = pulse.returning !== reversedEdge;
  return <g className="agent-graph__call" data-call-id={pulse.call.id} data-phase={pulse.returning ? 'return' : 'outbound'}>
    {pulse.call.status === 'error' && !reduced && <motion.path d={d} className="agent-graph__edge-flash" />}
    {reduced ? <motion.path d={d} pathLength={1} stroke={pulse.color}
      className="agent-graph__pulse agent-graph__pulse--reduced" onAnimationEnd={() => onArrive(pulse)} />
      : Array.from({ length: 10 }, (_, index) => <motion.path key={index} d={d} pathLength={1} stroke={pulse.color}
        style={{ color: pulse.color, opacity: Math.pow(1 - index / 10, 1.7), '--ag-tail': index * 0.008 } as MotionStyle}
        className={`agent-graph__pulse${backwards ? ' agent-graph__pulse--reverse' : ''}`}
        onAnimationEnd={index === 0 ? () => onArrive(pulse) : undefined} />)}
  </g>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" />
  </svg>;
}

function NodeIcon({ node }: { node: GraphNode }) {
  return <span className="agent-graph__icon" aria-hidden="true">{node.icon
    ?? (node.kind === 'user' ? <UserIcon /> : <span>{node.short ?? node.name.slice(0, 1)}</span>)}</span>;
}

function Badge({ status, reduced }: { status: NonNullable<GraphNode['status']>; reduced: boolean }) {
  if (status !== 'done' && status !== 'waiting' && status !== 'error') return null;
  return <motion.span key={status} className="agent-graph__badge" data-status={status}
    initial={{ opacity: 0, scale: reduced ? 1 : 0.4 }} animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: reduced ? 1 : 0.5 }} transition={{ duration: reduced ? 0.1 : 0.36, ease: POP_EASE }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {status === 'done' ? <path d="M5 14L8.5 17.5L19 6.5" /> : status === 'waiting'
        ? <path d="M12 6.5V12L15 14.5" strokeWidth="2.8" />
        : <><path d="M12 7V13" /><path d="M12 17.5V17.6" strokeWidth="3.4" /></>}
    </svg>
  </motion.span>;
}

function NodeView({ node, point, placement, reduced, dim, selected, recentCount, ripples, onRippleEnd, onSelect, onHover, onFocus }: {
  node: GraphNode; point: MovingPoint; placement: Placement; reduced: boolean; dim: boolean;
  selected: boolean; recentCount: number; ripples: Ripple[]; onRippleEnd: (key: string) => void;
  onSelect: (node: GraphNode, button: HTMLButtonElement) => void;
  onHover: (id: string | null) => void; onFocus: (id: string | null) => void;
}) {
  const present = useIsPresent();
  const status = node.status ?? 'idle';
  const size = diameter(node);
  const line = status === 'error' ? 'Error' : status === 'waiting' ? STATUS_LABEL[status] : node.detail;
  return <motion.div className="agent-graph__node" data-node-id={node.id} data-kind={node.kind}
    data-status={status} data-lead={node.lead || undefined} data-above={placement.above || undefined}
    style={{ x: point.x, y: point.y, '--ag-size': `${size}px`, '--ag-radius': `${size * 0.27}px` } as MotionStyle}
    animate={{ opacity: dim ? 0.22 : 1 }} transition={{ duration: reduced ? 0.1 : 0.32 }}>
    <motion.div className="agent-graph__node-body"
      initial={{ scale: reduced ? 1 : 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: reduced ? 1 : 0.35, opacity: 0, transition: { duration: reduced ? 0.1 : 0.3 } }}
      transition={{ duration: reduced ? 0.1 : 0.56, ease: POP_EASE, delay: point.fresh ? 0 : placement.delay }}>
      <span className="agent-graph__ring" aria-hidden="true" />
      <button type="button" className="agent-graph__disc" data-agent-graph-trigger=""
        aria-label={`${node.name}, ${node.kind}, ${status}${node.doing ? `: ${node.doing}` : ''}. ${recentCount} ${recentCount === 1 ? 'call' : 'calls'} in the last minute`}
        aria-haspopup="dialog" aria-expanded={selected} tabIndex={present ? 0 : -1}
        disabled={!present} onClick={event => onSelect(node, event.currentTarget)}
        onMouseEnter={() => onHover(node.id)} onMouseLeave={() => onHover(null)}
        onFocus={() => onFocus(node.id)} onBlur={() => onFocus(null)}>
        <NodeIcon node={node} />
      </button>
      <span className="agent-graph__stroke" aria-hidden="true" />
      <AnimatePresence initial={false}><Badge key={status} status={status} reduced={reduced} /></AnimatePresence>
      <span className="agent-graph__label" aria-hidden="true">
        <span className="agent-graph__name">{node.name}</span>
        {node.kind === 'agent' && line && <span className="agent-graph__detail">{line}</span>}
      </span>
    </motion.div>
    {!reduced && ripples.map(ripple => <span key={ripple.key} className="agent-graph__ripple"
      style={{ borderColor: ripple.color }} aria-hidden="true" onAnimationEnd={() => onRippleEnd(ripple.key)} />)}
  </motion.div>;
}

function NodeDialog({ node, nodes, calls, now, placement, width, height, reduced, id, onClose }: {
  node: GraphNode; nodes: GraphNode[]; calls: GraphCall[]; now: number; placement: Placement;
  width: number; height: number; reduced: boolean; id: string; onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(242);
  const present = useIsPresent();
  useLayoutEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    const element = card.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setCardHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const related = calls.filter(call => call.at <= now && (call.from === node.id || call.to === node.id))
    .sort((a, b) => b.at - a.at);
  const status = node.status ?? 'idle';
  const cardWidth = Math.min(260, width - 24);
  const left = Math.max(12, Math.min(width - cardWidth - 12, placement.x + 41));
  const top = Math.max(12, Math.min(height - cardHeight - 12, placement.y - 121));
  return <motion.div ref={card} className="agent-graph__dialog" role="dialog" aria-modal="false"
    aria-labelledby={`${id}-name`} aria-describedby={node.doing ? `${id}-doing` : undefined}
    inert={!present} style={{ left, top, width: cardWidth, maxHeight: height - 24 }}
    initial={{ opacity: 0, scale: reduced ? 1 : 0.98, y: reduced ? 0 : 4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : 4 }}
    transition={{ duration: reduced ? 0.1 : 0.22, ease: POP_EASE }}>
    <div className="agent-graph__dialog-heading">
      <span className="agent-graph__dialog-icon"><NodeIcon node={node} /></span>
      <div className="agent-graph__dialog-title"><strong id={`${id}-name`}>{node.name}</strong>{node.detail && <span>{node.detail}</span>}</div>
      <span className="agent-graph__status" data-status={status} aria-live="polite">{STATUS_LABEL[status]}</span>
      <button ref={closeButton} type="button" className="agent-graph__close" onClick={onClose} aria-label="Close details">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
      </button>
    </div>
    {node.doing && <p className="agent-graph__doing" id={`${id}-doing`}>{node.doing}</p>}
    <ul className="agent-graph__recent" aria-label="Recent calls">
      {related.slice(0, 4).map(call => {
        const outgoing = call.from === node.id;
        const peerId = outgoing ? call.to : call.from;
        const peer = nodes.find(item => item.id === peerId);
        return <li key={call.id} data-status={call.status ?? 'pending'} title={`${peer?.name ?? peerId}${call.label ? ` · ${call.label}` : ''}`}>
          <span className="agent-graph__call-direction" aria-label={outgoing ? 'To' : 'From'}>{outgoing ? '→' : '←'}</span>
          {peer && <span className="agent-graph__peer-icon" data-kind={peer.kind}><NodeIcon node={peer} /></span>}
          <span className="agent-graph__call-description"><strong>{peer?.name ?? peerId}</strong>{call.label && <span> · {call.label}</span>}</span>
          <span className="agent-graph__call-result" aria-label={call.status === 'ok' ? 'Answered' : call.status === 'error' ? 'Failed' : 'Pending'}>
            {call.status === 'pending' || !call.status ? <svg className="agent-graph__pending" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.5" />
                <path d="M12 3.5A8.5 8.5 0 0 1 20.5 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              : call.status === 'error' ? 'Failed' : call.ms !== undefined ? `${call.ms}ms` : '✓'}
          </span>
        </li>;
      })}
      {!related.length && <li className="agent-graph__empty">No calls yet</li>}
    </ul>
    <div className="agent-graph__dialog-footer"><strong>{money(node.cost ?? 0)}</strong><span>{related.filter(call => now - call.at < 60_000).length} calls in the last minute</span></div>
  </motion.div>;
}

/** UI owns visual transitions only. The caller owns nodes, call completion, and time. */
export function AgentGraph({ nodes, calls = NO_CALLS, edges = NO_EDGES, now, height = 486, onSelect, title = 'Agent graph', className = '' }: AgentGraphProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(756);
  const reduced = Boolean(useReducedMotion());
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const seen = useRef(new Set<string>());
  const mounted = useRef(false);
  const cache = useRef(new Map<string, MovingPoint>());
  const requestedEdges = useMemo(() => [...edges, ...calls.filter(call => call.at <= now)
    .map(call => [call.from, call.to] as [string, string])], [edges, calls, now]);
  const layout = useMemo(() => placeNodes(nodes, width, height), [nodes, width, height]);
  const byId = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);
  const points = useMemo(() => {
    const next = new Map<string, MovingPoint>();
    layout.positions.forEach((placement, nodeId) => {
      let point = cache.current.get(nodeId);
      if (!point) {
        const connection = requestedEdges.find(([from, to]) => (from === nodeId && byId.get(to)?.kind === 'agent')
          || (to === nodeId && byId.get(from)?.kind === 'agent'));
        const parentId = connection && (connection[0] === nodeId ? connection[1] : connection[0]);
        const parent = parentId ? cache.current.get(parentId) : undefined;
        const origin = mounted.current && !reduced && parent ? { x: parent.x.get(), y: parent.y.get() } : placement;
        point = { x: motionValue(origin.x), y: motionValue(origin.y), target: origin, fresh: mounted.current };
      }
      next.set(nodeId, point);
    });
    return next;
  }, [layout, requestedEdges, byId, reduced]);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => { if (element.clientWidth) setWidth(element.clientWidth); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    cache.current = points;
    mounted.current = true;
    points.forEach((point, nodeId) => {
      const target = layout.positions.get(nodeId)!;
      if (reduced) {
        point.x.jump(target.x); point.y.jump(target.y);
      } else {
        if (point.target.x !== target.x) animate(point.x, target.x, { type: 'spring', stiffness: 240, damping: 27 });
        if (point.target.y !== target.y) animate(point.y, target.y, { type: 'spring', stiffness: 240, damping: 27 });
      }
      point.target = target;
    });
  }, [points, layout, reduced]);

  const connections = useMemo(() => {
    const unique = new Set<string>();
    return requestedEdges.filter(([from, to]) => {
      const key = JSON.stringify([from, to].sort());
      if (from === to || !points.has(from) || !points.has(to) || unique.has(key)) return false;
      unique.add(key);
      return true;
    }).map(([from, to]) => {
      // Route lead→agent vertically with separate lanes, like the measured center hub.
      if (byId.get(to)?.lead && !byId.get(from)?.lead) [from, to] = [to, from];
      else if (byId.get(from)?.kind !== 'agent' && byId.get(to)?.kind === 'agent') [from, to] = [to, from];
      const a = layout.positions.get(from)!;
      const b = layout.positions.get(to)!;
      const hubAgent = Boolean(byId.get(from)?.lead && byId.get(to)?.kind === 'agent');
      const vertical = hubAgent || Boolean(byId.get(from)?.lead && byId.get(to)?.kind === 'user')
        || Boolean(byId.get(from)?.kind === 'agent' && !byId.get(from)?.lead && byId.get(to)?.kind === 'tool' && b.y < a.y);
      const lane = hubAgent ? (b.x > a.x ? 1 : -1) * (b.y < a.y ? 8 : 4) : 0;
      return { from, to, vertical, lane, key: JSON.stringify([from, to]) };
    });
  }, [requestedEdges, points, byId, layout]);

  useEffect(() => {
    const added: Pulse[] = [];
    calls.forEach(call => {
      if (call.at > now) return;
      const status = call.status ?? 'pending';
      const key = JSON.stringify([call.id, status]);
      if (seen.current.has(key)) return;
      seen.current.add(key);
      // Re-rendering the business clock never restarts an existing pulse. Old
      // history, including a late status change, cannot enqueue a fresh pulse.
      if (now - call.at > 4_000 || !points.has(call.from) || !points.has(call.to)) return;
      added.push({ key, call, returning: status !== 'pending',
        color: status === 'pending' && byId.get(call.to)?.kind === 'user' ? '#f5a524' : COLORS[status] });
    });
    if (added.length) setPulses(current => [...current, ...added]);
  }, [calls, now, points, byId]);

  useEffect(() => {
    setPulses(current => current.some(pulse => !points.has(pulse.call.from) || !points.has(pulse.call.to))
      ? current.filter(pulse => points.has(pulse.call.from) && points.has(pulse.call.to)) : current);
    setRipples(current => current.some(ripple => !points.has(ripple.nodeId))
      ? current.filter(ripple => points.has(ripple.nodeId)) : current);
    setFocused(current => current && !points.has(current) ? null : current);
    setHovered(current => current && !points.has(current) ? null : current);
  }, [points]);

  const close = useCallback(() => {
    setSelectedId(null);
    onSelectRef.current?.(null);
    if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
    else root.current?.focus({ preventScroll: true });
  }, []);
  const selected = selectedId ? byId.get(selectedId) : undefined;
  useEffect(() => { if (selectedId && !selected) close(); }, [selectedId, selected, close]);

  function select(node: GraphNode, button: HTMLButtonElement) {
    if (selectedId === node.id) { close(); return; }
    opener.current = button;
    setSelectedId(node.id);
    onSelectRef.current?.(node);
  }
  const arrive = useCallback((pulse: Pulse) => {
    setPulses(current => current.filter(item => item.key !== pulse.key));
    if (!reduced) setRipples(current => [...current, {
      key: pulse.key, nodeId: pulse.returning ? pulse.call.from : pulse.call.to, color: pulse.color,
    }]);
  }, [reduced]);
  const endRipple = useCallback((key: string) => setRipples(current => current.filter(item => item.key !== key)), []);
  const activeId = hovered ?? focused ?? selectedId;
  const neighbors = new Set(activeId ? [activeId] : []);
  connections.forEach(({ from, to }) => {
    if (from === activeId) neighbors.add(to);
    if (to === activeId) neighbors.add(from);
  });
  const recent = calls.filter(call => call.at <= now && now - call.at < 60_000);
  const cost = nodes.reduce((sum, node) => sum + (node.cost ?? 0), 0);
  const alerts = nodes.filter(node => node.status === 'waiting' || node.status === 'error');
  const lead = nodes.find(node => node.lead && node.kind === 'agent') ?? nodes.find(node => node.kind === 'agent');
  const leadPoint = lead && points.get(lead.id);

  return <div ref={root} className={`agent-graph ${className}`} data-reduced-motion={reduced || undefined}
    tabIndex={-1} onKeyDown={event => { if (event.key === 'Escape' && selectedId) { event.stopPropagation(); close(); } }}>
    <div className="agent-graph__bar">
      <div className="agent-graph__heading">
        <svg className="agent-graph__mark" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 8.4 3.2 4M8 8.4l5-4.2M8 8.4l4.4 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".5" /><g fill="currentColor"><circle cx="8" cy="8.4" r="2.4" /><circle cx="3.2" cy="4" r="1.6" /><circle cx="13" cy="4.2" r="1.6" /><circle cx="12.4" cy="12.4" r="1.6" /></g></svg>
        <span className="agent-graph__title" id={`${id}-title`}>{title}</span>
      </div>
      <div className="agent-graph__alerts" aria-live="polite" aria-atomic="true">
        {alerts.map(node => <button type="button" className="agent-graph__chip" data-status={node.status}
          aria-haspopup="dialog" aria-expanded={selectedId === node.id} key={`${node.id}-${node.status}`}
          onClick={event => select(node, event.currentTarget)}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
            {node.status === 'waiting' ? <><circle cx="7" cy="7" r="4.5" /><path d="M7 4.5V7l1.5 1" /></> : <path d="m4 4 6 6m0-6-6 6" />}
          </svg>
          {node.name} {node.status === 'waiting' ? 'needs you' : 'failed'}
        </button>)}
      </div>
      <div className="agent-graph__summary"><span><b>{nodes.filter(node => node.kind === 'agent').length}</b> agents</span><span><b>{nodes.filter(node => node.kind === 'tool').length}</b> tools</span><span><b>{recent.length}</b> calls/min</span><strong>{money(cost)}</strong></div>
    </div>
    <div className="agent-graph__panel">
      <div className="agent-graph__stage" role="group" aria-labelledby={`${id}-title`} style={{ height: layout.height }}>
        <svg className="agent-graph__links" width={width} height={layout.height} aria-hidden="true">
          <defs><radialGradient id={`${id}-halo`}>
            <stop offset="0" stopColor="rgba(130,188,255,.16)" stopOpacity="1" />
            <stop offset="1" stopColor="rgba(130,188,255,.16)" stopOpacity="0" />
          </radialGradient></defs>
          {leadPoint && <motion.ellipse className="agent-graph__halo" cx={leadPoint.x} cy={leadPoint.y}
            rx={140.85 * width / 756} ry={81 * height / 486} fill={`url(#${id}-halo)`} />}
          <AnimatePresence>{connections.map(edge => <Edge key={edge.key} a={points.get(edge.from)!} b={points.get(edge.to)!}
            vertical={edge.vertical} lane={edge.lane} reduced={reduced}
            delay={points.get(edge.to)!.fresh ? 0 : Math.max(layout.positions.get(edge.from)!.delay, layout.positions.get(edge.to)!.delay)}
            dim={Boolean(activeId && edge.from !== activeId && edge.to !== activeId)} active={edge.from === activeId || edge.to === activeId} />)}</AnimatePresence>
          {pulses.map(pulse => {
            const edge = connections.find(item => (item.from === pulse.call.from && item.to === pulse.call.to)
              || (item.from === pulse.call.to && item.to === pulse.call.from));
            const from = edge?.from ?? pulse.call.from;
            const to = edge?.to ?? pulse.call.to;
            if (!points.has(from) || !points.has(to)) return null;
            return <CallPulse key={pulse.key} pulse={pulse} a={points.get(from)!} b={points.get(to)!}
              vertical={edge?.vertical ?? false} lane={edge?.lane ?? 0} reversedEdge={from !== pulse.call.from}
              reduced={reduced} onArrive={arrive} />;
          })}
        </svg>
        <div className="agent-graph__nodes">
          <AnimatePresence>{nodes.map(node => <NodeView key={node.id} node={node} point={points.get(node.id)!}
            placement={layout.positions.get(node.id)!} reduced={reduced} dim={Boolean(activeId && !neighbors.has(node.id))}
            selected={selectedId === node.id} recentCount={recent.filter(call => call.from === node.id || call.to === node.id).length}
            ripples={ripples.filter(ripple => ripple.nodeId === node.id)} onRippleEnd={endRipple}
            onSelect={select} onHover={setHovered} onFocus={setFocused} />)}</AnimatePresence>
        </div>
        <AnimatePresence>{selected && <NodeDialog key={selected.id} node={selected} nodes={nodes} calls={calls} now={now}
          placement={layout.positions.get(selected.id)!} width={width} height={layout.height} reduced={reduced} id={`${id}-dialog`} onClose={close} />}</AnimatePresence>
      </div>
      <div className="agent-graph__legend" aria-label="Call colors">
        <span><i data-tone="call" />Call</span><span><i data-tone="answer" />Answer</span><span><i data-tone="waiting" />Needs you</span><span><i data-tone="error" />Failed</span>
      </div>
    </div>
  </div>;
}
