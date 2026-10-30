import inventory from '../notes/affectui-inventory.json';
import previewCaptures from '../notes/component-preview-capture.json';
import './catalog.css';

const sections = ['components', 'screens', 'blocks', 'illustrations', 'motion'];
const statusLabels: Record<string, string> = { 'not-started': '参考', partial: '已有试验', verified: '已对照验收' };
const localRoutes: Record<string, string> = { 'segmented-control': '/', 'otp-input': '/otp-input', button: '/button', 'thinking-loader': '/thinking-loader', 'usage-meter': '/usage-meter', 'autonomy-dial': '/autonomy-dial' };
const previewUrls = new Map(previewCaptures.filter(item => item.status === 'saved').map(item => [item.slug, item.imageUrl]));

export function Catalog() {
  return <main className="catalog-page">
    <p className="catalog-eyebrow">AFFECTUI / RECONSTRUCTION INDEX</p>
    <h1>组件参考索引。</h1>
    <p className="catalog-description">保留 {inventory.observedDate} 观察到的 {inventory.items.length} 个目录条目。本轮选取三个 Pro 样本测试 skill，查看 <a href="/pro-tests">Pro 能力试验 →</a>。</p>
    <div className="catalog-links"><a href="https://www.affectui.com/components" target="_blank" rel="noreferrer">官网目录 ↗</a><a href="/skill/SKILL.md" target="_blank">查看逆向 skill ↗</a><a href="/skill/references/effects-catalog.md" target="_blank">效果参考目录 ↗</a></div>
    {sections.map(section => <section key={section} className="catalog-section">
      <h2>{section}<span>{inventory.items.filter(item => item.section === section).length}</span></h2>
      <ul>{inventory.items.filter(item => item.section === section).map(item => <li key={item.url}>
        <div><a href={item.url} target="_blank" rel="noreferrer">{item.name}<span className="catalog-external"> ↗</span></a>{item.notes && <p>{item.notes}</p>}</div>
        <div className="catalog-item-actions"><span data-status={item.status}>{statusLabels[item.status]}</span>{previewUrls.has(item.slug) && <a href={previewUrls.get(item.slug)} target="_blank" rel="noreferrer">官方预览 ↗</a>}{item.status !== 'not-started' && localRoutes[item.slug] && <a href={localRoutes[item.slug]}>本地对照 →</a>}</div>
      </li>)}</ul>
    </section>)}
  </main>;
}
