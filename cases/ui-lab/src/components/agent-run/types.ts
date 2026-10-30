import type {ReactNode} from 'react';

export type AgentRunStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'stopped' | 'denied' | 'error';
export type RunStepStatus = 'pending' | 'running' | 'waiting' | 'done' | 'error' | 'skipped';
export type RunCallStatus = 'pending' | 'running' | 'done' | 'error';
export interface RunCall {
  id: string;
  name: string;
  summary: string;
  icon?: ReactNode;
  args?: unknown;
  result?: unknown;
  status: RunCallStatus;
  durationMs: number;
  elapsedMs?: number;
  error?: string;
}
export interface RunApproval {
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  details: {label: string; value: string}[];
  status?: 'pending' | 'approved' | 'denied';
  reason?: string;
}
export interface RunStep {
  id: string;
  title: string;
  detail?: string;
  tool?: string;
  status: RunStepStatus;
  error?: string;
  calls: RunCall[];
  elapsedMs?: number;
  durationMs?: number;
  approval?: RunApproval;
}
export type DraftDecisions = Record<string, 'accepted' | 'rejected'>;
export interface RunDraft {original: string; suggested: string; label?: string; decisions?: DraftDecisions}
export interface RunUser {name: string; avatar?: string}
