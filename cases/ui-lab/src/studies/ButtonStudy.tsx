'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, type ButtonAppearance } from '../components/button';
import './button-study.css';

type IconName = 'plus' | 'arrow' | 'more' | 'copy' | 'upload' | 'check' | 'trash';

function Icon({ name }: { name: IconName }) {
  // Paths observed in the official preview rendered SVG, not component source.
  const paths: Record<IconName, ReactNode> = {
    trash: <><path d="m19.5 5.5-.62 10.03c-.16 2.56-.24 3.84-.88 4.76a4 4 0 0 1-1.2 1.13C15.84 22 14.56 22 12 22s-3.86 0-4.82-.59a4 4 0 0 1-1.2-1.13c-.64-.92-.72-2.2-.88-4.76L4.5 5.5" /><path d="M3 5.5h18M16.06 5.5l-.69-1.41c-.45-.94-.68-1.4-1.07-1.7a2 2 0 0 0-.27-.17C13.6 2 13.07 2 12.03 2c-1.06 0-1.6 0-2.04.23a2 2 0 0 0-.27.18c-.4.3-.62.79-1.06 1.76L8.05 5.5M9.5 16.5v-6M14.5 16.5v-6" /></>,
    plus: <><path d="M12 4v16M20 12H4" /></>,
    arrow: <><path d="M18.5 12H5" /><path d="M13 18s6-4.42 6-6-6-6-6-6" /></>,
    more: <><path d="M6 12h.01M12 12h.01M18 12h.01" /></>,
    copy: <><path d="M7.5 14.5c0-3.3 0-4.95 1.03-5.97C9.55 7.5 11.2 7.5 14.5 7.5s4.95 0 5.97 1.03c1.03 1.02 1.03 2.67 1.03 5.97s0 4.95-1.03 5.97c-1.02 1.03-2.67 1.03-5.97 1.03s-4.95 0-5.97-1.03C7.5 19.45 7.5 17.8 7.5 14.5Z" /><path d="M7.5 16.5c-1.4 0-2.1 0-2.66-.2a3 3 0 0 1-2.14-2.14c-.2-.57-.2-1.27-.2-2.66v-2c0-3.3 0-4.95 1.03-5.97C4.55 2.5 6.2 2.5 9.5 2.5h2c1.4 0 2.1 0 2.66.2a3 3 0 0 1 2.14 2.14c.2.57.2 1.27.2 2.66" /></>,
    upload: <><path d="M16.5 7.5S13.19 3 12 3 7.5 7.5 7.5 7.5M12 4v11" /><path d="M3 16.5v1.5A3 3 0 0 0 6 21h12a3 3 0 0 0 3-3v-1.5" /></>,
    check: <><path d="M5.5 12.5l4 4L18.5 8" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === 'more' ? 2.5 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ButtonExamples({ appearance, theme, reduceMotion }: {
  appearance: ButtonAppearance;
  theme: 'light' | 'dark';
  reduceMotion: boolean;
}) {
  const [copied, setCopied] = useState({ label: false, icon: false });
  const [upload, setUpload] = useState<'idle' | 'loading' | 'done'>('idle');
  const timers = useRef<Partial<Record<'label' | 'icon' | 'upload', ReturnType<typeof setTimeout>>>>({});
  useEffect(() => {
    const active = timers.current;
    return () => Object.values(active).forEach(clearTimeout);
  }, []);

  function copy(which: 'label' | 'icon') {
    clearTimeout(timers.current[which]);
    setCopied(current => ({ ...current, [which]: true }));
    timers.current[which] = setTimeout(() => {
      setCopied(current => ({ ...current, [which]: false }));
    }, 1600);
  }

  function uploadFile() {
    clearTimeout(timers.current.upload);
    setUpload('loading');
    timers.current.upload = setTimeout(() => setUpload('done'), 1800);
  }

  const shared = { appearance, reduceMotion, 'data-theme': theme, type: 'button' as const };
  return <div className="button-study__showcase" data-testid="button-showcase" data-appearance={appearance}>
    <section className="button-study__group" aria-label="Styles">
      <h3>Styles</h3>
      <div className="button-study__row">
        <Button {...shared}>Save changes</Button>
        <Button {...shared} variant="secondary">Secondary</Button>
        <Button {...shared} variant="ghost">Ghost</Button>
        <Button {...shared} variant="destructive" icon={<Icon name="trash" />}>Delete</Button>
      </div>
    </section>
    <section className="button-study__group" aria-label="Icons and sizes">
      <h3>Icons and sizes</h3>
      <div className="button-study__row">
        <Button {...shared} variant="secondary" size="sm" icon={<Icon name="plus" />}>Add item</Button>
        <Button {...shared} iconRight={<Icon name="arrow" />}>Continue</Button>
        <Button {...shared} variant="ghost" icon={<Icon name="more" />} aria-label="More options" />
        <Button {...shared} variant="secondary" size="lg">Large</Button>
      </div>
    </section>
    <section className="button-study__group" aria-label="Feedback and states">
      <h3>Feedback and states</h3>
      <div className="button-study__row">
        <Button {...shared} variant="secondary" icon={<Icon name={copied.label ? 'check' : 'copy'} />}
          onClick={() => copy('label')} data-testid="button-copy-link">
          {copied.label ? 'Copied' : 'Copy link'}
        </Button>
        <Button {...shared} variant="secondary" icon={<Icon name={copied.icon ? 'check' : 'copy'} />}
          aria-label={copied.icon ? 'Copied' : 'Copy'} onClick={() => copy('icon')} data-testid="button-copy-icon" />
        <Button {...shared} variant="secondary" loading={upload === 'loading'}
          icon={<Icon name={upload === 'done' ? 'check' : 'upload'} />} onClick={uploadFile}
          data-testid="button-upload">Upload file</Button>
        <Button {...shared} variant="secondary" disabled>Disabled</Button>
      </div>
      <p className="button-study__status" role="status" aria-live="polite">
        {upload === 'loading' ? 'Uploading...' : upload === 'done' ? 'Upload complete' : '\u00a0'}
      </p>
      <span className="button-study__sr-only" role="status">{copied.label || copied.icon ? 'Copied' : ''}</span>
    </section>
  </div>;
}

export function ButtonStudy() {
  const [appearance, setAppearance] = useState<ButtonAppearance>('classic');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reset, setReset] = useState(0);

  return <section className="button-study" aria-label="Button study">
    <header className="button-study__heading">
      <div><p className="button-study__eyebrow">AFFECTUI / BUTTON</p><h2>Button</h2></div>
      <p>四种变体，三种尺寸，点击后的细微反馈。</p>
    </header>
    <div className="button-study__toolbar">
      <fieldset className="button-study__choices">
        <legend>Style</legend>
        {(['classic', 'clean'] as const).map(value => <label key={value}>
          <input type="radio" name="button-study-style" value={value} checked={appearance === value} onChange={() => setAppearance(value)} />
          <span>{value === 'classic' ? 'Classic' : 'Clean'}</span>
        </label>)}
      </fieldset>
      <fieldset className="button-study__choices">
        <legend>Theme</legend>
        {(['light', 'dark'] as const).map(value => <label key={value}>
          <input type="radio" name="button-study-theme" value={value} checked={theme === value} onChange={() => setTheme(value)} />
          <span>{value === 'light' ? 'Light' : 'Dark'}</span>
        </label>)}
      </fieldset>
      <label className="button-study__reduce"><input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)} />减少动态</label>
      <button className="button-study__reset" type="button" onClick={() => setReset(value => value + 1)} aria-label="Reset preview">↺ Reset</button>
    </div>
    <div className="button-study__comparison">
      <figure className="button-study__panel">
        <figcaption><span>原版采集</span><span>{appearance === 'classic' ? 'Classic' : 'Clean'} / {theme === 'light' ? 'Light' : 'Dark'}</span></figcaption>
        <div className="button-study__reference" data-theme={theme}>
          <img src={`/evidence/button/reference/${appearance}-${theme}.jpg`} alt={`AffectUI Button ${appearance} ${theme} 参考截图`} width="480" height="330" />
        </div>
      </figure>
      <div className="button-study__panel">
        <div className="button-study__panel-title"><span>复刻 · 可交互</span><span>Copy link / Upload file</span></div>
        <div className="button-study__live" data-theme={theme} data-appearance={appearance} data-testid="button-live-stage">
          <ButtonExamples key={`${appearance}-${theme}-${reset}`} appearance={appearance} theme={theme} reduceMotion={reduceMotion} />
        </div>
      </div>
    </div>
    <p className="button-study__caption">点击 Copy link 或 Upload file 查看反馈；复制与上传均为本地状态演示。</p>
  </section>;
}

export default ButtonStudy;
