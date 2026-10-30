'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import './block-settings-members2.css';
export type WorkspaceRole = 'Owner' | 'Editor' | 'Viewer';
export interface WorkspaceMember { id: string; name: string; email: string; role: WorkspaceRole; avatarUrl?: string }
export interface BlockSettingsMembers2Props {
  members: WorkspaceMember[];
  title?: string;
  description?: ReactNode;
  onRoleChange: (id: string, role: WorkspaceRole) => void;
  onRemove: (id: string) => void;
  onTransferOwnership: (id: string) => void;
  onInvite: (invitation: { email: string; role: WorkspaceRole }) => void | Promise<void>;
  onPermissionsHelp?: () => void;
  className?: string;
}
function Symbol({ kind }: {kind: 'search'|'down'|'more'|'check'|'close'|'return'}) {
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='search'?<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>:kind==='down'?<path d="m6 9 6 6 6-6"/>:kind==='more'?<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>:kind==='check'?<path d="m4 12 5 5L20 6"/>:kind==='close'?<path d="m6 6 12 12M6 18 18 6"/>:<path d="M9 10 4 15l5 5M20 4v7a4 4 0 0 1-4 4H4"/>}</svg>;
}
const roles: WorkspaceRole[] = ['Owner','Editor','Viewer'];
function RoleSelect({value,onChange,label}:{value:WorkspaceRole;onChange:(value:WorkspaceRole)=>void;label:string}) {
 const reduced=useReducedMotion();const [open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);const id=useId();
 useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[open]);
 function close(){setOpen(false);trigger.current?.focus()}
 return <div ref={ref} className="sm2-select" onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();close()}if(open&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const bs=[...ref.current!.querySelectorAll<HTMLButtonElement>('[role=option]')];const i=bs.indexOf(document.activeElement as HTMLButtonElement);bs[e.key==='Home'?0:e.key==='End'?bs.length-1:(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length]?.focus()}}}>
 <button ref={trigger} type="button" role="combobox" aria-label={label} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)} onKeyDown={e=>{if(e.key==='ArrowDown'&&!open){e.preventDefault();setOpen(true)}}}>{value}<Symbol kind="down"/></button>
 <AnimatePresence>{open&&<motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.95}} transition={{duration:reduced?0:.1}} id={id} role="listbox" className="sm2-role-menu" style={{top:-roles.indexOf(value)*32-4}}>{roles.map(role=><button type="button" key={role} role="option" aria-selected={role===value} autoFocus={role===value} onClick={()=>{onChange(role);close()}}>{role}{role===value&&<Symbol kind="check"/>}</button>)}</motion.div>}</AnimatePresence>
 </div>;
}
export function BlockSettingsMembers2({members,title='Workspace Members',description='Add teammates to collaborate on projects together. Control permissions and manage access levels for each member.',onRoleChange,onRemove,onTransferOwnership,onInvite,onPermissionsHelp,className=''}:BlockSettingsMembers2Props){
 const reduced=useReducedMotion();const [query,setQuery]=useState('');const [menu,setMenu]=useState<string|null>(null);const [email,setEmail]=useState('');const [role,setRole]=useState<WorkspaceRole>('Editor');const [pending,setPending]=useState(false);const [error,setError]=useState('');const dialog=useRef<HTMLDialogElement>(null);const root=useRef<HTMLElement>(null);const invite=useRef<HTMLButtonElement>(null);const dialogTitle=useId();
 const visible=members.filter(m=>`${m.name} ${m.email}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 useEffect(()=>{if(!menu)return;const dismiss=(e:PointerEvent)=>{if(!(e.target as Element).closest('.sm2-action'))setMenu(null)};document.addEventListener('pointerdown',dismiss);return()=>document.removeEventListener('pointerdown',dismiss)},[menu]);
 const closeInvite=()=>{dialog.current?.close();invite.current?.focus({preventScroll:true})};
 async function submit(e:React.FormEvent){e.preventDefault();setPending(true);setError('');try{await onInvite({email:email.trim(),role});closeInvite()}catch(e){setError(e instanceof Error?e.message:'Unable to send invitation.')}finally{setPending(false)}}
 return <section ref={root} className={`block-settings-members2 ${className}`} data-capture-root>
 <h3>{title}</h3><p className="sm2-description">{description} <a href="#permissions" onClick={e=>{e.preventDefault();onPermissionsHelp?.()}}>View member permissions guide</a></p>
 <div className="sm2-toolbar"><label className="sm2-search"><Symbol kind="search"/><input aria-label="Search members" placeholder="Search" value={query} onChange={e=>setQuery(e.target.value)}/></label><button ref={invite} type="button" className="sm2-primary" onClick={()=>{setEmail('');setRole('Editor');setError('');dialog.current?.showModal();dialog.current?.querySelector('input')?.focus({preventScroll:true})}}>Invite Member</button></div>
 <p className="sm2-count" aria-live="polite">{visible.length} members</p>
 <div className="sm2-list">{visible.map(member=><div className="sm2-row" key={member.id} data-member-id={member.id}><div className="sm2-person"><span className="sm2-avatar">{member.name[0]}{member.avatarUrl&&<img src={member.avatarUrl} alt={member.name}/>}</span><div><p>{member.name}</p><p className="sm2-email">{member.email}</p></div></div><RoleSelect label={`Role for ${member.name}`} value={member.role} onChange={v=>onRoleChange(member.id,v)}/><div className="sm2-action"><button type="button" className="sm2-more" aria-label="Open menu" aria-expanded={menu===member.id} onClick={()=>setMenu(menu===member.id?null:member.id)}><Symbol kind="more"/></button><AnimatePresence>{menu===member.id&&<motion.div initial={{opacity:0,y:-8,scale:.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:.95}} transition={{duration:reduced?0:.1}} className="sm2-action-menu" role="menu" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setMenu(null);(e.currentTarget.previousElementSibling as HTMLButtonElement)?.focus()}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const buttons=[...e.currentTarget.querySelectorAll('button')];buttons[(buttons.indexOf(document.activeElement as HTMLButtonElement)+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus()}}}><button type="button" role="menuitem" autoFocus onClick={()=>{onTransferOwnership(member.id);setMenu(null)}}>Transfer ownership</button><button type="button" role="menuitem" onClick={()=>{onRemove(member.id);setMenu(null)}}>Remove from team</button></motion.div>}</AnimatePresence></div></div>)}</div>
 <dialog ref={dialog} className="sm2-dialog" aria-labelledby={dialogTitle} onCancel={e=>{e.preventDefault();closeInvite()}} onClick={e=>{if(e.target===dialog.current)closeInvite()}}><div className="sm2-dialog-content"><h2 id={dialogTitle}>Invite Team Member</h2><button type="button" className="sm2-close" aria-label="Close" onClick={closeInvite}><Symbol kind="close"/></button><form onSubmit={submit}><div className="sm2-fields"><label>Email address<input type="email" required autoFocus placeholder="name@yourcompany.com" value={email} onChange={e=>setEmail(e.target.value)}/></label><div className="sm2-field"><span>Select role</span><RoleSelect label="Select role" value={role} onChange={setRole}/></div>{error&&<p role="alert">{error}</p>}</div><footer><button className="sm2-primary" disabled={pending} type="submit">{pending?'Sending…':'Send Invitation'}<Symbol kind="return"/></button></footer></form></div></dialog>
 </section>;
}
export default BlockSettingsMembers2;
