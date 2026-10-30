'use client';

import {useId, useRef, useState, type ComponentProps, type FormEvent, type ReactNode} from 'react';
import {Questionnaire as Primitive} from '@animate-ui/react/primitives/questionnaire';
import './questionnaire.css';

// Layout/parts adapted from Animate UI v2.4.1's public base-ui questionnaire demo.
// Original files and full license: evidence/integration-supplement/questionnaire/upstream/.
// Animation and headless behavior stay in @animate-ui/react@2.4.1 / @shadcn/react@0.3.1.
export {Primitive as QuestionnairePrimitive};
export type {QuestionnaireItemDefinition, QuestionnaireItemStatus, QuestionnaireShortcutMode} from '@shadcn/react/questionnaire';

export function Questionnaire({className = '', ...props}: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root data-slot="questionnaire" className={`rui-questionnaire ${className}`} {...props}/>;
}
export function QuestionnaireProgress(props: ComponentProps<typeof Primitive.Progress>) {
  return <Primitive.Progress data-slot="questionnaire-progress" {...props}/>;
}
export function QuestionnaireItem(props: ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item data-slot="questionnaire-item" {...props}/>;
}
export function QuestionnaireTitle(props: ComponentProps<typeof Primitive.Title>) {
  return <Primitive.Title data-slot="questionnaire-title" {...props}/>;
}
export function QuestionnaireDescription(props: ComponentProps<typeof Primitive.Description>) {
  return <Primitive.Description data-slot="questionnaire-description" {...props}/>;
}
export function QuestionnaireChoices(props: ComponentProps<typeof Primitive.Choices>) {
  return <Primitive.Choices data-slot="questionnaire-choices" {...props}/>;
}
export function QuestionnaireChoice({children, ...props}: ComponentProps<typeof Primitive.Choice>) {
  return <Primitive.Choice data-slot="questionnaire-choice" {...props}>
    <Primitive.ChoiceInput data-slot="questionnaire-choice-input"/>
    <span aria-hidden="true" data-slot="questionnaire-choice-indicator">
      <span data-slot="questionnaire-choice-indicator-dot"/>
      <svg data-slot="questionnaire-choice-indicator-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 14L8.5 17.5L19 6.5"/></svg>
    </span>
    <Primitive.ChoiceLabel data-slot="questionnaire-choice-label">{children}</Primitive.ChoiceLabel>
    <Primitive.ChoiceShortcut data-slot="questionnaire-choice-shortcut"/>
  </Primitive.Choice>;
}
export function QuestionnaireInput(props: ComponentProps<typeof Primitive.Input>) {
  return <div data-slot="questionnaire-input-wrapper"><Primitive.Input data-slot="questionnaire-input" {...props}/></div>;
}
export function QuestionnaireError(props: ComponentProps<typeof Primitive.Error>) {
  return <Primitive.Error data-slot="questionnaire-error" {...props}/>;
}
export function QuestionnaireActions(props: ComponentProps<'div'>) {
  return <div data-slot="questionnaire-actions" {...props}/>;
}
export function QuestionnairePrevious(props: ComponentProps<typeof Primitive.Previous>) {
  return <Primitive.Previous data-slot="questionnaire-previous" {...props}/>;
}
export function QuestionnaireNext(props: ComponentProps<typeof Primitive.Next>) {
  return <Primitive.Next data-slot="questionnaire-next" {...props}/>;
}
export function QuestionnaireSkip(props: ComponentProps<typeof Primitive.Skip>) {
  return <Primitive.Skip data-slot="questionnaire-skip" {...props}/>;
}
export function QuestionnaireSubmit(props: ComponentProps<typeof Primitive.Submit>) {
  return <Primitive.Submit data-slot="questionnaire-submit" {...props}/>;
}

export type QuestionnaireAnswer = {choices: string[]; text: string; skipped: boolean};
export type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;
export type SequentialQuestion = {
  name: string;
  title: ReactNode;
  description?: ReactNode;
  required?: boolean;
  multiple?: boolean;
  choices?: readonly {value: string; label: ReactNode; description?: ReactNode; disabled?: boolean}[];
  input?: {label: string; placeholder?: string};
};
export type QuestionnaireDraft = {activeQuestion: string; answers: QuestionnaireAnswers};
export type SequentialQuestionnaireProps = {
  questions: readonly SequentialQuestion[];
  answers: QuestionnaireAnswers;
  onAnswersChange: (answers: QuestionnaireAnswers) => void;
  activeQuestion: string;
  onActiveQuestionChange: (name: string) => void;
  onSubmit: (answers: QuestionnaireAnswers, formData: FormData, event: FormEvent<HTMLFormElement>) => void;
  submission?: 'idle' | 'pending' | 'error' | 'success';
  expired?: boolean;
  error?: ReactNode;
  onErrorAcknowledge?: () => void;
  submitLabel?: string;
  className?: string;
};
const emptyAnswer = (): QuestionnaireAnswer => ({choices: [], text: '', skipped: false});
const answered = (question: SequentialQuestion, answer?: QuestionnaireAnswer) => Boolean(answer && (
  (!question.required && answer.skipped) || answer.text.trim() || question.choices?.some(c => !c.disabled && answer.choices.includes(c.value))
));

/** Controlled adapter. The host restores a draft by supplying its answers and activeQuestion.
 * No storage, clock, transport, automatic submission, or acknowledgement is owned here.
 */
export function SequentialQuestionnaire({questions, answers, onAnswersChange, activeQuestion, onActiveQuestionChange,
  onSubmit, submission = 'idle', expired = false, error, onErrorAcknowledge, submitLabel = 'Submit answers', className = '',
}: SequentialQuestionnaireProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const statusId = useId();
  const [attempted, setAttempted] = useState<string | null>(null);
  const index = questions.findIndex(q => q.name === activeQuestion);
  const question = questions[index];
  const last = index === questions.length - 1;
  const blocked = expired || submission === 'pending' || submission === 'success';
  const update = (name: string, value: QuestionnaireAnswer) => {
    setAttempted(null);
    onAnswersChange({...answers, [name]: value});
  };
  const focusInvalid = (name: string) => {
    setAttempted(name);
    if (name !== activeQuestion) onActiveQuestionChange(name);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-question-name="${CSS.escape(name)}"] input`)?.focus());
  };
  const advance = () => {
    if (!question || blocked) return;
    if (!answered(question, answers[question.name])) {focusInvalid(question.name); return;}
    setAttempted(null);
    if (!last) onActiveQuestionChange(questions[index + 1].name);
    else formRef.current?.querySelector<HTMLButtonElement>('[data-slot="questionnaire-submit"]')?.focus();
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    // Native submit capture keeps the primitive's implicit last-step requestSubmit
    // (including Skip) from crossing the host's explicit confirmation boundary.
    event.preventDefault();
    event.stopPropagation();
    if (blocked || submission === 'error') return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (!(submitter instanceof HTMLElement) || submitter.dataset.slot !== 'questionnaire-submit') return;
    const invalid = questions.find(q => !answered(q, answers[q.name]));
    if (invalid) {focusInvalid(invalid.name); return;}
    const data = new FormData(event.currentTarget);
    // Skips intentionally have no successful form control. Keep that intent in
    // the structured answers argument; native FormData keeps get/getAll semantics.
    for (const q of questions) if (answers[q.name]?.skipped) data.delete(q.name);
    onSubmit(answers, data, event);
  };
  return <section className={`rui-questionnaire-shell ${className}`}>
    <Questionnaire ref={formRef} items={questions} item={activeQuestion} onItemChange={name => {if (!blocked) {setAttempted(null); onActiveQuestionChange(name);}}}
      shortcuts="letters" aria-label="Questionnaire" aria-describedby={statusId} aria-busy={submission === 'pending'} inert={blocked}
      onSubmitCapture={submit}
      onKeyDownCapture={event => {
        if (event.nativeEvent.isComposing) return;
        // Enter in an answer advances, then focuses the confirmation button on
        // the last item. Enter/Space on the focused submit button confirms.
        if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
          event.preventDefault(); event.stopPropagation(); if (!event.repeat) advance();
        }
      }}>
      <QuestionnaireProgress/>
      {questions.map(q => {
        const value = answers[q.name] ?? emptyAnswer();
        return <QuestionnaireItem key={q.name} name={q.name} data-question-name={q.name} multiple={q.multiple} required={q.required} invalid={attempted === q.name}>
          <QuestionnaireTitle>{q.title}</QuestionnaireTitle>
          {q.description && <QuestionnaireDescription>{q.description}</QuestionnaireDescription>}
          <QuestionnaireChoices>
            {q.choices?.map(choice => <QuestionnaireChoice key={choice.value} value={choice.value} disabled={choice.disabled}
              checked={!value.skipped && value.choices.includes(choice.value)} onChange={event => {
                const choices = q.multiple ? (event.target.checked ? [...value.choices.filter(v => v !== choice.value), choice.value] : value.choices.filter(v => v !== choice.value)) : [choice.value];
                update(q.name, {choices, text: q.multiple ? value.text : '', skipped: false});
              }}>
              <span className="rui-questionnaire-choice-title">{choice.label}</span>
              {choice.description && <span data-slot="questionnaire-choice-description">{choice.description}</span>}
            </QuestionnaireChoice>)}
            {q.input && <QuestionnaireInput aria-label={q.input.label} placeholder={q.input.placeholder} value={value.text}
              onChange={event => update(q.name, {choices: q.multiple ? value.choices : [], text: event.target.value, skipped: false})}/>}
          </QuestionnaireChoices>
          <QuestionnaireError/>
          {value.skipped && <p className="rui-questionnaire-skipped">Skipped. You can still answer this question.</p>}
        </QuestionnaireItem>;
      })}
      <QuestionnaireActions>
        <QuestionnairePrevious/>
        <QuestionnaireSkip onClick={event => {
          event.preventDefault();
          if (!question || question.required || blocked) return;
          update(question.name, {...emptyAnswer(), skipped: true});
          if (!last) onActiveQuestionChange(questions[index + 1].name);
        }}/>
        <QuestionnaireNext onClick={event => {event.preventDefault(); advance();}}/>
        <QuestionnaireSubmit disabled={submission === 'error'}>{submitLabel}</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
    <div id={statusId} className="rui-questionnaire-host-status" role={submission === 'error' ? 'alert' : 'status'} aria-live="polite">
      {expired ? <p>This questionnaire has expired. Your answers are preserved.</p> : submission === 'pending' ? <p>Submitting… Your answers are preserved.</p> : submission === 'success' ? <p>Answers accepted.</p> : null}
      {submission === 'error' && <><p>{error ?? 'Submission failed. Your answers are preserved.'}</p><button type="button" onClick={onErrorAcknowledge}>Acknowledge error</button><p>After acknowledging, confirm submission again when ready.</p></>}
    </div>
  </section>;
}
