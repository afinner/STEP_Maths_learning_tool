import { useId, useReducer, type ReactNode } from 'react';
import { CONFIDENCE_LABELS, type Confidence } from '../../lib/events';
import {
  commitReducer,
  initialCommitState,
  isCommitted,
  parseNumericAnswer,
  type CommitAction,
  type CommitMode,
  type CommitRecord,
} from './commitFlow';

export interface CommitGateProps {
  mode: CommitMode;
  prompt: string;
  /** Sits under the prompt: what kind of answer is wanted, and how to give it. */
  hint?: string;
  /** Fired once, when the learner commits. */
  onCommit: (record: CommitRecord) => void;
  children: (record: CommitRecord) => ReactNode;
}

const CONFIDENCES: readonly Confidence[] = ['guessing', 'fairly-sure', 'certain'];

/**
 * Ask, take the commitment, then — and only then — show what is behind it.
 *
 * The two-step shape is deliberate: the answer is typed, and the confidence is
 * the act of locking it in. Neither can be revisited afterwards, which is the
 * point rather than an inconvenience. Nothing is stored anywhere; the record
 * lives as long as the page does.
 */
export function CommitGate({ mode, prompt, hint, onCommit, children }: CommitGateProps) {
  const [state, dispatch] = useReducer(commitReducer, initialCommitState);
  const inputId = useId();

  if (isCommitted(state)) {
    return <>{children(state.record)}</>;
  }

  /**
   * The reducer is pure, so running it here to obtain the record and then
   * dispatching the same action keeps one definition of what a commit is. The
   * gate never builds a record of its own.
   */
  const commit = (action: CommitAction) => {
    const next = commitReducer(state, action);
    if (isCommitted(next)) {
      dispatch(action);
      onCommit(next.record);
    }
  };

  const commitWith = (confidence: Confidence) =>
    commit({ type: 'confidence', confidence, t: Date.now() });

  const acknowledge = () => commit({ type: 'acknowledge', t: Date.now() });

  if (mode === 'acknowledge') {
    return (
      <div className="gate">
        <p>{prompt}</p>
        {hint ? <p className="gate-hint">{hint}</p> : null}
        <div className="gate-actions">
          <button type="button" className="button" onClick={acknowledge}>
            I have committed — show me
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gate">
      <p>{prompt}</p>
      {hint ? <p className="gate-hint">{hint}</p> : null}

      {state.phase === 'asking' ? (
        <form
          className="gate-answer"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: 'submit' });
          }}
        >
          <label className="control" htmlFor={inputId}>
            <span>Your answer</span>
            <input
              id={inputId}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              value={state.draft}
              onChange={(e) => dispatch({ type: 'draft', value: e.target.value })}
              placeholder="a number"
              aria-describedby={`${inputId}-help`}
            />
          </label>
          <p id={`${inputId}-help`} className="gate-hint">
            A number. Fractions are fine — 1/2 and 0.5 are the same answer.
          </p>
          <div className="gate-actions">
            <button
              type="submit"
              className="button"
              disabled={parseNumericAnswer(state.draft) === null}
            >
              Lock it in
            </button>
          </div>
        </form>
      ) : (
        <div className="gate-answer">
          <p className="gate-answer-given">
            You answered <strong>{state.response}</strong>.
          </p>
          <div role="group" aria-label="How confident are you?">
            <p className="gate-hint" id="confidence-question">
              How confident are you?
            </p>
            <div className="gate-actions">
              {CONFIDENCES.map((confidence) => (
                <button
                  key={confidence}
                  type="button"
                  className="button button-quiet"
                  onClick={() => commitWith(confidence)}
                >
                  {CONFIDENCE_LABELS[confidence]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
