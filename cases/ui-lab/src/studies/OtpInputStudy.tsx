'use client';

import { useEffect, useRef, useState } from 'react';
import '@fontsource-variable/inter';
import { OtpInput, type OtpInputHandle, type OtpInputVariant, type OtpStatus } from '../components/otp-input';
import './otp-input-study.css';

type DemoProps = {
  variant: OtpInputVariant;
  theme: 'light' | 'dark';
  controlled: boolean;
  reduceMotion: boolean;
};

/** All verification and resend behavior here is local to this demonstration. */
function OtpDemo({ variant, theme, controlled, reduceMotion }: DemoProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [triesLeft, setTriesLeft] = useState(3);
  const [disabled, setDisabled] = useState(false);
  const [clearOnError, setClearOnError] = useState(true);
  const inputRef = useRef<OtpInputHandle>(null);
  const verification = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelVerification() {
    if (verification.current !== null) clearTimeout(verification.current);
    verification.current = null;
  }

  useEffect(() => cancelVerification, []);

  function verify(next: string) {
    cancelVerification();
    setStatus('verifying');
    verification.current = setTimeout(() => {
      verification.current = null;
      if (next === '482913') setStatus('success');
      else {
        setTriesLeft(tries => Math.max(0, tries - 1));
        setStatus('error');
      }
    }, 1000);
  }

  return <>
    <div className="otp-study__stage" data-variant={variant} aria-label="Interactive OTP Input preview">
      <div className={`otp-study__card otp-study__card--${variant}`}>
        <div className="otp-study__card-body">
          <span className="otp-study__mail" aria-hidden="true">
            <svg viewBox={variant === 'clean' ? '0 0 16 16' : '0 0 24 24'} fill="none" stroke="currentColor" strokeWidth={variant === 'clean' ? 1.1 : 1.7} strokeLinecap="round" strokeLinejoin="round">
              {variant === 'clean' ? <><rect x="1.75" y="3.25" width="12.5" height="9.5" rx="2"/><path d="M2.5 4.75l5.5 4 5.5-4"/></> : <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/></>}
            </svg>
          </span>
          <h3 className="otp-study__title">Check your email</h3>
          <p className="otp-study__description">We sent a code to <strong>maya@acme.com</strong></p>
          <OtpInput ref={inputRef} variant={variant} theme={theme} className="otp-study__input"
            {...(controlled ? { value: code } : { defaultValue: '' })}
            onChange={next => {
              setCode(next);
              if (next && status === 'error') setStatus('idle');
            }}
            onComplete={verify} status={status} clearOnError={clearOnError}
            errorMessage={triesLeft > 0 ? `That code didn't work. ${triesLeft} ${triesLeft === 1 ? 'try' : 'tries'} left.`
              : "That code didn't work. Please resend the code."}
            onResend={() => {
              cancelVerification();
              setCode('');
              setTriesLeft(3);
              setStatus('idle');
            }}
            resendIn={30} separator align="center" disabled={disabled} reduceMotion={reduceMotion} />
        </div>
        <p className="otp-study__hint">Demo code: <span>482&nbsp;913</span></p>
      </div>
    </div>
    <details className="otp-study__controls">
      <summary>Interaction controls</summary>
      <div className="otp-study__control-row">
        <label>Status <select aria-label="Preview status" value={status} onChange={event => {
          cancelVerification();
          setStatus(event.target.value as OtpStatus);
        }}>
          <option value="idle">Idle</option>
          <option value="verifying">Verifying</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </select></label>
        <button type="button" onClick={() => {
          cancelVerification();
          setStatus('idle');
          inputRef.current?.clear();
        }}>Clear code</button>
        <button type="button" disabled={disabled || status === 'verifying' || status === 'success'}
          onClick={() => inputRef.current?.focus(0)}>Focus first box</button>
      </div>
      <div className="otp-study__control-row">
        <label><input type="checkbox" checked={clearOnError} onChange={event => setClearOnError(event.target.checked)} />Clear after error</label>
        <label><input type="checkbox" checked={disabled} onChange={event => setDisabled(event.target.checked)} />Disabled</label>
        <output aria-label="Current code">Value: {code || 'empty'}</output>
      </div>
      <p>Local simulation: 482 913 verifies after one second. Other codes show an error. Resend restarts the 30-second countdown.</p>
    </details>
  </>;
}

/** Standalone preview: import and mount this export from the host application's route. */
export function OtpInputStudy() {
  const [variant, setVariant] = useState<OtpInputVariant>('clean');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [controlled, setControlled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reset, setReset] = useState(0);
  return (
    <section className="otp-study" data-theme={theme} aria-label="AffectUI OTP Input study">
      <div className="otp-study__toolbar">
        <fieldset className="otp-study__switch"><legend>Component style</legend>
          {(['classic', 'clean'] as const).map(style => <label key={style}>
            <input type="radio" name="otp-study-style" value={style} checked={variant === style}
              onChange={() => setVariant(style)} />
            <span>{style === 'classic' ? 'Classic' : 'Clean'}</span>
          </label>)}
        </fieldset>
        <fieldset className="otp-study__switch"><legend>Preview theme</legend>
          {(['light', 'dark'] as const).map(choice => <label key={choice}>
            <input type="radio" name="otp-study-theme" value={choice} checked={theme === choice}
              onChange={() => setTheme(choice)} />
            <span>{choice === 'light' ? 'Light' : 'Dark'}</span>
          </label>)}
        </fieldset>
        <button className="otp-study__reset" type="button" onClick={() => setReset(key => key + 1)}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" />
          </svg>Reset preview
        </button>
      </div>
      <OtpDemo key={`${variant}-${controlled}-${reset}`} variant={variant} theme={theme}
        controlled={controlled} reduceMotion={reduceMotion} />
      <div className="otp-study__options">
        <label>Value ownership <select value={controlled ? 'controlled' : 'uncontrolled'}
          onChange={event => setControlled(event.target.value === 'controlled')}>
          <option value="controlled">Controlled</option>
          <option value="uncontrolled">Uncontrolled</option>
        </select></label>
        <label><input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)} />Reduce motion</label>
      </div>
      <details className="otp-study__reference">
        <summary>Original reference</summary>
        <img src={`/evidence/otp-input/reference/${variant}-${theme === 'dark' ? 'dark' : 'idle'}.jpg`}
          width="440" height="330" alt={`Original AffectUI OTP Input, ${variant} style, ${theme} theme`} />
      </details>
    </section>
  );
}
