import {
  BreakChips,
  ExploreShell,
  Panel,
  Readout,
  type ReadoutItem,
  type WidgetHostProps,
} from '../../../components/explore';
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
 * Module 03 — Arguing from the figure. Draft.
 *
 * Stage A: the construction, and which step it kills. The answer is computed
 * from where A stands, never written down: the false step moves from one
 * addition to the other as A crosses the line of symmetry. The figure itself,
 * and the controls that move A by hand, are still to come.
 */

export const presets: Readonly<Record<string, Params>> = CONFIGURATIONS;

function readout(params: Params): ReadoutItem[] {
  const a = apex(params);
  const figure = trueFigure(a);

  if (!isFigure(figure)) {
    return [
      {
        term: 'the construction',
        value: 'AB = AC: the two lines coincide',
        tone: 'indeterminate',
        text: true,
        note: `no single P is determined, so the argument fails at step ${failingSteps(a).join(', ')}`,
      },
    ];
  }

  return [
    { term: 'A', value: `(${a.x.toFixed(1)}, ${a.y.toFixed(1)})` },
    { term: 'σ at F, on AB', value: formatSigma(figure.f.sigma), tone: figure.f.sigma < 0 ? 'broken' : 'plain' },
    { term: 'σ at G, on AC', value: formatSigma(figure.g.sigma), tone: figure.g.sigma < 0 ? 'broken' : 'plain' },
    { term: 'the false step', value: `step ${theFalseStep(a)}`, tone: 'decisive', text: true },
  ];
}

export default function ArguingFromTheFigureWidget(props: WidgetHostProps) {
  return (
    <ExploreShell {...props} initial={INITIAL_PARAMS} presets={presets}>
      {(params) => (
        <Panel
          id="figure-panel"
          title="Where A stands, and which step fails"
          lead="Draft. The signed betweenness σ at each foot decides which addition in the argument is false."
        >
          <Readout items={readout(params)} />
          <BreakChips />
        </Panel>
      )}
    </ExploreShell>
  );
}
