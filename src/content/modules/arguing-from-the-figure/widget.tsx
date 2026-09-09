import { ModuleShell, type WidgetHostProps } from '../../../components/ModuleShell';
import {
  CONFIGURATIONS,
  INITIAL_PARAMS,
  apex,
  failingSteps,
  formatSigma,
  isFigure,
  theFalseStep,
  trueFigure,
  type Params,
} from './compute';

/**
 * Module 03 — Arguing from the figure.
 *
 * The reader is asked which single step of the isosceles proof is false, commits
 * to a number, and is then shown the configuration the figure was hiding. The
 * answer is computed from where A stands, never written down: the false step
 * moves from one addition to the other as A crosses the line of symmetry.
 */

export const presets: Readonly<Record<string, Params>> = CONFIGURATIONS;

/** What the argument gets wrong where the reader is first standing. */
const falseStepAtStart = theFalseStep(apex(INITIAL_PARAMS));

function Readout({ params }: { params: Params }) {
  const a = apex(params);
  const figure = trueFigure(a);

  if (!isFigure(figure)) {
    return (
      <div className="widget-readout" aria-live="polite">
        <p>
          AB and AC are equal here, so the bisector of angle A and the perpendicular
          bisector of BC are the same line. There is no single P to speak of, and the
          argument fails at step {failingSteps(a).join(', ')}.
        </p>
      </div>
    );
  }

  return (
    <div className="widget-readout" aria-live="polite">
      <p>
        <span className="term">σ at F, on AB</span>
        <span className="value">{formatSigma(figure.f.sigma)}</span>
      </p>
      <p>
        <span className="term">σ at G, on AC</span>
        <span className="value">{formatSigma(figure.g.sigma)}</span>
      </p>
      <p>
        The false step is step <strong>{theFalseStep(a)}</strong>.
      </p>
    </div>
  );
}

export default function ArguingFromTheFigureWidget(props: WidgetHostProps) {
  return (
    <ModuleShell
      {...props}
      initial={INITIAL_PARAMS}
      presets={presets}
      commit={{
        mode: 'numeric-with-confidence',
        beat: 2,
        promptId: 'false-step',
        ...(falseStepAtStart === null ? {} : { target: falseStepAtStart }),
      }}
    >
      {(params) => <Readout params={params} />}
    </ModuleShell>
  );
}
