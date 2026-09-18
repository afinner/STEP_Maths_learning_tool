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
import { Epicycloid } from './Epicycloid';
import {
  ALPHAS,
  DEFAULT_ALPHA_INDEX,
  N_SLIDER,
  ORDER_LABELS,
  PANEL_ORDERS,
  R_FRAME,
  TERMS,
  TERM_LABELS,
  THETA_INDEX,
  alphaAt,
  dominanceHalfWidth,
  formatFixed,
  formatN,
  formatReadout,
  formatRho,
  formatSmall,
  formatWindowTheta,
  hook,
  hookError,
  hookSweep,
  isValue,
  nFromSlider,
  rExact,
  rTruncated,
  rhoDenominator,
  termSizes,
  thetaFromIndex,
  thetaWindow,
  truncationError,
  windowSweep,
  type Order,
  type Terms,
} from './compute';
import {
  EPICYCLOID_N_OPTIONS,
  cuspDegrees,
  degreesToRadians,
  epicycloidCuspGradient,
  epicycloidGradient,
  epicycloidSpeed,
  epicycloidVelocity,
  isAtCusp,
  nearestCuspDegrees,
  speedSweep,
} from './epicycloid';

/**
 * Module 01 — the three panels.
 *
 *   A. The hook: what was dropped, and what multiplied it back.
 *   B. The window around theta = 0 where the "smaller" term is the larger one.
 *   C. The rolling circle, where the same degeneracy is a corner you can see.
 *
 * Every number comes from compute.ts and epicycloid.ts. The maths that is set
 * as display type lives in the markdown sections; what appears here is plain
 * Unicode, which reads correctly aloud and costs the reader no download.
 */

export interface Params {
  nSlider: number;
  terms: Terms;
  alphaIndex: number;
  thetaIndex: number;
  order: Order;
  epiDegrees: number;
  epiN: number;
}

const initial: Params = {
  nSlider: 20,
  terms: 0,
  alphaIndex: DEFAULT_ALPHA_INDEX,
  thetaIndex: 15,
  order: 1,
  epiDegrees: 20,
  epiN: 4,
};

/** One entry per hypothesis id. The test in test/modules.test.ts enforces this. */
export const presets: Record<string, Params> = {
  // Push n to a million: the discarded remainder shrinks without limit, and
  // the factor of n outside restores it to full size every time.
  'discarded-effect-vanishes': { ...initial, nSlider: N_SLIDER.max, terms: 0 },
  // Stand exactly at theta = 0 keeping first order: the denominator you kept
  // is not small but absent, and the truncated expression is not defined.
  'substitution-remains-defined': { ...initial, thetaIndex: 0, order: 1 },
};

/* -------------------------------------------------------------------------- *
 * A. The hook
 * -------------------------------------------------------------------------- */

function HookPanel({ params, set }: { params: Params; set: (patch: Partial<Params>) => void }) {
  const n = nFromSlider(params.nSlider);
  const sweep = hookSweep(params.terms);
  const truncated = hook.truncated(n, params.terms);
  const error = hookError(n, params.terms);

  const items: ReadoutItem[] = [
    {
      term: '√(n² + 1) − n, what you dropped',
      value: formatSmall(hook.small(n)),
      note: 'heading to zero, as promised',
    },
    {
      term: '× n',
      value: formatFixed(hook.value(n), 4),
      tone: 'broken',
      note: 'and back to full size',
    },
    { term: `shortcut, root ≈ ${TERM_LABELS[params.terms]}`, value: formatFixed(truncated, 4) },
    { term: 'true value', value: formatFixed(hook.value(n), 7) },
    {
      term: 'E, the discarded effect',
      value: formatSmall(error),
      tone: 'decisive',
      note: error > 0.01 ? 'does not shrink with n' : 'shrinks with n',
    },
  ];

  return (
    <Panel
      id="hook-panel"
      title="What you dropped, and what multiplied it"
      question={
        <>
          What is lim<sub>n→∞</sub> n(√(n² + 1) − n)?
        </>
      }
      lead="Drag n out to a million. The piece you threw away really does go to zero; the answer does not go with it."
    >
      <LineChart
        xScale="log"
        xDomain={[1, 1_000_000]}
        yDomain={[0, 0.6]}
        series={[
          {
            id: 'small',
            label: '√(n² + 1) − n: the small quantity',
            points: sweep.map((s) => [s.n, s.small] as const),
            tone: 'break',
          },
          {
            id: 'answer',
            label: 'n(√(n² + 1) − n): the answer',
            points: sweep.map((s) => [s.n, s.value] as const),
            tone: 'primary',
          },
          {
            id: 'shortcut',
            label: `the shortcut, root ≈ ${TERM_LABELS[params.terms]}`,
            points: sweep.map((s) => [s.n, s.truncated] as const),
            tone: 'repair',
            dashed: true,
          },
        ]}
        rules={[{ at: hook.limit, label: '½' }]}
        guides={[{ at: n, tone: 'break' }]}
        points={[
          { x: n, y: hook.value(n), tone: 'primary' },
          { x: n, y: hook.small(n), tone: 'break' },
          { x: n, y: truncated, tone: 'repair', open: true },
        ]}
        xLabel="n (log scale)"
        yLabel="value"
        height={300}
        ariaLabel={`Three curves against n on a log scale. The small quantity root of n squared plus one minus n falls to zero; n times it settles at one half; the shortcut keeping ${TERM_LABELS[params.terms]} gives ${formatFixed(truncated, 4)} at n = ${formatN(n)}.`}
      />

      <Controls>
        <Slider
          label="n"
          display={`n = ${formatN(n)}`}
          value={params.nSlider}
          min={N_SLIDER.min}
          max={N_SLIDER.max}
          onChange={(nSlider) => set({ nSlider })}
        />
        <Choice
          label="Replace √(n² + 1) by"
          value={params.terms}
          options={TERMS.map((t) => ({ value: t, label: TERM_LABELS[t] }))}
          onChange={(terms) => set({ terms })}
        />
      </Controls>

      <Readout items={items} />
      <BreakChips only={['discarded-effect-vanishes']} />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * B. The window around theta = 0
 * -------------------------------------------------------------------------- */

function WindowPanel({ params, set }: { params: Params; set: (patch: Partial<Params>) => void }) {
  const alpha = alphaAt(params.alphaIndex);
  const theta = thetaFromIndex(params.thetaIndex, alpha);
  const [lo, hi] = thetaWindow(alpha);
  const sweep = windowSweep(alpha, params.order);
  const halfWidth = dominanceHalfWidth(alpha);

  const exact = rExact(theta, alpha);
  const truncated = rTruncated(theta, alpha, params.order);
  const error = truncationError(exact, truncated);
  /** E next to the size of R itself, which is what makes it small or large. */
  const relative = error !== null && isValue(exact) && exact.value !== 0 ? error / Math.abs(exact.value) : null;
  const sizes = termSizes(theta, alpha);
  const rho = rhoDenominator(theta, alpha);
  const frame = R_FRAME / alpha;

  const clip = (e: ReturnType<typeof rExact>) =>
    isValue(e) && Math.abs(e.value) <= frame ? e.value : NaN;

  const items: ReadoutItem[] = [
    { term: 'kept: |α sin θ|', value: formatSmall(sizes.kept) },
    { term: 'dropped: |½α² cos θ|', value: formatSmall(sizes.dropped) },
    {
      term: 'ρ = kept ÷ dropped',
      value: formatRho(rho),
      tone: rho < 1 ? 'broken' : 'plain',
      note: rho < 1 ? 'the "smaller" term is the larger one' : 'the dropped term really is smaller',
    },
    {
      term: 'exact R = −cot(θ + α/2)',
      value: formatReadout(exact),
      tone: isValue(exact) ? 'plain' : 'indeterminate',
    },
    {
      term: `R keeping ${ORDER_LABELS[params.order]}`,
      value: formatReadout(truncated),
      tone: isValue(truncated) ? 'plain' : 'indeterminate',
    },
    {
      term: 'E, the discarded effect',
      value: error === null ? 'not defined' : formatSmall(error),
      tone: error === null ? 'indeterminate' : 'decisive',
      note:
        relative === null
          ? 'one side is not a value'
          : relative < 0.05
            ? `under 5% of R: the truncation is fine here`
            : relative < 1
              ? `${Math.round(relative * 100)}% of R`
              : 'larger than R itself',
    },
  ];

  return (
    <Panel
      id="window-panel"
      title="The smaller term that is not smaller"
      question={
        <>
          What is lim<sub>α→0</sub> R(θ, α), where R = [sin(θ + α) − sin θ] ÷ [cos(θ + α) − cos θ]?
          Does the answer depend on θ?
        </>
      }
      lead="Keep first order and walk θ towards zero. The α² term you dropped stays put while the α term you kept shrinks to nothing, and there is a window where the dropped one is the bigger."
    >
      <Figures>
        <LineChart
          xDomain={[lo, hi]}
          series={[
            {
              id: 'kept',
              label: '|α sin θ| — first order, kept',
              points: sweep.map((s) => [s.theta, s.sizes.kept] as const),
              tone: 'primary',
            },
            {
              id: 'dropped',
              label: '|½α² cos θ| — second order, dropped',
              points: sweep.map((s) => [s.theta, s.sizes.dropped] as const),
              tone: 'break',
            },
          ]}
          bands={[{ from: -halfWidth, to: halfWidth, tone: 'break', label: 'dropped > kept', labelAt: 'top' }]}
          guides={[{ at: theta, tone: 'break' }]}
          points={[
            { x: theta, y: sizes.kept, tone: 'primary' },
            { x: theta, y: sizes.dropped, tone: 'break' },
          ]}
          xLabel="θ (radians)"
          yLabel="size of the term"
          width={460}
          height={300}
          xTickCount={5}
          yTickCount={4}
          ariaLabel={`The sizes of the first- and second-order terms of the denominator against theta, near zero, for alpha = ${alpha}. Inside a band of half-width ${formatSmall(halfWidth)} radians the dropped second-order term is larger than the kept first-order term.`}
          caption="The two terms of the denominator. In the shaded band the one you dropped is the bigger of the two."
        />
        <LineChart
          xDomain={[lo, hi]}
          yDomain={[-frame, frame]}
          series={[
            {
              id: 'exact',
              label: 'exact R',
              points: sweep.map((s) => [s.theta, clip(s.exact)] as const),
              tone: 'primary',
            },
            {
              id: 'truncated',
              label: `R keeping ${ORDER_LABELS[params.order]}`,
              points: sweep.map((s) => [s.theta, clip(s.truncated)] as const),
              tone: 'break',
              dashed: true,
            },
          ]}
          guides={[
            { at: 0, label: 'θ = 0' },
            { at: -alpha / 2, label: 'true pole', labelAt: 'bottom' },
            { at: theta, tone: 'break' },
          ]}
          points={[
            { x: theta, y: clip(exact), tone: 'primary' },
            { x: theta, y: clip(truncated), tone: 'break', open: true },
          ]}
          xLabel="θ (radians)"
          yLabel="R"
          width={460}
          height={300}
          xTickCount={5}
          ariaLabel={`R against theta near zero for alpha = ${alpha}: the exact value, which has a pole at theta = minus alpha over two, and the truncation keeping ${ORDER_LABELS[params.order]}, which puts the pole at theta = 0. At theta = ${formatWindowTheta(params.thetaIndex, alpha)} the exact value is ${formatReadout(exact)} and the truncation gives ${formatReadout(truncated)}.`}
          caption="R itself. First order puts the pole in the wrong place, by exactly α/2; second order puts it back."
        />
      </Figures>

      <Controls>
        <Slider
          label="α, the small quantity"
          display={`α = ${alpha}`}
          value={params.alphaIndex}
          min={0}
          max={ALPHAS.length - 1}
          onChange={(alphaIndex) => set({ alphaIndex })}
        />
        <Slider
          label="θ, where you are standing"
          display={`θ = ${formatWindowTheta(params.thetaIndex, alpha)}`}
          value={params.thetaIndex}
          min={THETA_INDEX.min}
          max={THETA_INDEX.max}
          onChange={(thetaIndex) => set({ thetaIndex })}
        />
        <Choice
          label="Keep terms up to"
          value={params.order}
          options={PANEL_ORDERS.map((o) => ({ value: o, label: ORDER_LABELS[o] }))}
          onChange={(order) => set({ order })}
        />
      </Controls>

      <Readout items={items} />
      <BreakChips only={['substitution-remains-defined']} />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * C. The rolling circle
 * -------------------------------------------------------------------------- */

function CuspPanel({ params, set }: { params: Params; set: (patch: Partial<Params>) => void }) {
  const n = params.epiN;
  const degrees = params.epiDegrees;
  const theta = degreesToRadians(degrees);
  const atCusp = isAtCusp(theta, n);
  const velocity = epicycloidVelocity(theta, n);
  const gradient = epicycloidGradient(theta, n);
  const cuspGradient = epicycloidCuspGradient(theta, n);
  const speed = epicycloidSpeed(theta, n);

  const items: ReadoutItem[] = [
    { term: 'dx/dθ', value: formatFixed(velocity.x, 3), tone: atCusp ? 'broken' : 'plain' },
    { term: 'dy/dθ', value: formatFixed(velocity.y, 3), tone: atCusp ? 'broken' : 'plain' },
    {
      term: 'speed |v|',
      value: formatFixed(speed, 3),
      tone: atCusp ? 'broken' : 'plain',
      note: atCusp ? 'exactly zero: the point has stopped' : undefined,
    },
    {
      term: 'gradient from first order',
      value: formatReadout(gradient),
      tone: isValue(gradient) ? 'decisive' : 'indeterminate',
    },
    ...(atCusp
      ? [
          {
            term: 'gradient from second order',
            value: formatReadout(cuspGradient),
            tone: 'ok' as const,
            note: `= tan θ: the tangent lies along OP`,
          },
        ]
      : []),
  ];

  return (
    <Panel
      id="cusp-panel"
      title="The same death, drawn"
      question={
        <>
          A point P traces x = a(n cos θ + cos nθ), y = a(n sin θ + sin nθ). What is the gradient
          of its path at a cusp, where dx/dθ and dy/dθ are both zero?
        </>
      }
      lead="A circle rolls around another and a point on it traces the curve. Drive the point onto a cusp: both first-order coefficients vanish together and the gradient arrives as 0/0."
    >
      <Figures>
        <Epicycloid degrees={degrees} n={n} />
        <LineChart
          xDomain={[0, 360]}
          series={[
            {
              id: 'speed',
              label: 'speed',
              points: speedSweep(n),
              tone: 'primary',
            },
          ]}
          guides={[
            ...cuspDegrees(n).map((d) => ({ at: d, label: 'cusp' })),
            { at: degrees, tone: 'break' as const },
          ]}
          points={[{ x: degrees, y: speed, tone: atCusp ? 'break' : 'primary' }]}
          xLabel="θ (degrees)"
          yLabel="speed of P"
          width={460}
          height={320}
          ariaLabel={`The speed of the tracing point against theta over a full turn, for n = ${n}. It touches zero at each of the ${n - 1} cusps and is ${formatFixed(speed, 3)} at theta = ${degrees} degrees.`}
          caption="The speed of P. It does not merely dip at a cusp; it is zero there, which is why first order has nothing to say."
        />
      </Figures>

      <Controls>
        <Slider
          label="θ"
          display={`θ = ${degrees}°`}
          value={degrees}
          min={0}
          max={359}
          onChange={(epiDegrees) => set({ epiDegrees })}
        />
        <Choice
          label="n (the fixed circle has radius (n − 1)a)"
          value={n}
          options={EPICYCLOID_N_OPTIONS.map((option) => ({ value: option, label: `n = ${option}` }))}
          onChange={(epiN) => set({ epiN, epiDegrees: Math.min(359, params.epiDegrees) })}
        />
        <div className="control">
          <span className="control-row">
            <span className="control-label">Cusps at {cuspDegrees(n).map((d) => `${d}°`).join(', ')}</span>
          </span>
          <button
            type="button"
            className="button button-quiet"
            onClick={() => set({ epiDegrees: nearestCuspDegrees(degrees, n) })}
          >
            Snap to the nearest cusp
          </button>
        </div>
      </Controls>

      <Readout items={items} />
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * The widget
 * -------------------------------------------------------------------------- */

export default function SmallEnoughToIgnoreWidget(props: WidgetHostProps) {
  return (
    <ExploreShell {...props} initial={initial} presets={presets}>
      {(params, setParams) => (
        <>
          <HookPanel params={params} set={setParams} />
          <WindowPanel params={params} set={setParams} />
          <CuspPanel params={params} set={setParams} />
        </>
      )}
    </ExploreShell>
  );
}
