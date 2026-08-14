import { useState, type ReactNode } from 'react';
import type { Hypothesis } from '../schema';
import { HypothesisLedger } from './HypothesisLedger';
import { PredictionGate } from './PredictionGate';

/**
 * Props the page template hands to every module widget. A widget takes these
 * and passes them straight through to ModuleShell — it never has to know where
 * they came from.
 */
export interface WidgetHostProps {
  hypotheses: readonly Hypothesis[];
  predictionPrompt: string;
}

export interface ModuleShellProps<P extends object> extends WidgetHostProps {
  /** The well-behaved case: parameters for which the claim looks true. */
  initial: P;
  /**
   * Hypothesis id → parameters that violate it. Keys must cover every
   * hypothesis id in the frontmatter; a test enforces that, so a hypothesis can
   * never quietly become a dead button.
   */
  presets: Readonly<Record<string, P>>;
  /** The widget proper: given current parameters, draw. */
  children: (params: P, setParams: (patch: Partial<P>) => void) => ReactNode;
}

/**
 * Everything interactive on a module page, in one island.
 *
 * It owns two beats: the widget (Run) and the hypothesis ledger (Break). They
 * share parameter state, which is the reason they are one component rather than
 * two — clicking a hypothesis has to move the widget. The page template owns the
 * order of the beats around it.
 */
export function ModuleShell<P extends object>({
  hypotheses,
  predictionPrompt,
  initial,
  presets,
  children,
}: ModuleShellProps<P>) {
  const [params, setParamsState] = useState<P>(initial);
  const [revealed, setRevealed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const setParams = (patch: Partial<P>) => {
    setParamsState((current) => ({ ...current, ...patch }));
    // Hand-editing the controls means the reader has left the canned violation.
    setActiveId(null);
  };

  const wired = hypotheses.filter((h) => h.id in presets).map((h) => h.id);
  const active = hypotheses.find((h) => h.id === activeId) ?? null;

  const selectHypothesis = (id: string) => {
    const preset = presets[id];
    if (!preset) return;
    setParamsState(preset);
    setActiveId(id);
    setRevealed(true);
  };

  const clearHypothesis = () => {
    setParamsState(initial);
    setActiveId(null);
  };

  return (
    <>
      <PredictionGate
        prompt={predictionPrompt}
        revealed={revealed}
        onReveal={() => setRevealed(true)}
      >
        <div className="widget">{children(params, setParams)}</div>
      </PredictionGate>

      <section className="beat beat-break" id="break" aria-labelledby="beat-break-label">
        <h2 className="beat-label" id="beat-break-label">
          Break
        </h2>
        <p className="prose" style={{ marginBottom: 'var(--space-5)' }}>
          The claim did not come with conditions attached, but it had them. Each one
          below can be violated on its own — click it and the model above moves to a
          case where it fails.
        </p>

        <HypothesisLedger
          hypotheses={hypotheses}
          activeId={activeId}
          wired={wired}
          onSelect={selectHypothesis}
          onClear={clearHypothesis}
        />

        <p aria-live="polite" className="visually-hidden">
          {active
            ? `Showing a case violating: ${active.statement}. ${active.violatedBy}`
            : 'Showing the well-behaved case.'}
        </p>
      </section>
    </>
  );
}
