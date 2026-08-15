import { useId, useState, type ReactNode } from 'react';
import { emit } from '../../lib/events';

export type MeasureInput =
  | { kind: 'number'; label: string; placeholder?: string }
  | { kind: 'choice'; options: readonly { id: string; label: string }[] }
  | { kind: 'multi'; options: readonly { id: string; label: string }[] };

export interface MeasureVerdict {
  correct: boolean;
  /** For order-prediction items: how many orders the learner said were needed. */
  ordersPredicted?: number | null;
}

export interface MeasureItemProps {
  itemId: string;
  question: ReactNode;
  input: MeasureInput;
  /** Marks the response. The answer key lives in compute.ts, never in here. */
  mark: (response: string) => MeasureVerdict;
  /** Shown once answered, whatever the outcome. */
  explanation: ReactNode;
}

/**
 * One auto-marked item.
 *
 * What is being measured is the mechanism, not recall and not speed: nothing
 * here is timed, and there is no praise for a right answer — the verdict is
 * flat, the explanation is the same either way, and the item does not offer a
 * second attempt because the interesting datum is the first one.
 */
export function MeasureItem({
  itemId,
  question,
  input,
  mark,
  explanation,
}: MeasureItemProps) {
  const inputId = useId();
  const [draft, setDraft] = useState('');
  const [selection, setSelection] = useState<readonly string[]>([]);
  const [answered, setAnswered] = useState<{ response: string; correct: boolean } | null>(
    null,
  );

  const submit = (response: string) => {
    if (answered || response === '') return;
    const verdict = mark(response);
    setAnswered({ response, correct: verdict.correct });
    emit({
      type: 'measure',
      item_id: itemId,
      response,
      correct: verdict.correct,
      orders_predicted: verdict.ordersPredicted ?? null,
    });
  };

  const toggle = (id: string) =>
    setSelection((current) =>
      current.includes(id) ? current.filter((each) => each !== id) : [...current, id],
    );

  return (
    <li className="measure-item">
      <div className="measure-question">{question}</div>

      {answered ? (
        <div className="measure-outcome" aria-live="polite">
          <p className={answered.correct ? 'measure-correct' : 'measure-incorrect'}>
            {answered.correct ? 'Correct.' : 'Not correct.'}
          </p>
          <div className="measure-explanation">{explanation}</div>
        </div>
      ) : (
        <div className="measure-input">
          {input.kind === 'number' ? (
            <form
              className="measure-number"
              onSubmit={(e) => {
                e.preventDefault();
                submit(draft.trim());
              }}
            >
              <label htmlFor={inputId}>{input.label}</label>
              <input
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={draft}
                placeholder={input.placeholder ?? ''}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="button" disabled={draft.trim() === ''}>
                Answer
              </button>
            </form>
          ) : null}

          {input.kind === 'choice' ? (
            <div className="gate-actions" role="group">
              {input.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="button button-quiet"
                  onClick={() => submit(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {input.kind === 'multi' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit([...selection].sort().join(','));
              }}
            >
              <fieldset className="measure-multi">
                <legend className="visually-hidden">Select every point that applies</legend>
                {input.options.map((option) => (
                  <label key={option.id} className="measure-option">
                    <input
                      type="checkbox"
                      checked={selection.includes(option.id)}
                      onChange={() => toggle(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>
              <button
                type="submit"
                className="button"
                disabled={selection.length === 0}
              >
                Answer
              </button>
            </form>
          ) : null}
        </div>
      )}
    </li>
  );
}
