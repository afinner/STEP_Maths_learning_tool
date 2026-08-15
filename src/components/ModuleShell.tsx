import { useState, type ReactNode } from 'react';
import type { Hypothesis } from '../schema';
import { emit } from '../lib/events';
import { CommitGate } from './commit/CommitGate';
import {
  deltaFromResponse,
  isCorrect,
  type CommitMode,
  type CommitRecord,
} from './commit/commitFlow';
import { HypothesisLedger } from './HypothesisLedger';

/**
 * Props the page template hands to every module widget. A widget takes these
 * and passes them straight through to ModuleShell — it never has to know where
 * they came from.
 */
export interface WidgetHostProps {
  hypotheses: readonly Hypothesis[];
  predictionPrompt: string;
}

/**
 * How the module takes the reader's commitment before showing them anything.
 * Omitted, it is a single acknowledgement — enough for a module whose prediction
 * has no numeric answer.
 */
export interface CommitConfig {
  mode: CommitMode;
  /** Which beat this commitment belongs to, for the event log. */
  beat: number;
  promptId: string;
  hint?: string;
  /** The value the answer is marked against, where there is one. */
  target?: number;
}

const DEFAULT_COMMIT: CommitConfig = {
  mode: 'acknowledge',
  beat: 1,
  promptId: 'prediction',
};

export interface ModuleShellProps<P extends object> extends WidgetHostProps {
  /** The well-behaved case: parameters for which the claim looks true. */
  initial: P;
  /**
   * Hypothesis id → parameters that violate it. Keys must cover every
   * hypothesis id in the frontmatter; a test enforces that, so a hypothesis can
   * never quietly become a dead button.
   */
  presets: Readonly<Record<string, P>>;
  commit?: CommitConfig;
  /**
   * The widget proper: given current parameters, draw. The commitment is passed
   * back so a module can read the learner's own answer to them.
   */
  children: (
    params: P,
    setParams: (patch: Partial<P>) => void,
    commit: CommitRecord,
  ) => ReactNode;
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
  commit = DEFAULT_COMMIT,
  children,
}: ModuleShellProps<P>) {
  const [params, setParamsState] = useState<P>(initial);
  const [record, setRecord] = useState<CommitRecord | null>(null);
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
  };

  const clearHypothesis = () => {
    setParamsState(initial);
    setActiveId(null);
  };

  /**
   * One commitment, then the reveal. The events are emitted here rather than in
   * the gate so that every module logs the same shapes without having to
   * remember to.
   */
  const onCommit = (committed: CommitRecord) => {
    setRecord(committed);
    emit({
      type: 'commit',
      beat: commit.beat,
      prompt_id: commit.promptId,
      response: committed.response,
      confidence: committed.confidence,
      t: committed.t,
    });
    if (commit.target !== undefined) {
      emit({
        type: 'reveal',
        beat: commit.beat,
        prompt_id: commit.promptId,
        correct: isCorrect(committed, commit.target),
        delta_from_response: deltaFromResponse(committed, commit.target),
      });
    }
  };

  return (
    <>
      <CommitGate
        mode={commit.mode}
        prompt={predictionPrompt}
        {...(commit.hint !== undefined ? { hint: commit.hint } : {})}
        onCommit={onCommit}
      >
        {(committed) => (
          <div className="widget">{children(params, setParams, committed)}</div>
        )}
      </CommitGate>

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
          locked={record === null}
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
