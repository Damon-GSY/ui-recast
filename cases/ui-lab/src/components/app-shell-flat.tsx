"use client";
import {useEffect, useId, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import './app-shell-flat.css';

// Glyph geometry from publicly rendered SVG assets. Provenance: evidence/batch/app-shell-flat/reference/rendered-icons.json.
const glyphs = {
  sidebar: <><path d="M2 12C2 8.31087 2 6.4663 2.81382 5.15877C3.1149 4.67502 3.48891 4.25427 3.91891 3.91554C5.08116 3 6.72077 3 10 3H14C17.2792 3 18.9188 3 20.0811 3.91554C20.5111 4.25427 20.8851 4.67502 21.1862 5.15877C22 6.4663 22 8.31087 22 12C22 15.6891 22 17.5337 21.1862 18.8412C20.8851 19.325 20.5111 19.7457 20.0811 20.0845C18.9188 21 17.2792 21 14 21H10C6.72077 21 5.08116 21 3.91891 20.0845C3.48891 19.7457 3.1149 19.325 2.81382 18.8412C2 17.5337 2 15.6891 2 12Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M9.5 3L9.5 21" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M5 7H6M5 10H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  search: <><path d="M17 17L21 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  chevron: <><path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  share: <><path d="M21 6.5C21 8.15685 19.6569 9.5 18 9.5C16.3431 9.5 15 8.15685 15 6.5C15 4.84315 16.3431 3.5 18 3.5C19.6569 3.5 21 4.84315 21 6.5Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M21 17.5C21 19.1569 19.6569 20.5 18 20.5C16.3431 20.5 15 19.1569 15 17.5C15 15.8431 16.3431 14.5 18 14.5C19.6569 14.5 21 15.8431 21 17.5Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M8.72852 10.7495L15.2285 7.75M8.72852 13.25L15.2285 16.2495" stroke="currentColor" strokeWidth="1.9"></path></>,
  more: <><path d="M6.00449 12.5V12M18.0045 12.5V12M12.0045 12.5V12M7.00449 12.5C7.00449 11.9477 6.55677 11.5 6.00449 11.5C5.4522 11.5 5.00449 11.9477 5.00449 12.5C5.00449 13.0523 5.4522 13.5 6.00449 13.5C6.55677 13.5 7.00449 13.0523 7.00449 12.5ZM19.0045 12.5C19.0045 11.9477 18.5568 11.5 18.0045 11.5C17.4522 11.5 17.0045 11.9477 17.0045 12.5C17.0045 13.0523 17.4522 13.5 18.0045 13.5C18.5568 13.5 19.0045 13.0523 19.0045 12.5ZM13.0045 12.5C13.0045 11.9477 12.5568 11.5 12.0045 11.5C11.4522 11.5 11.0045 11.9477 11.0045 12.5C11.0045 13.0523 11.4522 13.5 12.0045 13.5C12.5568 13.5 13.0045 13.0523 13.0045 12.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  compose: <><path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  folder: <><path d="M8 7H16.75C18.8567 7 19.91 7 20.6667 7.50559C20.9943 7.72447 21.2755 8.00572 21.4944 8.33329C22 9.08996 22 10.1433 22 12.25C22 15.7612 22 17.5167 21.1573 18.7779C20.7926 19.3238 20.3238 19.7926 19.7779 20.1573C18.5167 21 16.7612 21 13.25 21H12C7.28595 21 4.92893 21 3.46447 19.5355C2 18.0711 2 15.714 2 11V7.94427C2 6.1278 2 5.21956 2.38032 4.53806C2.65142 4.05227 3.05227 3.65142 3.53806 3.38032C4.21956 3 5.1278 3 6.94427 3C8.10802 3 8.6899 3 9.19926 3.19101C10.3622 3.62712 10.8418 4.68358 11.3666 5.73313L12 7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path></>,
  integrations: <><path d="M10.5 8.75V6.75C10.5 5.10626 10.5 4.28439 10.046 3.73121C9.96291 3.62995 9.87005 3.53709 9.76879 3.45398C9.21561 3 8.39374 3 6.75 3C5.10626 3 4.28439 3 3.73121 3.45398C3.62995 3.53709 3.53709 3.62995 3.45398 3.73121C3 4.28439 3 5.10626 3 6.75V8.75C3 10.3937 3 11.2156 3.45398 11.7688C3.53709 11.8701 3.62995 11.9629 3.73121 12.046C4.28439 12.5 5.10626 12.5 6.75 12.5C8.39374 12.5 9.21561 12.5 9.76879 12.046C9.87005 11.9629 9.96291 11.8701 10.046 11.7688C10.5 11.2156 10.5 10.3937 10.5 8.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M7.75 15.5H5.75C5.05222 15.5 4.70333 15.5 4.41943 15.5861C3.78023 15.78 3.28002 16.2802 3.08612 16.9194C3 17.2033 3 17.5522 3 18.25C3 18.9478 3 19.2967 3.08612 19.5806C3.28002 20.2198 3.78023 20.72 4.41943 20.9139C4.70333 21 5.05222 21 5.75 21H7.75C8.44778 21 8.79667 21 9.08057 20.9139C9.71977 20.72 10.22 20.2198 10.4139 19.5806C10.5 19.2967 10.5 18.9478 10.5 18.25C10.5 17.5522 10.5 17.2033 10.4139 16.9194C10.22 16.2802 9.71977 15.78 9.08057 15.5861C8.79667 15.5 8.44778 15.5 7.75 15.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M21 17.25V15.25C21 13.6063 21 12.7844 20.546 12.2312C20.4629 12.1299 20.3701 12.0371 20.2688 11.954C19.7156 11.5 18.8937 11.5 17.25 11.5C15.6063 11.5 14.7844 11.5 14.2312 11.954C14.1299 12.0371 14.0371 12.1299 13.954 12.2312C13.5 12.7844 13.5 13.6063 13.5 15.25V17.25C13.5 18.8937 13.5 19.7156 13.954 20.2688C14.0371 20.3701 14.1299 20.4629 14.2312 20.546C14.7844 21 15.6063 21 17.25 21C18.8937 21 19.7156 21 20.2688 20.546C20.3701 20.4629 20.4629 20.3701 20.546 20.2688C21 19.7156 21 18.8937 21 17.25Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M18.25 3H16.25C15.5522 3 15.2033 3 14.9194 3.08612C14.2802 3.28002 13.78 3.78023 13.5861 4.41943C13.5 4.70333 13.5 5.05222 13.5 5.75C13.5 6.44778 13.5 6.79667 13.5861 7.08057C13.78 7.71977 14.2802 8.21998 14.9194 8.41388C15.2033 8.5 15.5522 8.5 16.25 8.5H18.25C18.9478 8.5 19.2967 8.5 19.5806 8.41388C20.2198 8.21998 20.72 7.71977 20.9139 7.08057C21 6.79667 21 6.44778 21 5.75C21 5.05222 21 4.70333 20.9139 4.41943C20.72 3.78023 20.2198 3.28002 19.5806 3.08612C19.2967 3 18.9478 3 18.25 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  project: <><path d="M2.5 20V8.87695C2.5 7.58945 2.5 6.9457 2.78533 6.47048C2.9541 6.18939 3.18939 5.9541 3.47048 5.78533C3.9457 5.5 4.59449 5.5 5.89206 5.5C6.52339 5.5 6.83906 5.5 7.12612 5.58819C7.31759 5.64702 7.49914 5.73428 7.66469 5.84705C7.91289 6.01611 8.10859 6.26074 8.5 6.75C8.89141 7.23926 9.08711 7.48389 9.33531 7.65295C9.50086 7.76572 9.68241 7.85298 9.87388 7.91181C10.1609 8 10.4742 8 11.1008 8H15C16.4045 8 17.1067 8 17.6111 8.33706C17.8295 8.48298 18.017 8.67048 18.1629 8.88886C18.5 9.39331 18.5 10.0955 18.5 11.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M4.42028 14.0144L3.63368 16.0144C2.65618 18.4998 2.16743 19.7425 2.7524 20.6213C3.33737 21.5 4.65337 21.5 7.28537 21.5H15.1903C16.4249 21.5 17.0422 21.5 17.5295 21.1795C18.0169 20.859 18.2702 20.2865 18.7769 19.1415L19.6618 17.1415C20.7866 14.5992 21.349 13.3281 20.7679 12.4141C20.1868 11.5 18.8163 11.5 16.0752 11.5H8.07196C6.78232 11.5 6.1375 11.5 5.63811 11.8439C5.13872 12.1877 4.89924 12.7966 4.42028 14.0144Z" stroke="currentColor" strokeWidth="1.9"></path><path d="M11.5 4.51456C12.4151 3.28409 13.6662 2.55594 15.5125 2.50161C16.1155 2.48386 16.7152 2.61395 17.2682 2.85544C18.5748 3.42601 19.4185 4.15644 20 5.5L21.5 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  close: <><path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  right: <><path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  document: <><path d="M8 17H16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M8 13H12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  profile: <><path d="M20 21.0001C19.713 17.269 16.7289 14.3151 12.995 14.0662L12 13.9999C11.6446 14.0096 11.3134 14.0225 11.0008 14.0378C7.3 14.2192 4.28417 17.3057 4 21.0001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><circle cx="12" cy="6.99988" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></circle></>,
  settings: <><path d="M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9"></path><path d="M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z" stroke="currentColor" strokeWidth="1.9"></path></>,
  help: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></circle><path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  logout: <><path d="M15.5 8.04045C15.4588 6.87972 15.3216 6.15451 14.8645 5.58671C14.2114 4.77536 13.0944 4.52064 10.8605 4.01121L9.85915 3.78286C6.4649 3.00882 4.76777 2.6218 3.63388 3.51317C2.5 4.40454 2.5 6.1257 2.5 9.56803V14.432C2.5 17.8743 2.5 19.5955 3.63388 20.4868C4.76777 21.3782 6.4649 20.9912 9.85915 20.2171L10.8605 19.9888C13.0944 19.4794 14.2114 19.2246 14.8645 18.4133C15.3216 17.8455 15.4588 17.1203 15.5 15.9595" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path><path d="M18.5 9.01172C18.5 9.01172 21.5 11.2212 21.5 12.0117C21.5 12.8023 18.5 15.0117 18.5 15.0117M21 12.0117H8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9"></path></>,
  plus: <path d="M12 4v16M4 12h16" strokeLinecap="round" />,
  check: <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />,
};
export function AppShellIcon({name, size = 16}: {name: keyof typeof glyphs; size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">{glyphs[name]}</svg>;
}

export interface AppShellNavItem { label: string; icon?: ReactNode }
export interface AppShellGroup { label: string; items: AppShellNavItem[] }
export interface AppShellMenuItem { label: string; description?: string; icon?: ReactNode; current?: boolean; danger?: boolean; onSelect?: () => void }
export interface AppShellFlatProps {
  workspace: string;
  user: { name: string; avatar?: string };
  nav: AppShellNavItem[];
  projects?: string[];
  groups?: AppShellGroup[];
  active?: string;
  onNavigate?: (label: string) => void;
  header?: { title: ReactNode; actions?: ReactNode; onTitleClick?: () => void } | false;
  workspaceMenu?: AppShellMenuItem[];
  profileMenu?: AppShellMenuItem[];
  sidebarFooter?: ReactNode;
  children?: ReactNode;
  onSearch?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export function AppShellFlat({workspace, user, nav, projects = [], groups, active, onNavigate, header,
  workspaceMenu, profileMenu, sidebarFooter, children, onSearch, onShare, onMore,
  defaultCollapsed = false, onCollapsedChange, className = ''}: AppShellFlatProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches);
  const [width, setWidth] = useState(272);
  const [dragging, setDragging] = useState(false);
  const [menu, setMenu] = useState<'workspace' | 'profile' | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const workspaceButton = useRef<HTMLButtonElement>(null);
  const profileButton = useRef<HTMLButtonElement>(null);
  const sideId = useId();
  const hidden = narrow ? !drawerOpen : collapsed;
  const hasHeader = header !== false;
  const title = header && header.title !== undefined ? header.title : active;
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const update = () => { setNarrow(mq.matches); setDrawerOpen(false); };
    mq.addEventListener('change', update); return () => mq.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!menu && !drawerOpen) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (drawerOpen) { setMenu(null); setDrawerOpen(false); opener.current?.focus(); }
      else if (menu) { (menu === 'workspace' ? workspaceButton : profileButton).current?.focus(); setMenu(null); }
    };
    const outside = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('.asf-menu-anchor')) setMenu(null);
    };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [menu, drawerOpen]);
  function toggle() {
    setMenu(null);
    if (narrow) {setDrawerOpen(v => !v);requestAnimationFrame(() => (drawerOpen ? opener : workspaceButton).current?.focus());}
    else { setCollapsed(!collapsed); onCollapsedChange?.(!collapsed); }
  }
  function navigate(label: string) { onNavigate?.(label); if (narrow) setDrawerOpen(false); setMenu(null); }
  function focusMenu(kind: 'workspace' | 'profile', last: boolean) {
    setMenu(kind);
    requestAnimationFrame(() => {
      const items = root.current?.querySelectorAll<HTMLButtonElement>(`.asf-menu--${kind} [role="menuitem"]`);
      if (items?.length) items[last ? items.length - 1 : 0].focus();
    });
  }
  function menuView(items: AppShellMenuItem[], kind: 'workspace' | 'profile') {
    return <div className={`asf-menu asf-menu--${kind}`} role="menu" aria-label={kind === 'workspace' ? 'Workspaces' : 'Account'}
      onKeyDown={e => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
        const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        e.preventDefault(); items[next]?.focus();
      }}>
      {kind === 'workspace' && <div className="asf-menu-title">Workspaces</div>}
      <div className="asf-menu-list">{items.map(item => <button type="button" role="menuitem" key={item.label}
        className={`asf-menu-item ${item.description ? 'asf-menu-item--description' : ''} ${item.danger ? 'asf-menu-item--danger' : ''}`}
        onClick={() => { item.onSelect?.(); setMenu(null); }}>
        {item.icon}<span className="asf-menu-label"><span>{item.label}</span>{item.description && <small>{item.description}</small>}</span>
        {item.current && <AppShellIcon name="check" size={14} />}
      </button>)}</div>
    </div>;
  }
  const sideTools = <><button type="button" className="asf-icon-button" aria-label="Search" onClick={onSearch}><AppShellIcon name="search" /></button>
    <button type="button" className="asf-icon-button" aria-label={narrow ? "Close sidebar" : "Collapse sidebar"} aria-controls={sideId} onClick={toggle}><AppShellIcon name="sidebar" /></button></>;
  const items = (list: AppShellNavItem[]) => list.map(item => <button type="button" className="asf-nav-item" key={item.label}
    aria-current={active === item.label ? 'page' : undefined} onClick={() => navigate(item.label)}>{item.icon}<span>{item.label}</span></button>);
  return <div ref={root} className={`app-shell-flat ${className}`} data-capture-root data-collapsed={collapsed} data-drawer={drawerOpen} data-header={hasHeader} data-dragging={dragging}
    style={{'--asf-side-width': `${width}px`} as CSSProperties}>
    <button ref={opener} type="button" className="asf-icon-button asf-open" aria-label="Open sidebar" aria-controls={sideId} aria-expanded={!hidden} onClick={toggle}><AppShellIcon name="sidebar" /></button>
    <div className="asf-scrim" aria-hidden="true" onClick={() => {setDrawerOpen(false);opener.current?.focus();}} />
    {hasHeader && <>
      <div className="asf-bar asf-side-bar" inert={hidden}>
        <button type="button" className="asf-icon-button" aria-label="Collapse sidebar" aria-controls={sideId} onClick={toggle}><AppShellIcon name="sidebar" /></button>
        <button type="button" className="asf-icon-button" aria-label="Search" onClick={onSearch}><AppShellIcon name="search" /></button>
      </div>
      <header className="asf-main-bar" inert={narrow && drawerOpen}><button type="button" className="asf-title" onClick={header ? header.onTitleClick : undefined}><span>{title}</span><AppShellIcon name="chevron" size={13} /></button>
        <div className="asf-header-actions">{header && header.actions !== undefined ? header.actions : <>
          <button type="button" className="asf-icon-button" aria-label="Share" onClick={onShare}><AppShellIcon name="share" /></button>
          <button type="button" className="asf-icon-button" aria-label="More" onClick={onMore}><AppShellIcon name="more" /></button>
        </>}</div>
      </header>
    </>}
    <aside id={sideId} className="asf-sidebar" aria-label="Sidebar" inert={hidden}>
      <div className="asf-sidebar-head"><div className="asf-menu-anchor">
        <button type="button" ref={workspaceButton} onKeyDown={e => {if (e.key === "ArrowDown" || e.key === "ArrowUp") {e.preventDefault();focusMenu("workspace",e.key === "ArrowUp");}}} className="asf-workspace" aria-haspopup="menu" aria-expanded={menu === 'workspace'} onClick={() => setMenu(menu === 'workspace' ? null : 'workspace')}>
          <span className="asf-workspace-logo">{workspace.slice(0, 1)}</span><span>{workspace}</span><AppShellIcon name="chevron" size={13} />
        </button>{menu === 'workspace' && workspaceMenu && menuView(workspaceMenu, 'workspace')}
      </div><div className="asf-side-tools">{sideTools}</div></div>
      <nav className="asf-nav" aria-label="Main navigation"><div className="asf-nav-group">{items(nav)}</div>
        {(groups ?? (projects.length ? [{label:'Projects',items: projects.map(label => ({label, icon:<AppShellIcon name="project"/>}))}] : [])).map(group => <div className="asf-nav-group" key={group.label}><div className="asf-nav-label">{group.label}</div>{items(group.items)}</div>)}
      </nav>
      <div className="asf-footer">{sidebarFooter}<div className="asf-menu-anchor asf-user-anchor">
        <button type="button" ref={profileButton} onKeyDown={e => {if (e.key === "ArrowDown" || e.key === "ArrowUp") {e.preventDefault();focusMenu("profile",e.key === "ArrowUp");}}} className="asf-user" aria-haspopup="menu" aria-expanded={menu === 'profile'} onClick={() => setMenu(menu === 'profile' ? null : 'profile')}>
          {user.avatar ? <img className="asf-avatar" src={user.avatar} alt="" /> : <span className="asf-avatar">{user.name.split(/\s+/).map(s => s[0]).slice(0, 2).join('')}</span>}
          <span>{user.name}</span><AppShellIcon name="chevron" size={13} />
        </button>{menu === 'profile' && profileMenu && menuView(profileMenu, 'profile')}
      </div></div>
    </aside>
    <main className="asf-main" inert={narrow && drawerOpen}>{children}</main>
    <div className="asf-resizer" role="separator" tabIndex={hidden || narrow ? -1 : 0} aria-label="Sidebar width" aria-orientation="vertical" aria-valuemin={220} aria-valuemax={380} aria-valuenow={width}
      onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {e.preventDefault(); setWidth(w => Math.max(220, Math.min(380,w + (e.key === 'ArrowRight' ? 10 : -10))));} }}
      onPointerDown={e => {e.currentTarget.setPointerCapture(e.pointerId); setDragging(true);}}
      onPointerMove={e => {if (dragging) setWidth(Math.max(220, Math.min(380,e.clientX - (root.current?.getBoundingClientRect().left ?? 0))));}}
      onPointerUp={e => {e.currentTarget.releasePointerCapture(e.pointerId);setDragging(false);}} onLostPointerCapture={() => setDragging(false)} />
  </div>;
}
export default AppShellFlat;
