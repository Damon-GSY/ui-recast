import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './app.css';

const App = lazy(() => import('./App').then(module => ({ default: module.App })));
const Catalog = lazy(() => import('./Catalog').then(module => ({ default: module.Catalog })));
const OtpInputStudy = lazy(() => import('./studies/OtpInputStudy').then(module => ({ default: module.OtpInputStudy })));
const ButtonStudy = lazy(() => import('./studies/ButtonStudy').then(module => ({ default: module.ButtonStudy })));
const SegmentedControlCases = lazy(() => import('./studies/SegmentedControlCases').then(module => ({ default: module.SegmentedControlCases })));
const ThinkingLoaderStudy = lazy(() => import('./studies/ThinkingLoaderStudy').then(module => ({ default: module.ThinkingLoaderStudy })));
const AgentGraphStudy = lazy(() => import('./studies/AgentGraphStudy').then(module => ({ default: module.AgentGraphStudy })));
const UsageMeterStudy = lazy(() => import('./studies/UsageMeterStudy').then(module => ({ default: module.UsageMeterStudy })));
const AutonomyDialStudy = lazy(() => import('./studies/AutonomyDialStudy').then(module => ({ default: module.AutonomyDialStudy })));
const ApprovalCardStudy = lazy(() => import('./studies/ApprovalCardStudy').then(module => ({ default: module.ApprovalCardStudy })));
const ProTrials = lazy(() => import('./ProTrials').then(module => ({ default: module.ProTrials })));
const BatchStudy = lazy(() => import('./BatchStudy').then(module => ({ default: module.BatchStudy })));

const path = window.location.pathname;
if (path.startsWith('/batch')) document.documentElement.dataset.surface = 'component-gallery';
const routes = [
  { path: '/batch', label: '组件复刻', page: <BatchStudy /> },
  { path: '/pro-tests', label: 'Pro 能力试验', page: <ProTrials /> },
  { path: '/', label: 'Segmented Control', page: <App /> },
  { path: '/otp-input', label: 'OTP Input', page: <OtpInputStudy /> },
  { path: '/button', label: 'Button', page: <ButtonStudy /> },
  { path: '/thinking-loader', label: 'Thinking Loader', page: <ThinkingLoaderStudy /> },
  { path: '/agent-graph', label: 'Agent Graph', page: <AgentGraphStudy /> },
  { path: '/usage-meter', label: 'Usage Meter', page: <UsageMeterStudy /> },
  { path: '/autonomy-dial', label: 'Autonomy Dial', page: <AutonomyDialStudy /> },
  { path: '/approval-card', label: 'Approval Card', page: <ApprovalCardStudy /> },
  { path: '/segmented-control-cases', label: 'Segmented API', page: <SegmentedControlCases /> },
  { path: '/catalog', label: '参考索引', page: <Catalog /> },
];
const current = (path.startsWith('/batch/') ? routes[0] : routes.find(route => route.path === path)) ?? routes[routes.length - 1];
const captureAgentGraph = (path === '/agent-graph' || path.startsWith('/batch/')) && new URLSearchParams(window.location.search).get('capture') === '1';
document.title = `${current.label} · UI Reconstruction Lab`;
createRoot(document.getElementById('root')!).render(<React.StrictMode>
  {!captureAgentGraph && <nav className="study-nav" aria-label="组件研究"><>{routes.map(route => <a key={route.path} href={route.path} aria-current={route === current ? 'page' : undefined}>{route.label}</a>)}</></nav>}
  <Suspense fallback={<p role="status">加载组件演示…</p>}>{current.page}</Suspense>
</React.StrictMode>);
