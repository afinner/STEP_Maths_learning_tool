import { useBreak } from './ExploreShell';

export interface BreakChipsProps {
  /** Show only these hypotheses — the ones this panel's controls can violate. */
  only?: readonly string[];
}

/**
 * The conditions the claim silently assumed, each one a chip.
 *
 * Pressing a chip drives the widget into a state that violates that condition,
 * which is the argument of the whole site: the claim is not wrong in general,
 * it is wrong exactly when one of these fails. The condition is only spelled
 * out once the chip is pressed, so the panel stays quiet until it is asked.
 */
export function BreakChips({ only }: BreakChipsProps) {
  const { hypotheses, wired, activeId, select, reset } = useBreak();
  const shown = hypotheses.filter((h) => !only || only.includes(h.id));
  const active = shown.find((h) => h.id === activeId) ?? null;

  if (shown.length === 0) return null;

  return (
    <div className="break">
      <div className="break-row">
        <span className="break-label">Break it</span>
        {shown.map((h) => (
          <button
            key={h.id}
            type="button"
            className="chip"
            aria-pressed={activeId === h.id}
            disabled={!wired.includes(h.id)}
            onClick={() => select(h.id)}
          >
            {h.label}
          </button>
        ))}
        {active ? (
          <button type="button" className="chip chip-quiet" onClick={reset}>
            Reset
          </button>
        ) : null}
      </div>
      <p className="break-note" aria-live="polite">
        {active ? (
          <>
            <strong>Assumed:</strong> {active.statement} <span>{active.violatedBy}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
