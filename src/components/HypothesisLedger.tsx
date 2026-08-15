import type { Hypothesis } from '../schema';

interface HypothesisLedgerProps {
  hypotheses: readonly Hypothesis[];
  activeId: string | null;
  /** Ids the widget actually has a preset for. Others are shown, but inert. */
  wired: readonly string[];
  /**
   * Before the reader has committed to an answer. The conditions are worth
   * reading either way, so they stay on the page — but driving the widget from
   * here would be a way around the commit, so it waits.
   */
  locked?: boolean;
  onSelect: (id: string) => void;
  onClear: () => void;
}

/**
 * The conditions the claim silently assumed, each one clickable.
 *
 * Clicking drives the widget into a state that violates that hypothesis, which
 * is the whole argument of the site: the claim is not wrong in general, it is
 * wrong exactly when one of these fails. Buttons, not links — nothing navigates,
 * and they work from the keyboard for free.
 */
export function HypothesisLedger({
  hypotheses,
  activeId,
  wired,
  locked = false,
  onSelect,
  onClear,
}: HypothesisLedgerProps) {
  return (
    <>
      <ul className="ledger">
        {hypotheses.map((h) => {
          const isWired = wired.includes(h.id) && !locked;
          const isActive = activeId === h.id;
          return (
            <li key={h.id}>
              <button
                type="button"
                className="ledger-item"
                aria-pressed={isActive}
                disabled={!isWired}
                onClick={() => onSelect(h.id)}
              >
                <span className="statement">{h.statement}</span>
                <span className="violated-by">{h.violatedBy}</span>
                {isWired ? (
                  <span className="action">
                    {isActive ? 'Showing this violation' : 'Break this one →'}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {locked ? (
        <p className="ledger-locked">Answer the question above and these come alive.</p>
      ) : null}
      {activeId ? (
        <p className="gate-actions" style={{ marginTop: 'var(--space-4)' }}>
          <button type="button" className="button button-quiet" onClick={onClear}>
            Back to the well-behaved case
          </button>
        </p>
      ) : null}
    </>
  );
}
