import type { NotchCard, Person } from '../component/FluidNotch';
const person = (name: string, n: number): Person => ({ name, src: `/assets/avatar-${n}.webp` });
export const people = [person('Priya Shah', 2), person('Tomas Berg', 1), person('Ada Okafor', 6)];
export const questions: NotchCard[] = [
  { id: 'launch-day', title: 'Move the launch to Thursday?', description: 'Two reviewers are out on Wednesday. Thursday keeps the whole team on the release call.', people: [person('Tomas Berg', 1), person('Nina Varga', 7)], context: 'Tomas and Nina are out Wednesday', actions: [{ id: 'keep', label: 'Keep Wednesday' }, { id: 'move', label: 'Move it', primary: true }] },
  { id: 'reviewer', title: 'Add Priya to the review?', description: 'She wrote the pricing copy and can answer questions on it fast.', people: [person('Priya Shah', 2)], context: 'Priya Shah · Pricing', actions: [{ id: 'skip-reviewer', label: 'Not now' }, { id: 'add', label: 'Add Priya', primary: true }] },
  { id: 'qa', title: 'Tell you when QA signs off?', description: "I'll watch the release checklist and post in #launch the moment it turns green.", people: [person('Daniel Cho', 3), person('Leo Marsh', 4), person('Ada Okafor', 6)], morePeople: 1, context: 'QA · 4 people', actions: [{ id: 'skip-qa', label: 'Not now' }, { id: 'enable', label: 'Turn on', primary: true }] },
];
export const complete: NotchCard = { id: 'complete', title: "You're all caught up", description: 'Nothing else needs you before the launch.', people, morePeople: 2, context: 'Priya, Tomas and 3 more', actions: [{ id: 'restart', label: 'Start over', primary: true }] };
