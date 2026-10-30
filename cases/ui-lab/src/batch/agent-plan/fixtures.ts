import type {AgentPlanSnapshot, AgentPlanTodo} from '../../components/agent-plan';

// Visual study fixtures. The production component owns no snapshot state.
const contents = [
  'Pull Q3 revenue and ARR',
  'Summarize product launches',
  'Build the KPI slides',
  'Draft the board memo',
  'Send the draft to Maya for review',
] as const;

const makeTodos = (statuses: readonly string[]): readonly AgentPlanTodo[] => Object.freeze(contents.map((content, index) => Object.freeze({
  id: `todo-${index + 1}`, content, status: statuses[index] ?? 'pending',
  ...(statuses[index] === 'in_progress' ? {activeForm: ['Pulling Q3 revenue and ARR', 'Summarizing product launches', 'Building the KPI slides', 'Drafting the board memo', 'Preparing the draft for review'][index]} : {}),
})));

export const snapshots: Readonly<Record<string, AgentPlanSnapshot>> = Object.freeze({
  pending: Object.freeze({sourceVersion: 'fixture-1', round: 1, todos: makeTodos([])}),
  active: Object.freeze({sourceVersion: 'fixture-2', round: 1, todos: makeTodos(['completed', 'in_progress'])}),
  updated: Object.freeze({sourceVersion: 'fixture-3', round: 2, todos: makeTodos(['completed', 'completed', 'completed', 'in_progress'])}),
  complete: Object.freeze({sourceVersion: 'fixture-4', round: 2, todos: makeTodos(contents.map(() => 'completed'))}),
  unknown: Object.freeze({sourceVersion: 'fixture-5', round: 3, todos: Object.freeze([
    Object.freeze({id: 'waiting', content: 'Wait for the source to publish its next snapshot', status: 'awaiting_review'}),
    Object.freeze({id: 'upstream-error', content: 'Keep the source status exactly as supplied', status: 'error'}),
    Object.freeze({id: 'next', content: 'Continue after the external review', status: 'pending'}),
  ])}),
  empty: Object.freeze({sourceVersion: 'fixture-6', round: 4, todos: Object.freeze([])}),
  long: Object.freeze({sourceVersion: 'fixture-with-a-long-external-version-name', round: 5, todos: Object.freeze([
    Object.freeze({id: 'long', content: '核对当前快照中的收入记录、季度报告和需要后续确认的上下文，再由调用方提供新的 TodoWrite 快照。', status: 'in_progress', activeForm: '正在核对调用方提供的记录与上下文；此文字直接来自 activeForm。'}),
    Object.freeze({id: 'long-status', content: 'Preserve unknown status text and a long upstream identifier without widening the card.', status: 'awaiting_external_source_review_without_a_deadline'}),
  ])}),
  reordered: Object.freeze({sourceVersion: 'fixture-7', round: 6, todos: Object.freeze([...makeTodos(['completed', 'completed', 'pending'])].reverse().slice(0, 3))}),
});

export const fixtureChoices = [
  ['pending', 'Pending snapshot'], ['active', 'Active snapshot'], ['updated', 'Next snapshot'],
  ['complete', 'Completed snapshot'], ['unknown', 'Unknown status'], ['empty', 'Empty snapshot'],
  ['long', 'Long content'], ['reordered', 'Changed list'],
] as const;
