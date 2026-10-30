import { useState, type ReactNode } from 'react';
import { FluidNotch, FluidNotchFiles, FluidNotchMusic, FluidNotchProgress, FluidNotchSections, FluidNotchStatus, type FluidNotchFile } from '../../components/fluid-notch';
import './study.css';

function StudyIcon({ kind }: { kind: 'files' | 'music' | 'status' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind === 'files' ? <><path d="M5 5h9l4 4v11H5zM14 5v4h4M8 2h8l5 5v10"/><path d="M8 13h7m-7 3h5"/></> : kind === 'music' ? <><path d="M9 17V5l10-2v12M9 9l10-2"/><ellipse cx="6" cy="17" rx="3" ry="2"/><ellipse cx="16" cy="15" rx="3" ry="2"/></> : <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>}</svg>;
}
const initialFiles: FluidNotchFile[] = [
  { id: 'notes', name: 'Weekend notes.md', detail: 'Notes · 4 KB' },
  { id: 'board', name: 'North coast.board', detail: 'Board · 12 items' },
  { id: 'guide', name: 'Field guide.pdf', detail: 'Document · 2.4 MB', disabled: true },
];
const questions = [
  { title: 'Move the launch to Thursday?', description: 'Two reviewers are out on Wednesday. Thursday keeps the whole team on the release call.', context: 'Tomas and Nina are out Wednesday', people: ['T', 'N'], secondary: 'Keep Wednesday', primary: 'Move it' },
  { title: 'Add Priya to the review?', description: 'She wrote the pricing copy and can answer questions on it fast.', context: 'Priya Shah · Pricing', people: ['P'], secondary: 'Not now', primary: 'Add Priya' },
  { title: 'Tell you when QA signs off?', description: "I’ll watch the release checklist and post in #launch the moment it turns green.", context: 'QA · 4 people', people: ['P', 'T', '+1'], secondary: 'Not now', primary: 'Turn on' },
];
const tracks = [{ title: 'A quiet afternoon', artist: 'Studio session · Sample track', duration: 215 }, { title: 'Morning, slowly', artist: 'Studio session · Sample track', duration: 184 }];
// All state changes below are explicitly local Study fixtures. No media or file services are connected.
export default function Study() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState('files');
  const [files, setFiles] = useState(initialFiles);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(52);
  const [status, setStatus] = useState<'active' | 'complete' | 'error'>('active');
  const [message, setMessage] = useState('Choose a file, track, or status.');
  const [example, setExample] = useState('reference');
  const [disabled, setDisabled] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const reference = example === 'reference';
  const changeOpen = (next: boolean, reason: string) => { setOpen(next); setMessage(`Disclosure ${next ? 'opened' : 'closed'} · ${reason}`); };
  const reset = () => { setOpen(false); setSection('files'); setFiles(initialFiles); setPlaying(false); setTrack(0); setElapsed(52); setStatus('active'); setReviewed(0); setMessage('Fixtures reset.'); };
  const changeTrack = () => { setTrack(n => (n + 1) % tracks.length); setElapsed(0); setMessage('Sample track changed.'); };
  const sections = [
    { id: 'files', label: 'Files', icon: <StudyIcon kind="files"/>, content: <><div className="fn-study__section-caption"><span>Kept close</span><span>{files.length} items</span></div><FluidNotchFiles files={files} onOpen={file => setMessage(`Fixture preview requested: ${file.name}`)} onRemove={file => { setFiles(current => current.filter(item => item.id !== file.id)); setMessage(`Fixture removed: ${file.name}`); }} emptyContent="Your sample stash is empty."/><div className="fn-study__footnote">The field guide is unavailable in this fixture.</div></> },
    { id: 'music', label: 'Music', icon: <StudyIcon kind="music"/>, content: <FluidNotchMusic {...tracks[track]} playing={playing} elapsed={elapsed} artwork={<div className={`fn-study__cover fn-study__cover--${track}`}><span/><i/></div>} onPlayPause={() => { setPlaying(value => !value); setMessage('Local play/pause fixture · no audio is playing.'); }} onPrevious={changeTrack} onNext={changeTrack} onSeek={value => { setElapsed(value); setMessage(`Sample position: ${value}s`); }}/> },
    { id: 'status', label: 'Status', icon: <StudyIcon kind="status"/>, content: <FluidNotchStatus state={status} progress={status === 'active' ? 64 : status === 'complete' ? 100 : undefined} title={status === 'active' ? 'Collecting your thoughts' : status === 'complete' ? 'Everything is in place' : 'Couldn’t finish this time'} description={status === 'active' ? 'A controlled progress example. Nothing runs in the background.' : status === 'complete' ? 'The sample completion state is ready to inspect.' : 'A sample failure. Your items stay available.'} action={<div className="fn-study__status-actions">{status === 'active' ? <><button type="button" onClick={() => setStatus('complete')}>Simulate finish</button><button type="button" onClick={() => setStatus('error')}>Simulate error</button></> : <button type="button" onClick={() => setStatus('active')}>Reset status</button>}</div>}/> },
  ];
  const complete = reviewed === questions.length;
  const question = questions[reviewed];
  const answer = () => { setReviewed(value => Math.min(value + 1, questions.length)); setOpen(false); setMessage('Local review fixture advanced.'); };
  const referenceContent: ReactNode = complete ? <div className="fn-study__reference"><h3>You're all caught up</h3><p>Nothing else needs you before the launch.</p><div className="fn-study__people"><span>P</span><span>T</span><span>+2</span><small>Priya, Tomas and 3 more</small></div><div className="fn-study__answers"><button type="button" onClick={() => { setReviewed(0); setOpen(false); setMessage('Full three-question fixture reset.'); }}>Start over</button></div></div> : <div className="fn-study__reference"><h3>{question.title}</h3><p>{question.description}</p><div className="fn-study__people">{question.people.map(person => <span key={person}>{person}</span>)}<small>{question.context}</small></div><div className="fn-study__answers"><button type="button" onClick={answer}>{question.secondary}</button><button type="button" onClick={answer}>{question.primary}</button></div></div>;
  return <div className="fn-study"><div className="fn-study__toolbar"><label>Example <select value={example} onChange={event => { reset(); setExample(event.target.value); }}><option value="menufold">MenuFold stash</option><option value="reference">Source geometry study</option></select></label><label className="fn-study__disable"><input type="checkbox" checked={disabled} onChange={event => { setOpen(false); setDisabled(event.target.checked); }}/>Disabled</label><button type="button" onClick={reset}>Reset fixtures</button></div>
    <div className="fn-study__stage" data-capture-root data-example={example}>
      {!reference && <div className="fn-study__bar"><span>MenuFold</span><span>YOUR LITTLE WORKSPACE</span><span className="fn-study__bar-dots" aria-hidden="true"><i/><i/><i/></span></div>}
      <div className="fn-study__notch"><FluidNotch label={reference ? complete ? 'All caught up' : 'Launch assistant' : 'Your stash'} summary={reference ? <span className="fn-study__compact-people"><span>P</span><span>T</span><span>N</span><span>+2</span></span> : <span>{playing ? 'Playing' : 'Keep it close'}</span>} count={reference ? complete ? undefined : questions.length - reviewed : files.length} expandedSummary={reference && !complete ? <span className="fn-study__review-count">{reviewed + 1} of {questions.length}</span> : undefined} icon={reference ? <FluidNotchProgress value={reviewed / questions.length * 100} complete={complete}/> : <StudyIcon kind={section as 'files' | 'music' | 'status'}/>} open={open} onOpenChange={changeOpen} width={reference ? 340 : 384} compactWidth={reference ? complete ? 222 : 281 : 280} compactHeight={reference ? 40 : 44} expandedRadius={reference ? 26 : 28} className={reference ? 'fn-source-study' : ''} theme={reference ? 'dark' : 'light'} disabled={disabled}>
        {reference ? referenceContent : <FluidNotchSections sections={sections} value={section} onValueChange={setSection}/>}
      </FluidNotch></div>
      {!reference && <div className="fn-study__backdrop" aria-hidden="true"><span>ROOM TO THINK</span><div className="fn-study__paper"><i/><i/><i/><i/></div></div>}
      <div className="fn-study__badge"><i/>Study fixtures · local state only{reference && ' · public preview adaptation'}</div>
    </div>
    <div className="fn-study__status" role="status">{message}</div><p className="fn-study__note">Files, playback and progress are controlled sample data. Play/pause does not start audio. Escape closes the stash and restores focus.</p>
  </div>;
}
