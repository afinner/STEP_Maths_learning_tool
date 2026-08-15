import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  commitReducer,
  deltaFromResponse,
  initialCommitState,
  isCommitted,
  isCorrect,
  parseNumericAnswer,
  type CommitAction,
  type CommitState,
} from '../src/components/commit/commitFlow';
import { commitFor, commits, emit, history, resetEvents, subscribe } from '../src/lib/events';
import ModuleOneWidget from '../src/content/modules/small-enough-to-ignore/widget';
import { hook, hookTable } from '../src/content/modules/small-enough-to-ignore/compute';

const HYPOTHESES = [
  { id: 'leading-term-survives', statement: 's1', violatedBy: 'v1' },
  { id: 'kept-terms-do-not-cancel', statement: 's2', violatedBy: 'v2' },
  { id: 'dropped-term-is-not-amplified', statement: 's3', violatedBy: 'v3' },
];

/**
 * The claim these modules make is that the answer arrives after the learner has
 * committed to one of their own. This file is that claim, tested. If it starts
 * failing, the module has stopped doing the one thing it exists to do.
 */
describe('the reveal is unreachable before a commit', () => {
  it('is not in the page a reader is first served', () => {
    const html = renderToStaticMarkup(
      <ModuleOneWidget hypotheses={HYPOTHESES} predictionPrompt="What does it approach?" />,
    );

    // The prompt is there...
    expect(html).toContain('What does it approach?');

    // ...and nothing behind it is. Not the answer, not the table, not a hint of either.
    expect(html).not.toContain('It is 0.5');
    for (const { value } of hookTable()) {
      expect(html).not.toContain(value.toFixed(7));
    }
    expect(html).not.toContain('You said');
    expect(html).not.toMatch(/0\.4142|0\.4999|0\.5000/);
  });

  it('cannot be opened by any sequence of actions that omits the commit', () => {
    const alphabet: CommitAction[] = [
      { type: 'draft', value: '0' },
      { type: 'draft', value: '' },
      { type: 'submit' },
    ];

    // Every sequence of up to four non-committing actions.
    const walk = (state: CommitState, depth: number) => {
      expect(isCommitted(state)).toBe(false);
      if (depth === 0) return;
      for (const action of alphabet) walk(commitReducer(state, action), depth - 1);
    };

    walk(initialCommitState, 4);
  });

  it('opens only after an answer and a confidence, in that order', () => {
    const typed = commitReducer(initialCommitState, { type: 'draft', value: '0' });
    expect(isCommitted(typed)).toBe(false);

    // Confidence without a submitted answer does nothing.
    const skipped = commitReducer(typed, { type: 'confidence', confidence: 'certain', t: 1 });
    expect(skipped).toBe(typed);

    const submitted = commitReducer(typed, { type: 'submit' });
    expect(submitted.phase).toBe('confirming');
    expect(isCommitted(submitted)).toBe(false);

    const committed = commitReducer(submitted, {
      type: 'confidence',
      confidence: 'certain',
      t: 1,
    });
    expect(isCommitted(committed)).toBe(true);
  });

  it('will not accept an answer that is not a number', () => {
    for (const draft of ['', '   ', 'zero', 'small', '1/0', '?']) {
      const typed = commitReducer(initialCommitState, { type: 'draft', value: draft });
      expect(commitReducer(typed, { type: 'submit' }).phase).toBe('asking');
    }
  });

  it('does not let the answer be changed once given', () => {
    let state = commitReducer(initialCommitState, { type: 'draft', value: '0' });
    state = commitReducer(state, { type: 'submit' });
    state = commitReducer(state, { type: 'draft', value: '0.5' });
    expect(state.phase === 'confirming' && state.response).toBe('0');

    state = commitReducer(state, { type: 'confidence', confidence: 'guessing', t: 2 });
    state = commitReducer(state, { type: 'draft', value: '0.5' });
    state = commitReducer(state, { type: 'confidence', confidence: 'certain', t: 3 });
    expect(state).toEqual({
      phase: 'committed',
      record: { response: '0', value: 0, confidence: 'guessing', t: 2 },
    });
  });
});

describe('reading a typed answer', () => {
  it('accepts the ways people write a half', () => {
    for (const written of ['0.5', '.5', '1/2', ' 1 / 2 ', '½']) {
      expect(parseNumericAnswer(written)).toBeCloseTo(0.5, 12);
    }
  });

  it('accepts the answer most readers will give', () => {
    expect(parseNumericAnswer('0')).toBe(0);
  });

  it('rejects what is not a number', () => {
    for (const written of ['', 'a half', '1/0', '--1', '1/2/3']) {
      expect(parseNumericAnswer(written)).toBeNull();
    }
  });

  it('marks against the limit, and measures how far off the answer was', () => {
    const record = { response: '0', value: 0, confidence: 'certain' as const, t: 0 };
    expect(isCorrect(record, hook.limit)).toBe(false);
    expect(deltaFromResponse(record, hook.limit)).toBe(-0.5);

    const right = { ...record, response: '1/2', value: 0.5 };
    expect(isCorrect(right, hook.limit)).toBe(true);
    expect(deltaFromResponse(right, hook.limit)).toBe(0);
  });
});

describe('the event log', () => {
  beforeEach(() => resetEvents());

  it('records commitments in the shape the specification gives', () => {
    emit({
      type: 'commit',
      beat: 2,
      prompt_id: 'hook-limit',
      response: '0',
      confidence: 'certain',
      t: 1234,
    });

    expect(commits()).toHaveLength(1);
    expect(commitFor('hook-limit')).toEqual({
      type: 'commit',
      beat: 2,
      prompt_id: 'hook-limit',
      response: '0',
      confidence: 'certain',
      t: 1234,
    });
  });

  it('delivers to a sink, so persistence can be added without touching components', () => {
    const seen: string[] = [];
    const unsubscribe = subscribe((event) => seen.push(event.type));

    emit({
      type: 'reveal',
      beat: 2,
      prompt_id: 'hook-limit',
      correct: false,
      delta_from_response: -0.5,
    });
    unsubscribe();
    emit({
      type: 'measure',
      item_id: 'm1',
      response: '3/2',
      correct: true,
      orders_predicted: 1,
    });

    expect(seen).toEqual(['reveal']);
    // Still logged for the page's own read-back, sink or no sink.
    expect(history()).toHaveLength(2);
  });
});
