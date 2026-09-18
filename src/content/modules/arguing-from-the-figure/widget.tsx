import { LineChart } from '../../../components/charts';
import {
  BreakChips,
  Choice,
  Controls,
  ExploreShell,
  Figures,
  Panel,
  Readout,
  Slider,
  type ReadoutItem,
  type WidgetHostProps,
} from '../../../components/explore';
import { Figure } from './Figure';
import { StepFigure } from './StepFigure';
import {
  A_X_TENTHS,
  A_Y_TENTHS,
  INITIAL_PANEL_PARAMS,
  PANEL_CONFIGURATIONS,
  STEP_ANGLES,
  apex,
  clampStepAngles,
  describeSigma,
  drawnAngleAtM,
  failingSteps,
  formatDegrees,
  formatLength,
  formatSigma,
  isFigure,
  overshoot,
  sigmaSweep,
  stepTriangle,
  theFalseStep,
  trueFigure,
  type PanelParams,
} from './compute';

/**
 * Module 03 — the three panels.
 *
 *   A. The figure, as it is and as it gets drawn, with A draggable.
 *   B. sigma at both feet as A slides across: opposite signs everywhere.
 *   C. The featured question's equation, whose roots are configurations the
 *      figure never showed.
 *
 * Every point, every sigma and the false step come from compute.ts.
 */

export type Params = PanelParams;

/** One entry per hypothesis id. The test in test/modules.test.ts enforces this. */
export const presets: Readonly<Record<string, Params>> = PANEL_CONFIGURATIONS;

function FigurePanel({ params, set }: { params: Params; set: (patch: Partial<Params>) => void }) {
  const a = apex(params);
  const figure = trueFigure(a);
  const angleAtM = drawnAngleAtM(a);

  const items: ReadoutItem[] = isFigure(figure)
    ? [
        { term: 'AB', value: formatLength(figure.sides.ab) },
        { term: 'AC', value: formatLength(figure.sides.ca) },
        {
          term: 'σ at F, on AB',
          value: formatSigma(figure.f.sigma),
          tone: figure.f.sigma < 0 ? 'broken' : 'ok',
          note: describeSigma(figure.f.sigma),
        },
        {
          term: 'σ at G, on AC',
          value: formatSigma(figure.g.sigma),
          tone: figure.g.sigma < 0 ? 'broken' : 'ok',
          note: describeSigma(figure.g.sigma),
        },
        ...(params.view === 'drawn'
          ? [
              {
                term: 'angle at M, as drawn',
                value: formatDegrees(angleAtM),
                tone: 'broken' as const,
                note: 'the price of putting P inside: PM is not perpendicular to BC',
              },
            ]
          : []),
        {
          term: 'the false step',
          value: `step ${theFalseStep(a)}`,
          tone: 'decisive',
          text: true,
          note: `the addition on the shorter side, ${figure.sides.ab < figure.sides.ca ? 'AB' : 'AC'}`,
        },
      ]
    : [
        {
          term: 'the construction',
          value: 'AB = AC: the two lines coincide',
          tone: 'indeterminate',
          text: true,
          note: `no single P is determined, so the argument fails at step ${failingSteps(a).join(', ')}`,
        },
      ];

  return (
    <Panel
      id="figure-panel"
      title="Where P really is"
      question="Every congruence in the argument is true. Which step is false, and where does the figure hide it?"
      lead="Drag A anywhere. The construction is carried out honestly, and P lands where it lands."
    >
      <Figures>
        <Figure params={params} view={params.view} onMove={(patch) => set(patch)} />
        <div className="figure-side">
          <Controls>
            <Choice
              label="Show the figure"
              value={params.view}
              options={[
                { value: 'true', label: 'as it really is' },
                { value: 'drawn', label: 'as it gets drawn' },
              ]}
              onChange={(view) => set({ view })}
            />
            <Slider
              label="A, left to right"
              display={`x = ${(params.xTenths / 10).toFixed(1)}`}
              value={params.xTenths}
              min={A_X_TENTHS.min}
              max={A_X_TENTHS.max}
              step={A_X_TENTHS.step}
              onChange={(xTenths) => set({ xTenths })}
            />
            <Slider
              label="A, height"
              display={`y = ${(params.yTenths / 10).toFixed(1)}`}
              value={params.yTenths}
              min={A_Y_TENTHS.min}
              max={A_Y_TENTHS.max}
              step={A_Y_TENTHS.step}
              onChange={(yTenths) => set({ yTenths })}
            />
          </Controls>
          <Readout items={items} />
        </div>
      </Figures>
      <BreakChips />
    </Panel>
  );
}

function SweepPanel({ params, set }: { params: Params; set: (patch: Partial<Params>) => void }) {
  const a = apex(params);
  const figure = trueFigure(a);
  const sweep = sigmaSweep(params.yTenths);
  const nan = (v: number | null) => (v === null ? NaN : v);

  const items: ReadoutItem[] = isFigure(figure)
    ? [
        { term: 'σ at F', value: formatSigma(figure.f.sigma), tone: figure.f.sigma < 0 ? 'broken' : 'ok' },
        { term: 'σ at G', value: formatSigma(figure.g.sigma), tone: figure.g.sigma < 0 ? 'broken' : 'ok' },
        {
          term: 'σ_F × σ_G',
          value: formatSigma(figure.f.sigma * figure.g.sigma),
          tone: 'decisive',
          note: 'never positive: the two feet always carry opposite signs',
        },
        {
          term: 'overshoot |AB − AC| / 2',
          value: formatLength(overshoot(a)),
          note: 'how far the outside foot has passed its vertex',
        },
      ]
    : [
        {
          term: 'σ',
          value: 'no figure',
          tone: 'indeterminate',
          text: true,
          note: 'AB = AC: the construction determines no P, so there is nothing to measure',
        },
      ];

  return (
    <Panel
      id="sweep-panel"
      title="There is nowhere to stand"
      question="Is there any triangle in which both feet lie inside their sides, so that both additions are sound?"
      lead="Slide A across the figure at any height. One foot is always past its vertex; the only place the two curves meet is where the construction stops existing."
    >
      <LineChart
        xDomain={[A_X_TENTHS.min / 10, A_X_TENTHS.max / 10]}
        yDomain={[-0.6, 0.6]}
        series={[
          {
            id: 'f',
            label: 'σ at F, on AB',
            points: sweep.map((s) => [s.x, nan(s.sigmaF)] as const),
            tone: 'primary',
          },
          {
            id: 'g',
            label: 'σ at G, on AC',
            points: sweep.map((s) => [s.x, nan(s.sigmaG)] as const),
            tone: 'alt',
          },
        ]}
        rules={[{ at: 0, label: 'σ = 0: at the vertex' }]}
        guides={[
          { at: (INITIAL_PANEL_PARAMS.xTenths * 0 + 60) / 10, label: 'AB = AC' },
          { at: a.x, tone: 'break' },
        ]}
        points={
          isFigure(figure)
            ? [
                { x: a.x, y: figure.f.sigma, tone: 'primary' },
                { x: a.x, y: figure.g.sigma, tone: 'alt' },
              ]
            : []
        }
        xLabel="x-coordinate of A"
        yLabel="σ, signed betweenness"
        height={300}
        ariaLabel={`Sigma at each foot as A slides from left to right at height ${(params.yTenths / 10).toFixed(1)}. The two curves have opposite signs everywhere and cross zero together only at x = 6, where AB = AC and the construction collapses.`}
        caption="Positive: the foot is inside its side. Negative: past the vertex. The two are never positive together."
      />

      <Controls>
        <Slider
          label="A, left to right"
          display={`x = ${(params.xTenths / 10).toFixed(1)}`}
          value={params.xTenths}
          min={A_X_TENTHS.min}
          max={A_X_TENTHS.max}
          step={A_X_TENTHS.step}
          onChange={(xTenths) => set({ xTenths })}
        />
        <Slider
          label="A, height"
          display={`y = ${(params.yTenths / 10).toFixed(1)}`}
          value={params.yTenths}
          min={A_Y_TENTHS.min}
          max={A_Y_TENTHS.max}
          step={A_Y_TENTHS.step}
          onChange={(yTenths) => set({ yTenths })}
        />
      </Controls>

      <Readout items={items} />
    </Panel>
  );
}

function StepPanel({ params, set }: { params: Params; set: (patch: Partial<Params>) => void }) {
  const triangle = stepTriangle(params.alphaDegrees, params.betaDegrees);
  const rootIndex = Math.min(params.root, Math.max(0, triangle.placements.length - 1));
  const placement = triangle.placements[rootIndex] ?? null;
  const [q2, q1] = triangle.coefficients;

  const items: ReadoutItem[] = [
    {
      term: 'the equation (∗)',
      value: triangle.linear
        ? `${q1.toFixed(3)}x + 1 = 0`
        : `${q2.toFixed(3)}x² ${q1 < 0 ? '−' : '+'} ${Math.abs(q1).toFixed(3)}x + 1 = 0`,
      text: true,
      note: triangle.linear ? 'α + β = 120°: one root' : `${triangle.roots.length} real root${triangle.roots.length === 1 ? '' : 's'}`,
    },
    ...(placement
      ? [
          { term: 'x', value: placement.x.toFixed(4) },
          {
            term: 'P along AC',
            value: formatSigma(placement.sigmaP),
            tone: placement.sigmaP < 0 ? ('broken' as const) : ('ok' as const),
            note: describeSigma(placement.sigmaP),
          },
          {
            term: 'Q along BC',
            value: formatSigma(placement.sigmaQ),
            tone: placement.sigmaQ < 0 ? ('broken' as const) : ('ok' as const),
            note: describeSigma(placement.sigmaQ),
          },
          { term: 'θ', value: formatDegrees(placement.thetaDegrees) },
          {
            term: 'is this the figure?',
            value: placement.asDrawn ? 'yes: both inside' : 'no: the figure never showed this',
            tone: placement.asDrawn ? ('ok' as const) : ('decisive' as const),
            text: true,
          },
        ]
      : [
          {
            term: 'roots',
            value: 'none',
            tone: 'indeterminate' as const,
            text: true,
            note: 'no placement of P and Q with AP = PQ = QB exists',
          },
        ]),
  ];

  return (
    <Panel
      id="step-panel"
      title="The STEP question: one equation, several pictures"
      question="With AB = 1 and AP = PQ = QB = x, which solutions of (1 + 2cos(α + β))x² − 2(cos α + cos β)x + 1 = 0 are the one in the picture?"
      lead="Set the two base angles and pick a root. The equation was derived from vectors that never asked where P and Q were, so every root is a genuine placement — and the figure shows at most one of them."
    >
      <Figures>
        <StepFigure triangle={triangle} placement={placement} alphaDegrees={params.alphaDegrees} betaDegrees={params.betaDegrees} />
        <div className="figure-side">
          <Controls>
            <Slider
              label="α, the angle at A"
              display={`α = ${params.alphaDegrees}°`}
              value={params.alphaDegrees}
              min={STEP_ANGLES.min}
              max={STEP_ANGLES.max}
              onChange={(alpha) => {
                const [alphaDegrees, betaDegrees] = clampStepAngles(alpha, params.betaDegrees, 'alpha');
                set({ alphaDegrees, betaDegrees });
              }}
            />
            <Slider
              label="β, the angle at B (β ≥ α)"
              display={`β = ${params.betaDegrees}°`}
              value={params.betaDegrees}
              min={STEP_ANGLES.min}
              max={STEP_ANGLES.max}
              onChange={(beta) => {
                const [alphaDegrees, betaDegrees] = clampStepAngles(params.alphaDegrees, beta, 'beta');
                set({ alphaDegrees, betaDegrees });
              }}
            />
            <Choice
              label="Which root to draw"
              value={rootIndex}
              options={triangle.placements.map((each, i) => ({
                value: i,
                label: `x = ${each.x.toFixed(3)}`,
              }))}
              onChange={(root) => set({ root })}
            />
          </Controls>
          <Readout items={items} />
        </div>
      </Figures>
      <p className="panel-note">
        Try α = β = 45°, the question's case (a): two roots, one inside the triangle and one with P and Q beyond C.
        Then α = 30°, β = 90°, case (b): the equation turns linear, and its one root puts Q exactly at C.
      </p>
    </Panel>
  );
}

export default function ArguingFromTheFigureWidget(props: WidgetHostProps) {
  return (
    <ExploreShell {...props} initial={INITIAL_PANEL_PARAMS} presets={presets}>
      {(params, setParams) => (
        <>
          <FigurePanel params={params} set={setParams} />
          <SweepPanel params={params} set={setParams} />
          <StepPanel params={params} set={setParams} />
        </>
      )}
    </ExploreShell>
  );
}
