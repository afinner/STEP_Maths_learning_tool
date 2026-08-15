import type { Confidence } from '../../lib/events';

/**
 * The commit gate as a pure state machine.
 *
 * The pedagogical claim of these modules is that the answer arrives *after* the
 * learner has committed to one of their own — if the explanation comes first
 * there is nothing to repair, because following someone else's reasoning is not
 * the same event as having your own reasoning fail. That claim is only as good
 * as the code enforcing it, so the enforcement lives here, in a reducer that can
 * be tested exhaustively, rather than in a component's conditional rendering.
 *
 * Two invariants, both tested by enumeration:
 *   - `committed` is unreachable without a deliberate commit action;
 *   - once committed, nothing can change the answer.
 */

export type CommitMode = 'acknowledge' | 'numeric-with-confidence';

export interface CommitRecord {
  /** Exactly what the learner typed, kept verbatim for reading back to them. */
  response: string;
  /** The parsed value, or null for an acknowledgement. */
  value: number | null;
  confidence: Confidence | null;
  t: number;
}

export type CommitState =
  | { phase: 'asking'; draft: string }
  | { phase: 'confirming'; response: string; value: number }
  | { phase: 'committed'; record: CommitRecord };

export type CommitAction =
  | { type: 'draft'; value: string }
  | { type: 'submit' }
  | { type: 'confidence'; confidence: Confidence; t: number }
  | { type: 'acknowledge'; t: number };

export const initialCommitState: CommitState = { phase: 'asking', draft: '' };

/**
 * Read a typed answer. Free text rather than multiple choice, because the point
 * is to make the learner *produce* an answer: recognition lets them hedge.
 * People write a half in several ways and all of them are the same commitment.
 */
export function parseNumericAnswer(raw: string): number | null {
  const text = raw.trim().replace(/\s+/g, '');
  if (text === '') return null;

  const named: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3 };
  const namedValue = named[text];
  if (namedValue !== undefined) return namedValue;

  const fraction = /^([+-]?\d*\.?\d+)\/(\d*\.?\d+)$/.exec(text);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    return Number(fraction[1]) / denominator;
  }

  if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(text)) return Number(text);
  return null;
}

export function commitReducer(state: CommitState, action: CommitAction): CommitState {
  switch (action.type) {
    case 'draft':
      // Editing is only possible before the answer is submitted.
      return state.phase === 'asking' ? { phase: 'asking', draft: action.value } : state;

    case 'submit': {
      if (state.phase !== 'asking') return state;
      const value = parseNumericAnswer(state.draft);
      if (value === null) return state;
      return { phase: 'confirming', response: state.draft.trim(), value };
    }

    case 'confidence':
      if (state.phase !== 'confirming') return state;
      return {
        phase: 'committed',
        record: {
          response: state.response,
          value: state.value,
          confidence: action.confidence,
          t: action.t,
        },
      };

    case 'acknowledge':
      if (state.phase !== 'asking') return state;
      return {
        phase: 'committed',
        record: { response: 'acknowledged', value: null, confidence: null, t: action.t },
      };
  }
}

/** The gate. Nothing downstream of the commit renders while this is false. */
export function isCommitted(state: CommitState): state is {
  phase: 'committed';
  record: CommitRecord;
} {
  return state.phase === 'committed';
}

/** Whether a committed answer matches the value the module is about to show. */
export function isCorrect(record: CommitRecord, target: number, tolerance = 1e-6): boolean {
  return record.value !== null && Math.abs(record.value - target) < tolerance;
}

/** response - truth, for the reveal event. Null when they did not give a number. */
export function deltaFromResponse(record: CommitRecord, target: number): number | null {
  return record.value === null ? null : record.value - target;
}
