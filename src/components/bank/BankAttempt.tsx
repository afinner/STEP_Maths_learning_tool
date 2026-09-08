import { useEffect, useId, useState } from 'react';
import type { Amplifier } from '../../lib/amplifiers';
import {
  attemptFor,
  OUTCOMES,
  OUTCOME_LABELS,
  recordAttempt,
  subscribe,
  type AttemptOutcome,
} from '../../lib/events';

export interface BankAttemptProps {
  /** The bank entry's id, which is what the record is keyed by. */
  questionId: string;
  /** The drawer this control is in: the mechanism the question is filed under. */
  amplifier: Amplifier;
  /** The citation, so the control says which question it is asking about. */
  question: string;
}

/**
 * How a bank question went, in the reader's own words.
 *
 * There is nothing to be right about here, so there is nothing to praise: no
 * score, no tally across the bank, no change of tone between the three answers.
 * It is a radio group rather than a one-way button because an account of how
 * something went can be corrected, and because saying "stuck" is worth as
 * little friction as saying anything else.
 *
 * Nothing is timed. "Got there slowly" is the reader's own judgement, not a
 * measurement, and the module would be contradicting itself if it were.
 */
export function BankAttempt({ questionId, amplifier, question }: BankAttemptProps) {
  const group = useId();
  const [outcome, setOutcome] = useState<AttemptOutcome | null>(
    () => attemptFor(questionId)?.self_reported_outcome ?? null,
  );

  /**
   * A question filed under two mechanisms is rendered in both drawers, and it
   * is still one question. The log is what both controls read, so marking it in
   * one place answers it in the other rather than asking twice.
   */
  useEffect(
    () =>
      subscribe((event) => {
        if (event.type === 'bank_attempt' && event.question_id === questionId) {
          setOutcome(event.self_reported_outcome);
        }
      }),
    [questionId],
  );

  const choose = (next: AttemptOutcome) => {
    if (next === outcome) return;
    setOutcome(next);
    recordAttempt(questionId, amplifier, next);
  };

  return (
    <fieldset className="bank-attempt">
      <legend className="visually-hidden">How {question} went</legend>
      {OUTCOMES.map((each) => (
        <label key={each} className="bank-attempt-option">
          <input
            type="radio"
            name={group}
            value={each}
            checked={outcome === each}
            onChange={() => choose(each)}
          />
          <span>{OUTCOME_LABELS[each]}</span>
        </label>
      ))}
    </fieldset>
  );
}
