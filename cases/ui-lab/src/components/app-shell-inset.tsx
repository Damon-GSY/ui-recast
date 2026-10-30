"use client";
import {useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode} from "react";
import "./app-shell-inset.css";

// Geometry observed in public rendered SVG; see parts/shell/source-*-dom.html.
const glyphs = {
  sidebar: <><path d="M2 12C2 8.31087 2 6.4663 2.81382 5.15877C3.1149 4.67502 3.48891 4.25427 3.91891 3.91554C5.08116 3 6.72077 3 10 3H14C17.2792 3 18.9188 3 20.0811 3.91554C20.5111 4.25427 20.8851 4.67502 21.1862 5.15877C22 6.4663 22 8.31087 22 12C22 15.6891 22 17.5337 21.1862 18.8412C20.8851 19.325 20.5111 19.7457 20.0811 20.0845C18.9188 21 17.2792 21 14 21H10C6.72077 21 5.08116 21 3.91891 20.0845C3.48891 19.7457 3.1149 19.325 2.81382 18.8412C2 17.5337 2 15.6891 2 12Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M9.5 3L9.5 21" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M5 7H6M5 10H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  search: <><path d="M17 17L21 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  chevron: <><path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  home: <><path d="M3 11.9896V14.5C3 17.7998 3 19.4497 4.02513 20.4749C5.05025 21.5 6.70017 21.5 10 21.5H14C17.2998 21.5 18.9497 21.5 19.9749 20.4749C21 19.4497 21 17.7998 21 14.5V11.9896C21 10.3083 21 9.46773 20.6441 8.74005C20.2882 8.01237 19.6247 7.49628 18.2976 6.46411L16.2976 4.90855C14.2331 3.30285 13.2009 2.5 12 2.5C10.7991 2.5 9.76689 3.30285 7.70242 4.90855L5.70241 6.46411C4.37533 7.49628 3.71179 8.01237 3.3559 8.74005C3 9.46773 3 10.3083 3 11.9896Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  chat: <><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C10.3719 21.5 8.8394 21.0904 7.5 20.3687C5.63177 19.362 4.37462 20.2979 3.26592 20.4658C3.09774 20.4913 2.93024 20.4302 2.80997 20.31C2.62741 20.1274 2.59266 19.8451 2.6935 19.6074C3.12865 18.5818 3.5282 16.6382 2.98341 15C2.6698 14.057 2.5 13.0483 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M12.1257 12H12.0007M8.125 12H8M16.125 12H16M12.2507 12C12.2507 12.1381 12.1388 12.25 12.0007 12.25C11.8627 12.25 11.7507 12.1381 11.7507 12C11.7507 11.8619 11.8627 11.75 12.0007 11.75C12.1388 11.75 12.2507 11.8619 12.2507 12ZM8.25 12C8.25 12.1381 8.13807 12.25 8 12.25C7.86193 12.25 7.75 12.1381 7.75 12C7.75 11.8619 7.86193 11.75 8 11.75C8.13807 11.75 8.25 11.8619 8.25 12ZM16.25 12C16.25 12.1381 16.1381 12.25 16 12.25C15.8619 12.25 15.75 12.1381 15.75 12C15.75 11.8619 15.8619 11.75 16 11.75C16.1381 11.75 16.25 11.8619 16.25 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  runs: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.9"></circle><path d="M15.9453 12.3948C15.7686 13.0215 14.9333 13.4644 13.2629 14.3502C11.648 15.2064 10.8406 15.6346 10.1899 15.4625C9.9209 15.3913 9.6758 15.2562 9.47812 15.0701C9 14.6198 9 13.7465 9 12C9 10.2535 9 9.38018 9.47812 8.92995C9.6758 8.74381 9.9209 8.60868 10.1899 8.53753C10.8406 8.36544 11.648 8.79357 13.2629 9.64983C14.9333 10.5356 15.7686 10.9785 15.9453 11.6052C16.0182 11.8639 16.0182 12.1361 15.9453 12.3948Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  analytics: <><path d="M7 17L7 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path><path d="M12 17L12 7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path><path d="M17 17L17 11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path><path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  folder: <><path d="M8 7H16.75C18.8567 7 19.91 7 20.6667 7.50559C20.9943 7.72447 21.2755 8.00572 21.4944 8.33329C22 9.08996 22 10.1433 22 12.25C22 15.7612 22 17.5167 21.1573 18.7779C20.7926 19.3238 20.3238 19.7926 19.7779 20.1573C18.5167 21 16.7612 21 13.25 21H12C7.28595 21 4.92893 21 3.46447 19.5355C2 18.0711 2 15.714 2 11V7.94427C2 6.1278 2 5.21956 2.38032 4.53806C2.65142 4.05227 3.05227 3.65142 3.53806 3.38032C4.21956 3 5.1278 3 6.94427 3C8.10802 3 8.6899 3 9.19926 3.19101C10.3622 3.62712 10.8418 4.68358 11.3666 5.73313L12 7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path></>,
  board: <><path d="M12 18V22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M10 18L5 22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M14 18L19 22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M2.5 12C2.5 14.8284 2.5 16.2426 3.37868 17.1213C4.25736 18 5.67157 18 8.5 18H15.5C18.3284 18 19.7426 18 20.6213 17.1213C21.5 16.2426 21.5 14.8284 21.5 12V8C21.5 5.17157 21.5 3.75736 20.6213 2.87868C19.7426 2 18.3284 2 15.5 2H8.5C5.67157 2 4.25736 2 3.37868 2.87868C2.5 3.75736 2.5 5.17157 2.5 8V12Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M8 13V10M12 13V7M16 13V11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path></>,
  revenue: <><path d="M17.9583 8.38889C17.9583 6.24111 15.2907 4.5 12 4.5C8.7093 4.5 6.04167 6.24111 6.04167 8.38889C6.04167 10.5367 7.66667 11.7222 12 11.7222C16.3333 11.7222 18.5 12.8333 18.5 15.6111C18.5 18.3889 15.5899 19.5 12 19.5C8.41015 19.5 5.5 17.7589 5.5 15.6111" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path><path d="M12.5 2.5V4.21M12.5 21.5V19.79" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  mail: <><path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  workflow: <><path d="M3 4C3 2.34533 3.34533 2 5 2H9C10.6547 2 11 2.34533 11 4C11 5.65467 10.6547 6 9 6H5C3.34533 6 3 5.65467 3 4Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M13 13C13 11.3453 13.3453 11 15 11H19C20.6547 11 21 11.3453 21 13C21 14.6547 20.6547 15 19 15H15C13.3453 15 13 14.6547 13 13Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M4 20C4 18.3453 4.34533 18 6 18H10C11.6547 18 12 18.3453 12 20C12 21.6547 11.6547 22 10 22H6C4.34533 22 4 21.6547 4 20Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M17 11C17 10.5353 17 10.303 16.9616 10.1098C16.8038 9.31644 16.1836 8.69624 15.3902 8.53843C15.197 8.5 14.9647 8.5 14.5 8.5H9.5C9.03534 8.5 8.80302 8.5 8.60982 8.46157C7.81644 8.30376 7.19624 7.68356 7.03843 6.89018C7 6.69698 7 6.46466 7 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M17 15V16C17 17.8856 17 18.8284 16.4142 19.4142C15.8284 20 14.8856 20 13 20H12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  close: <><path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  right: <><path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  profile: <><path d="M20 21.0001C19.713 17.269 16.7289 14.3151 12.995 14.0662L12 13.9999C11.6446 14.0096 11.3134 14.0225 11.0008 14.0378C7.3 14.2192 4.28417 17.3057 4 21.0001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><circle cx="12" cy="6.99988" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></circle></>,
  settings: <><path d="M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path><path d="M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z" stroke="currentColor" strokeWidth="1.9"></path></>,
  help: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></circle><path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  logout: <><path d="M15.5 8.04045C15.4588 6.87972 15.3216 6.15451 14.8645 5.58671C14.2114 4.77536 13.0944 4.52064 10.8605 4.01121L9.85915 3.78286C6.4649 3.00882 4.76777 2.6218 3.63388 3.51317C2.5 4.40454 2.5 6.1257 2.5 9.56803V14.432C2.5 17.8743 2.5 19.5955 3.63388 20.4868C4.76777 21.3782 6.4649 20.9912 9.85915 20.2171L10.8605 19.9888C13.0944 19.4794 14.2114 19.2246 14.8645 18.4133C15.3216 17.8455 15.4588 17.1203 15.5 15.9595" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M18.5 9.01172C18.5 9.01172 21.5 11.2212 21.5 12.0117C21.5 12.8023 18.5 15.0117 18.5 15.0117M21 12.0117H8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  plus: <><path d="M12 4V20M20 12H4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  check: <><path d="M5 14L8.5 17.5L19 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
};

function ShellIcon({name, size = 16}: {name: keyof typeof glyphs; size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">{glyphs[name]}</svg>;
}

const navigation = [
  {label: 'Home', icon: 'home'}, {label: 'Chat', icon: 'chat'}, {label: 'Runs', icon: 'runs'},
  {label: 'Analytics', icon: 'analytics'}, {label: 'Deliverables', icon: 'folder'},
] as const;
const agents = [
  {label: 'Board prep', icon: 'board'}, {label: 'Revenue ops', icon: 'revenue'},
  {label: 'Inbox triage', icon: 'mail'}, {label: 'Workflows', icon: 'workflow'},
] as const;
const setupGroups = [
  {label: 'Set up your workspace', items: ['Name your workspace', 'Invite your teammates', 'Connect your first app']},
  {label: 'Start working', items: ['Create a folder', 'Start your first chat', 'Upload a file']},
  {label: 'Make it yours', items: ['Add a profile picture', 'Choose your notifications']},
];

function SetupGuide({onNavigate}: {onNavigate?: (label: string) => void}) {
  const [open, setOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [group, setGroup] = useState<number | null>(0);
  const [height, setHeight] = useState(259);
  const content = useRef<HTMLDivElement>(null);
  const summary = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    if (!open || !content.current) return;
    const node = content.current;
    const measure = () => setHeight(Math.ceil(node.getBoundingClientRect().height));
    const observer = new ResizeObserver(measure);
    observer.observe(node); measure();
    return () => observer.disconnect();
  }, [open]);
  useEffect(() => {
    if (open || !showContent) return;
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    const timer = window.setTimeout(() => {
      setShowContent(false);
      requestAnimationFrame(() => summary.current?.focus());
    }, delay);
    return () => window.clearTimeout(timer);
  }, [open, showContent]);
  function close() {setOpen(false);}
  return <div className="ar-shell-guide-slot">
    <div className="ar-shell-guide" data-open={open} style={{height: open ? height : 70}}
      onKeyDown={e => {if (e.key === 'Escape' && open) {e.stopPropagation(); close();}}}>
      {showContent ? <div className="ar-shell-guide-content" data-exiting={!open} inert={!open} id={id} key="expanded">
        <div className="ar-shell-setup" ref={content}>
          <div className="ar-shell-setup-head"><b>Getting started</b><button type="button" ref={closeButton} aria-label="Close setup guide" onClick={close}><ShellIcon name="close" size={18}/></button></div>
          <div className="ar-shell-setup-progress" role="progressbar" aria-label="Setup progress" aria-valuenow={13} aria-valuemin={0} aria-valuemax={100}><span/></div>
          {setupGroups.map((section, i) => <div className="ar-shell-setup-group" data-open={group === i} key={section.label}>
            <button className="ar-shell-setup-group-head" type="button" aria-expanded={group === i} aria-controls={`${id}-${i}`} onClick={() => setGroup(group === i ? null : i)}>
              <span>{section.label}</span><ShellIcon name="chevron" size={14}/>
            </button>
            <div className="ar-shell-setup-panel" id={`${id}-${i}`} inert={group !== i}><div className="ar-shell-setup-tasks">
              {section.items.map((label, j) => {
                const done = i === 0 && j === 0, disabled = i === 0 ? j > 1 : j > 0;
                return <button key={label} className="ar-shell-setup-task" type="button" disabled={disabled} data-done={done} onClick={() => onNavigate?.(label)}>
                  <span className="ar-shell-task-mark">{done ? <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="m5 8 2 2 4-4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : disabled ? <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="m4 12 8-8" stroke="currentColor" strokeWidth="1.5"/></svg> : null}</span>
                  <span>{label}</span>{done && <span className="ar-shell-sr">, completed</span>}
                </button>;
              })}
            </div></div>
          </div>)}
        </div>
      </div> : <button type="button" ref={summary} className="ar-shell-guide-summary ar-shell-guide-content" key="summary" aria-expanded={false} aria-controls={id}
          onClick={() => {setGroup(0); setShowContent(true); setOpen(true); requestAnimationFrame(() => closeButton.current?.focus());}}>
        <span className="ar-shell-guide-title">Getting started<ShellIcon name="right" size={13}/></span>
        <span className="ar-shell-guide-sub">13% done · <span>Great start!</span></span><span className="ar-shell-guide-progress"><span/></span>
      </button>}
    </div>
  </div>;
}

function News({workspace, onNavigate}: {workspace: string; onNavigate?: (label: string) => void}) {
  const [index, setIndex] = useState(0);
  if (index === 2) return null;
  return <div className="ar-shell-news" data-stacked={index === 0}>
    {index === 0 && <div className="ar-shell-news-back" aria-hidden="true"><span>New in {workspace}</span><ShellIcon name="close" size={13}/></div>}
    <div className="ar-shell-news-card" key={index}>
      <div className="ar-shell-news-top"><span>New in {workspace}</span><button type="button" aria-label="Dismiss" onClick={e => {const footer = e.currentTarget.closest('.ar-shell-footer'); setIndex(index + 1); requestAnimationFrame(() => footer?.querySelector<HTMLButtonElement>('.ar-shell-news-top button, .ar-shell-guide button')?.focus());}}><ShellIcon name="close" size={13}/></button></div>
      <b>{index === 0 ? 'Shared folders' : 'Scheduled chats'}</b>
      <button type="button" className="ar-shell-news-more" onClick={() => onNavigate?.('Full changelog')}>Full changelog<ShellIcon name="right" size={13}/></button>
    </div>
  </div>;
}

type MenuKind = 'workspace' | 'user';
type MenuItem = {label: string; description?: string; icon?: keyof typeof glyphs; current?: boolean; danger?: boolean};
export interface AppShellUser {name: string; avatar?: string}

export interface AppShellInsetProps {
  children: ReactNode;
  workspace: string;
  user: AppShellUser;
  onNavigate?: (label: string) => void;
  className?: string;
  /** Omit to retain the reference navigation; pass a node to supply host navigation. */
  navigation?: ReactNode | ((onNavigate: (label: string) => void) => ReactNode);
  activeItem?: string;
  runCount?: number | null;
  /** Pass null to omit the reference news/setup widgets, or supply caller-owned content. */
  footer?: ReactNode;
  /** Caller-owned workspace choices. Omitting retains the reference menu. */
  workspaceItems?: readonly {label: string; description?: string; current?: boolean}[];
}

export function AppShellInset({children, workspace, user, onNavigate, className = '', navigation: navigationSlot, activeItem = 'Runs', runCount = 3, footer, workspaceItems}: AppShellInsetProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches);
  const [width, setWidth] = useState(272);
  const [dragging, setDragging] = useState(false);
  const [menu, setMenu] = useState<MenuKind | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const workspaceButton = useRef<HTMLButtonElement>(null);
  const userButton = useRef<HTMLButtonElement>(null);
  const sideId = useId();
  const hidden = narrow ? !drawerOpen : collapsed;
  const menuButton = (kind: MenuKind) => kind === 'workspace' ? workspaceButton : userButton;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const update = () => {setNarrow(media.matches); setDrawerOpen(false); setMenu(null);};
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const outside = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !root.current?.contains(e.target.closest('.ar-shell-menu-anchor'))) setMenu(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [menu]);
  function closeDrawer() {setDrawerOpen(false); setMenu(null); requestAnimationFrame(() => opener.current?.focus());}
  function toggleSidebar() {
    setMenu(null);
    if (narrow) {
      if (drawerOpen) closeDrawer();
      else {setDrawerOpen(true); requestAnimationFrame(() => workspaceButton.current?.focus());}
    } else {
      setCollapsed(!collapsed);
      requestAnimationFrame(() => (collapsed ? workspaceButton : opener).current?.focus());
    }
  }
  function navigate(label: string) {
    if (menu) menuButton(menu).current?.focus();
    setMenu(null);
    if (narrow) closeDrawer();
    onNavigate?.(label);
  }
  function openMenu(kind: MenuKind, last = false) {
    setMenu(kind);
    requestAnimationFrame(() => {
      const items = root.current?.querySelectorAll<HTMLButtonElement>(`.ar-shell-menu--${kind} [role="menuitem"]`);
      if (items?.length) items[last ? items.length - 1 : 0].focus();
    });
  }
  function menuKey(e: KeyboardEvent<HTMLButtonElement>, kind: MenuKind) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {e.preventDefault(); openMenu(kind, e.key === 'ArrowUp');}
  }
  function popup(kind: MenuKind, items: readonly MenuItem[]) {
    return <div className={`ar-shell-menu ar-shell-menu--${kind}`} role="menu" aria-label={kind === 'workspace' ? 'Workspaces' : 'Account'}
      onKeyDown={e => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
        const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        e.preventDefault(); items[next]?.focus();
      }}>
      {kind === 'workspace' && <div className="ar-shell-menu-title">Workspaces</div>}
      <div className="ar-shell-menu-list">{items.map(item => <button key={item.label} type="button" role="menuitem" className="ar-shell-menu-item" data-description={!!item.description} data-current={item.current || undefined} data-danger={item.danger || undefined} onClick={() => navigate(item.label)}>
        {item.icon && <ShellIcon name={item.icon} size={15}/>}
        <span className="ar-shell-menu-label"><span>{item.label}</span>{item.description && <small>{item.description}</small>}</span>
        {item.current && <ShellIcon name="check" size={14}/>}
      </button>)}</div>
    </div>;
  }
  function navItems(items: readonly {label: string; icon: keyof typeof glyphs}[]) {
    return items.map(item => <button type="button" className="ar-shell-nav-item" key={item.label} aria-current={item.label === activeItem ? 'page' : undefined} onClick={() => navigate(item.label)}>
      <ShellIcon name={item.icon}/><span>{item.label}</span>{item.label === 'Runs' && runCount != null && <span className="ar-shell-nav-count">{runCount}</span>}
    </button>);
  }
  return <div ref={root} className={`ar-shell ${className}`} data-collapsed={collapsed} data-drawer={drawerOpen} data-dragging={dragging}
    style={{'--ar-shell-width': `${width}px`} as CSSProperties}
    onKeyDown={e => {
      if (e.key === 'Escape') {
        if (menu) {e.stopPropagation(); menuButton(menu).current?.focus(); setMenu(null);}
        else if (drawerOpen) {e.stopPropagation(); closeDrawer();}
      }
      if (e.key === 'Tab' && drawerOpen && narrow) {
        const items = [...(sidebar.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]') ?? [])].filter(el => !el.closest('[inert]') && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last?.focus();}
        else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first?.focus();}
      }
    }}>
    <button ref={opener} type="button" className="ar-shell-icon-button ar-shell-open" aria-label="Open sidebar" aria-expanded={!hidden} aria-controls={sideId} tabIndex={hidden ? 0 : -1} onClick={toggleSidebar}><ShellIcon name="sidebar"/></button>
    <div className="ar-shell-scrim" aria-hidden="true" onClick={closeDrawer}/>
    <div className="ar-shell-side-slot">
      <aside ref={sidebar} id={sideId} className="ar-shell-sidebar" aria-label="Sidebar" role={narrow && drawerOpen ? 'dialog' : undefined} aria-modal={narrow && drawerOpen || undefined} inert={hidden}>
        <div className="ar-shell-sidebar-head">
          <div className="ar-shell-menu-anchor">
            <button type="button" className="ar-shell-workspace" ref={workspaceButton} aria-haspopup="menu" aria-expanded={menu === 'workspace'} onKeyDown={e => menuKey(e, 'workspace')} onClick={() => setMenu(menu === 'workspace' ? null : 'workspace')}>
              <span className="ar-shell-workspace-logo">{workspace.slice(0, 1)}</span><span>{workspace}</span><ShellIcon name="chevron" size={13}/>
            </button>
            {menu === 'workspace' && popup('workspace', workspaceItems ?? [{label: workspace, description: 'Pro · 8 members', current: true}, {label: 'Personal', description: 'Free'}, {label: 'Create workspace', icon: 'plus'}])}
          </div>
          <div className="ar-shell-side-tools">
            <button type="button" className="ar-shell-icon-button" aria-label="Search" onClick={() => navigate('Search')}><ShellIcon name="search"/></button>
            <button type="button" className="ar-shell-icon-button" aria-label={narrow ? 'Close sidebar' : 'Collapse sidebar'} aria-expanded={!hidden} aria-controls={sideId} onClick={toggleSidebar}><ShellIcon name="sidebar"/></button>
          </div>
        </div>
        <nav className="ar-shell-nav" aria-label="Main navigation">{typeof navigationSlot === 'function' ? navigationSlot(navigate) : navigationSlot ?? <><div className="ar-shell-nav-group">{navItems(navigation)}</div><div className="ar-shell-nav-group"><div className="ar-shell-nav-label">Agents</div>{navItems(agents)}</div></>}</nav>
        <div className="ar-shell-footer">
          {footer === undefined ? <><News workspace={workspace} onNavigate={navigate}/><SetupGuide onNavigate={onNavigate}/></> : footer}
          <div className="ar-shell-menu-anchor ar-shell-user-anchor">
            <button type="button" className="ar-shell-user" ref={userButton} aria-haspopup="menu" aria-expanded={menu === 'user'} onKeyDown={e => menuKey(e, 'user')} onClick={() => setMenu(menu === 'user' ? null : 'user')}>
              {user.avatar ? <img className="ar-shell-avatar" src={user.avatar} alt=""/> : <span className="ar-shell-avatar">{user.name.split(/\s+/).map(s => s[0]).slice(0, 2).join('')}</span>}
              <span>{user.name}</span><ShellIcon name="chevron" size={13}/>
            </button>
            {menu === 'user' && popup('user', [{label: 'Profile', icon: 'profile'}, {label: 'Settings', icon: 'settings'}, {label: 'Help & feedback', icon: 'help'}, {label: 'Log out', icon: 'logout', danger: true}])}
          </div>
        </div>
      </aside>
    </div>
    <main className="ar-shell-surface" inert={narrow && drawerOpen}>{children}</main>
    <div className="ar-shell-resizer" role="separator" tabIndex={hidden || narrow ? -1 : 0} aria-label="Resize sidebar" aria-controls={sideId} aria-orientation="vertical" aria-valuemin={220} aria-valuemax={380} aria-valuenow={width}
      onKeyDown={e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault(); setWidth(w => e.key === 'Home' ? 220 : e.key === 'End' ? 380 : Math.max(220, Math.min(380, w + (e.key === 'ArrowRight' ? 10 : -10))));
      }}
      onPointerDown={e => {if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); setDragging(true);}}
      onPointerMove={e => {if (dragging) setWidth(Math.max(220, Math.min(380, e.clientX - (root.current?.getBoundingClientRect().left ?? 0))));}}
      onPointerUp={e => {if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); setDragging(false);}}
      onLostPointerCapture={() => setDragging(false)}/>
  </div>;
}
