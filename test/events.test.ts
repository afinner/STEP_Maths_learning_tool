import { beforeEach, describe, expect, it } from 'vitest';
import {
  attemptFor,
  emit,
  history,
  OUTCOMES,
  OUTCOME_LABELS,
  recordAttempt,
  resetEvents,
  subscribe,
  type LearningEvent,
} from '../src/lib/events';

/**
 * The event shapes are the contract a future sink will receive, and a shape
 * nothing ever produces is a contract with nobody on the other end. This file
 * covers `bank_attempt`, which was declared before it had an emitter.
 */

beforeEach(() => resetEvents());

describe('bank attempts', () => {
  it('emits the shape the specification names, field for field', () => {
    recordAttempt('step3-2024-q2', 'cancellation', 'got-there-slowly');

    expect(history()).toEqual([
      {
        type: 'bank_attempt',
        question_id: 'step3-2024-q2',
        amplifier: 'cancellation',
        self_reported_outcome: 'got-there-slowly',
      },
    ]);
  });

  it('offers exactly the three outcomes, each with a label', () => {
    expect(OUTCOMES).toEqual(['got-it', 'got-there-slowly', 'stuck']);
    for (const outcome of OUTCOMES) {
      expect(OUTCOME_LABELS[outcome].length).toBeGreaterThan(0);
    }
  });

  it('carries no timestamp: an attempt is reported, never measured', () => {
    recordAttempt('step3-2024-q2', 'cancellation', 'got-it');
    for (const event of history()) {
      expect(event).not.toHaveProperty('t');
    }
  });

  it('reads back the last account of a question, not the first', () => {
    recordAttempt('step3-2023-q2', 'cancellation', 'stuck');
    recordAttempt('step3-2023-q2', 'multiplication', 'got-there-slowly');

    // Changing your mind is not a second attempt at anything, so the reader
    // sees what they last said — from whichever drawer they said it in.
    expect(attemptFor('step3-2023-q2')?.self_reported_outcome).toBe('got-there-slowly');
    expect(attemptFor('step3-2023-q2')?.amplifier).toBe('multiplication');
    // ...and both accounts stay in the log, which is the record, not the state.
    expect(history()).toHaveLength(2);
  });

  it('has nothing to say about a question that has not been answered', () => {
    recordAttempt('step3-2024-q2', 'cancellation', 'got-it');
    expect(attemptFor('step3-2024-q3')).toBeUndefined();
  });

  it('reaches a registered sink like every other event', () => {
    const seen: LearningEvent[] = [];
    const unsubscribe = subscribe((event) => seen.push(event));

    recordAttempt('step2-2021-q6', 'multiplication', 'stuck');
    emit({ type: 'measure', item_id: 'x', response: '1', correct: false, orders_predicted: null });
    unsubscribe();
    recordAttempt('step2-2021-q6', 'multiplication', 'got-it');

    expect(seen.map((event) => event.type)).toEqual(['bank_attempt', 'measure']);
  });
});
