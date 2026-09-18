import { LineChart, NumberLine } from '../../../components/charts';
import {
  BreakChips,
  Controls,
  ExploreShell,
  Panel,
  Readout,
  Select,
  Slider,
  type ReadoutItem,
  type ReadoutTone,
  type WidgetHostProps,
} from '../../../components/explore';
import {
  ORDER_SYMBOLS,
  OUTCOME_LABELS,
  PRIMARY_WITNESS,
  VERDICT_LABELS,
  WITNESSES,
  X_STEP_TENTHS,
  curveOf,
  disagreementSet,
  errorDirection,
  formatFixed,
  formatIntervals,
  formatLength,
  operationAt,
  operationRange,
  readingAt,
  solutionSet,
  tenthsToX,
  witnessById,
  xToTenths,
  type Verdict,
  type Witness,
  type WitnessId,
} from './compute';

/**
 * Module 02 — the two panels.
 *
 *   A. Stand at an x and ask both statements: the two sides plotted, the
 *      solution sets on a number line, and the disagreement set measured.
 *   B. The step itself, as a graph: the function applied to both sides, and
 *      whether it is increasing between them where you stand.
 *
 * Every interval and every verdict is evaluated from the inequalities in
 * compute.ts. What appears here is plain Unicode, which reads aloud correctly
 * and costs the reader no download.
 */

export interface Params {
  witnessId: WitnessId;
  xTenths: number;
}

const initial: Params = {
  witnessId: PRIMARY_WITNESS.id,
  xTenths: xToTenths(PRIMARY_WITNESS.start),
};

/** One entry per hypothesis id. The test in test/modules.test.ts enforces this. */
export const presets: Record<string, Params> = {
  // Stand at x = 0, inside the branch the multiplication threw away: the factor
  // x - 2 is negative there, so the step ran the other way.
  'multiplier-keeps-one-sign': { witnessId: 'multiply-by-unknown-sign', xTenths: 0 },
  // Squaring, at a value where the right-hand side is negative and the
  // operation stops being increasing between the two sides.
  'operation-preserves-order': { witnessId: 'square-both-sides', xTenths: -15 },
};

function verdictTone(v: Verdict): ReadoutTone {
  if (v === 'true') return 'ok';
  if (v === 'undefined') return 'indeterminate';
  return 'broken';
}

const toRow = (intervals: ReturnType<typeof solutionSet>) =>
  intervals.map((iv) => ({
    from: iv.from,
    to: iv.to,
    clipFrom: iv.fromClipped,
    clipTo: iv.toClipped,
  }));

interface PanelProps {
  witness: Witness;
  x: number;
  set: (patch: Partial<Params>) => void;
}

/* -------------------------------------------------------------------------- *
 * A. Both statements, at an x
 * -------------------------------------------------------------------------- */

function StatementsPanel({ witness, x, set }: PanelProps) {
  const reading = readingAt(witness, x);
  const truth = solutionSet(witness.original, witness.domain);
  const afterStep = solutionSet(witness.transformed, witness.domain);
  const lost = disagreementSet(witness);
  const left = witness.original.left(x);
  const right = witness.original.right(x);
  const [leftText, rightText] = witness.original.text.split(/ [<>] /);
  const inFrame = (v: number) =>
    Number.isFinite(v) && v >= witness.yRange[0] && v <= witness.yRange[1];

  const items: ReadoutItem[] = [
    {
      term: witness.original.text,
      value: VERDICT_LABELS[reading.original],
      tone: verdictTone(reading.original),
      text: true,
    },
    {
      term: `after the step: ${witness.transformed.text}`,
      value: VERDICT_LABELS[reading.transformed],
      tone: verdictTone(reading.transformed),
      text: true,
    },
    {
      term: 'the two statements',
      value: reading.agree ? 'agree here' : 'disagree here',
      tone: reading.agree ? 'ok' : 'broken',
      text: true,
    },
    {
      term: 'D, the disagreement set',
      value: formatIntervals(lost),
      tone: 'decisive',
      note: `length ${formatLength(lost)} · the step ${errorDirection(witness)}`,
    },
  ];

  return (
    <Panel
      id="statements-panel"
      title="Stand somewhere and ask both statements"
      question={
        <>
          Solve {witness.original.text}. What does it cost to {witness.step}?
        </>
      }
      lead="Choose a step, then walk x along the line. Where the two verdicts come apart is the disagreement set, and that set is the whole cost of the step."
    >
      <LineChart
        xDomain={witness.domain}
        yDomain={witness.yRange}
        series={[
          {
            id: 'left',
            label: `left side: ${leftText}`,
            points: curveOf(witness.original.left, witness.domain, witness.yRange),
            tone: 'primary',
          },
          {
            id: 'right',
            label: `right side: ${rightText}`,
            points: curveOf(witness.original.right, witness.domain, witness.yRange),
            tone: 'alt',
          },
        ]}
        bands={[
          ...truth.map((iv, i) => ({
            from: iv.from,
            to: iv.to,
            tone: 'primary' as const,
            ...(i === 0 ? { label: 'holds' } : {}),
          })),
          ...lost.map((iv, i) => ({
            from: iv.from,
            to: iv.to,
            tone: 'break' as const,
            ...(i === 0 ? { label: 'D: the step disagrees' } : {}),
          })),
        ]}
        guides={[{ at: x, tone: 'break' }]}
        points={[
          ...(inFrame(left) ? [{ x, y: left, tone: 'primary' as const }] : []),
          ...(inFrame(right) ? [{ x, y: right, tone: 'alt' as const }] : []),
        ]}
        xLabel="x"
        yLabel="value of each side"
        height={300}
        ariaLabel={`The two sides of ${witness.original.text} plotted against x. The statement holds on ${formatIntervals(truth)}; the step disagrees with it on ${formatIntervals(lost)}. At x = ${formatFixed(x, 1)} the original ${VERDICT_LABELS[reading.original]} and the transformed statement ${VERDICT_LABELS[reading.transformed]}.`}
        caption="The two sides of the original statement. Blue band: where it holds. Orange band: where the step disagrees with it."
      />

      <NumberLine
        domain={witness.domain}
        rows={[
          { id: 'truth', label: 'truly holds', intervals: toRow(truth), tone: 'primary' },
          { id: 'after', label: 'after the step', intervals: toRow(afterStep), tone: 'alt' },
          { id: 'lost', label: 'disagree (D)', intervals: toRow(lost), tone: 'break' },
        ]}
        marks={[
          {
            at: x,
            tone: reading.agree ? 'primary' : 'break',
            open: reading.original === 'undefined',
            label: `x = ${formatFixed(x, 1)}`,
          },
        ]}
        xLabel="x"
        ariaLabel={`A number line for ${witness.original.text}. The true solutions are ${formatIntervals(truth)}; the step produces ${formatIntervals(afterStep)}; they disagree on ${formatIntervals(lost)}.`}
        caption="Three sets on one line. The third row is the decisive quantity: the step is sound exactly when it is empty."
      />

      <Controls>
        <Select
          label="The step"
          value={witness.id}
          options={WITNESSES.map((option) => ({ value: option.id, label: option.name }))}
          onChange={(witnessId) => {
            const next = witnessById(witnessId);
            set({ witnessId: next.id, xTenths: xToTenths(next.start) });
          }}
        />
        <Slider
          label="Where you are standing"
          display={`x = ${formatFixed(x, 1)}`}
          value={xToTenths(x)}
          min={xToTenths(witness.domain[0])}
          max={xToTenths(witness.domain[1])}
          step={X_STEP_TENTHS}
          onChange={(xTenths) => set({ xTenths })}
        />
      </Controls>

      <Readout items={items} />
      <p className="panel-note">{witness.because}</p>
      <BreakChips />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * B. The operation itself
 * -------------------------------------------------------------------------- */

function OperationPanel({ witness, x, set }: PanelProps) {
  const reading = operationAt(witness, x);
  const range = operationRange(witness, x);
  const phi = (t: number) => witness.operation.apply(x, t);
  const curve = curveOf(phi, range, [-Infinity, Infinity], 200);
  const [labelA, labelB] = witness.operation.labels;

  const outcomeTone: ReadoutTone =
    reading.outcome === 'preserved'
      ? 'ok'
      : reading.outcome === 'undefined'
        ? 'indeterminate'
        : 'broken';

  const items: ReadoutItem[] =
    reading.sides && reading.images
      ? [
          { term: `L = ${labelA}`, value: formatFixed(reading.sides[0], 3) },
          { term: `R = ${labelB}`, value: formatFixed(reading.sides[1], 3) },
          { term: 'before the step', value: `L ${ORDER_SYMBOLS[reading.before]} R`, text: true },
          { term: 'φ(L)', value: formatFixed(reading.images[0], 3) },
          { term: 'φ(R)', value: formatFixed(reading.images[1], 3) },
          {
            term: 'after the step',
            value: `φ(L) ${ORDER_SYMBOLS[reading.after]} φ(R)`,
            text: true,
          },
          {
            term: 'so at this x the step',
            value: OUTCOME_LABELS[reading.outcome],
            tone: outcomeTone,
            text: true,
          },
        ]
      : [
          {
            term: 'at this x',
            value: 'one side is not defined',
            tone: 'indeterminate',
            text: true,
            note: 'the original statement asks nothing here; the transformed one has an opinion',
          },
        ];

  return (
    <Panel
      id="operation-panel"
      title="The step, as a graph"
      question={
        <>
          At x = {formatFixed(x, 1)}, is φ: {witness.operation.describe(x)} increasing between the
          two sides of {witness.original.text}?
        </>
      }
      lead="Doing the same thing to both sides is applying a function φ to each. It keeps the order only where φ is increasing between the two sides — and for most steps, φ changes with x."
    >
      <LineChart
        xDomain={range}
        series={[
          {
            id: 'phi',
            label: witness.operation.describe(x),
            points: curve,
            tone: 'repair',
          },
        ]}
        guides={
          reading.sides
            ? [
                { at: reading.sides[0], label: 'L' },
                { at: reading.sides[1], label: 'R' },
              ]
            : []
        }
        rules={
          reading.images
            ? [
                { at: reading.images[0], label: 'φ(L)' },
                { at: reading.images[1], label: 'φ(R)' },
              ]
            : []
        }
        points={
          reading.sides && reading.images
            ? [
                { x: reading.sides[0], y: reading.images[0], tone: 'primary' },
                { x: reading.sides[1], y: reading.images[1], tone: 'alt' },
              ]
            : []
        }
        xLabel="t, a side of the inequality"
        yLabel="φ(t), after the step"
        height={300}
        ariaLabel={`The function the step applies to both sides, ${witness.operation.describe(x)}, with the two sides L and R marked and their images. At x = ${formatFixed(x, 1)} the ${OUTCOME_LABELS[reading.outcome]}.`}
        caption="Read the two sides off the horizontal axis and their images off the vertical. If the vertical order matches the horizontal one, the step kept the truth."
      />

      <Controls>
        <Slider
          label="Where you are standing"
          display={`x = ${formatFixed(x, 1)}`}
          value={xToTenths(x)}
          min={xToTenths(witness.domain[0])}
          max={xToTenths(witness.domain[1])}
          step={X_STEP_TENTHS}
          onChange={(xTenths) => set({ xTenths })}
        />
        <div className="control">
          <span className="control-row">
            <span className="control-label">The step</span>
          </span>
          <span className="control-value">{witness.step}</span>
        </div>
      </Controls>

      <Readout items={items} />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * The widget
 * -------------------------------------------------------------------------- */

export default function OperationsOnInequalitiesWidget(props: WidgetHostProps) {
  return (
    <ExploreShell {...props} initial={initial} presets={presets}>
      {(params, setParams) => {
        const witness = witnessById(params.witnessId);
        const x = tenthsToX(params.xTenths);
        return (
          <>
            <StatementsPanel witness={witness} x={x} set={setParams} />
            <OperationPanel witness={witness} x={x} set={setParams} />
          </>
        );
      }}
    </ExploreShell>
  );
}
