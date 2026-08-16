import { useId } from 'react';
import { LineChart } from '../../../components/charts';
import { AMPLIFIER_DESCRIPTIONS, AMPLIFIER_NAMES } from '../../../lib/amplifiers';
import { emit } from '../../../lib/events';
import {
  ALPHA,
  DEGENERATE_THETA,
  HOOK_TABLE_N,
  MAX_ORDER,
  ORDER_LABELS,
  R_DECIMALS,
  SAFE_THETA,
  THETA_MAX_DEGREES,
  THETA_MIN_DEGREES,
  THETA_STEP_DEGREES,
  WITNESS_ALPHAS,
  degreesToRadians,
  formatEstimate,
  formatFixed,
  formatReadout,
  formatRho,
  formatSmall,
  hook,
  hookRho,
  isValue,
  rExact,
  rTruncated,
  radiansToDegrees,
  rho,
  thetaSweep,
  type Order,
} from './compute';

/**
 * Beats 4 and 5 of module 01.
 *
 * Every number below comes from compute.ts. The maths that is set as display
 * type lives in the module's index.md, where KaTeX runs at build time; what
 * appears in here is written in plain Unicode, which reads correctly aloud and
 * costs the reader no download.
 */

/* -------------------------------------------------------------------------- *
 * Beat 4 — Essence
 * -------------------------------------------------------------------------- */

export function Essence({ n }: { n: number }) {
  const dropped = hook.rawDroppedTerm(n);
  const amplified = hook.droppedTerm(n);
  const report = hookRho(n);

  return (
    <section className="beat-panel" aria-labelledby="essence-heading">
      <h3 id="essence-heading" className="panel-heading">
        Where the answer went
      </h3>

      <table className="data-table">
        <caption>Rounding √(n² + 1) down to n</caption>
        <thead>
          <tr>
            <th scope="col">n</th>
            <th scope="col">what you dropped</th>
            <th scope="col">× n</th>
          </tr>
        </thead>
        <tbody>
          {HOOK_TABLE_N.map((row) => (
            <tr key={row} className={row === n ? 'is-current' : undefined}>
              <th scope="row">{row.toLocaleString('en-GB')}</th>
              <td className="numeric">{formatSmall(hook.rawDroppedTerm(row))}</td>
              <td className="numeric">{formatFixed(hook.droppedTerm(row), 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="prose">
        <p>
          At n = {n.toLocaleString('en-GB')} the piece you threw away is{' '}
          {formatSmall(dropped)} — a genuinely tiny number, and calling it negligible
          beside n² is a correct judgement.
        </p>
        <p>Then you multiplied it by n.</p>
        <p className="statement">
          {formatSmall(dropped)} × {n.toLocaleString('en-GB')} ={' '}
          <strong>{formatFixed(amplified, 1)}</strong>
        </p>
        <p>
          The answer <em>is</em> the thing you threw away. Everything you kept
          cancelled: n − n leaves nothing to carry the result.
        </p>
      </div>

      <div className="widget-readout">
        <div>
          <span className="term">what you kept</span>
          <span className="value">{formatFixed(report.kept, 1)}</span>
        </div>
        <div>
          <span className="term">what you dropped</span>
          <span className="value">{formatFixed(report.dropped, 1)}</span>
        </div>
        <div>
          <span className="term">ρ = kept / dropped</span>
          <span className="value value-broken">{formatRho(report.rho)}</span>
        </div>
      </div>

      <div className="prose">
        <p>
          That ratio is the whole diagnostic. Truncation is legitimate exactly when ρ
          runs off to infinity as the small quantity shrinks. Here it is {formatRho(report.rho)},
          at every n, forever.
        </p>
        <p className="statement">
          Look at what survives <em>before</em> you decide what to drop. If what
          survives is zero, you dropped too much.
        </p>
        <p>
          That is a procedural inversion, not a slogan. The habit is: decide what is
          small, then see what is left. The repair is to do it in the other order.
        </p>
      </div>

      <dl className="amplifiers">
        {(['cancellation', 'multiplication'] as const).map((amplifier) => (
          <div key={amplifier}>
            <dt>{AMPLIFIER_NAMES[amplifier]}</dt>
            <dd>{AMPLIFIER_DESCRIPTIONS[amplifier]}</dd>
          </div>
        ))}
      </dl>
      <p className="panel-note">
        These are the two mechanisms at work in this example. This question fires both
        at once; another false belief may need a different description.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * Beat 5a — the witness, with no context
 * -------------------------------------------------------------------------- */

export function WitnessSetup() {
  return (
    <section className="beat-panel" aria-labelledby="witness-heading">
      <h3 id="witness-heading" className="panel-heading">
        A second small quantity
      </h3>
      <div className="prose">
        <p>
          You want the limit of R(θ, α) as α → 0. Top and bottom both head to zero, so
          you expand. From the addition formulae, for small α:
        </p>
        <p className="statement">
          sin(θ + α) − sin θ ≈ α cos θ − ½α² sin θ
          <br />
          cos(θ + α) − cos θ ≈ −α sin θ − ½α² cos θ
        </p>
        <p>
          Worth noticing before you go on: the question hands you the α² term without
          being asked. Examination questions rarely give you a term you do not need.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * Beat 5c — two evaluations, side by side
 * -------------------------------------------------------------------------- */

function WitnessColumn({
  theta,
  label,
  verdict,
  tone,
}: {
  theta: number;
  label: string;
  verdict: string;
  tone: 'primary' | 'break';
}) {
  return (
    <div className={`witness-column witness-${tone}`}>
      <table className="data-table">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">α</th>
            <th scope="col">R(θ, α)</th>
          </tr>
        </thead>
        <tbody>
          {WITNESS_ALPHAS.map((alpha) => (
            <tr key={alpha}>
              <th scope="row">{alpha}</th>
              <td className="numeric">{formatEstimate(rExact(theta, alpha), 5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="witness-verdict">{verdict}</p>
    </div>
  );
}

export function TwoColumns() {
  return (
    <section className="beat-panel" aria-labelledby="columns-heading">
      <h3 id="columns-heading" className="panel-heading">
        Same expression, two places to stand
      </h3>
      <div className="columns">
        <WitnessColumn
          theta={SAFE_THETA}
          label="θ = π/3"
          verdict="Settles. Truncation was fine."
          tone="primary"
        />
        <WitnessColumn
          theta={DEGENERATE_THETA}
          label="θ = 0"
          verdict="Does not settle. It is −2/α."
          tone="break"
        />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * The truncation-order control
 * -------------------------------------------------------------------------- */

const CLIP = 8;

export interface ExplorerProps {
  theta: number;
  order: Order;
  onChange: (patch: { theta?: number; order?: Order }) => void;
}

/**
 * The centre of the module.
 *
 * Two controls: how many terms to keep, and where to stand. The discarded terms
 * *are* the assumptions here, so restoring one is a click — which is why the
 * assumption ledger and the main interaction are the same object.
 *
 * The theta control counts whole degrees rather than radians. That is the
 * detent: it cannot land at 1e-17 and show a huge finite number in the one
 * place the answer has to be "indeterminate".
 */
export function TruncationExplorer({ theta, order, onChange }: ExplorerProps) {
  const orderId = useId();
  const thetaId = useId();

  const degrees = radiansToDegrees(theta);
  const current = rTruncated(theta, ALPHA, order);
  const report = rho(theta, ALPHA, order);
  const shown = formatReadout(current);

  const points = thetaSweep(order).map(({ degrees: d, value }) => {
    // Values that have run off the top of the frame break the line rather than
    // being drawn as a wall: what the reader should see is a curve leaving.
    const y = isValue(value) && Math.abs(value.value) <= CLIP ? value.value : NaN;
    return [d, y] as const;
  });

  const move = (patch: { theta?: number; order?: Order }) => {
    onChange(patch);
    const nextTheta = patch.theta ?? theta;
    const nextOrder = patch.order ?? order;
    emit({
      type: 'slider_move',
      question_id: 'r-theta-alpha',
      order_kept: nextOrder,
      value_shown: formatReadout(rTruncated(nextTheta, ALPHA, nextOrder)),
      t: Date.now(),
    });
  };

  return (
    <section className="beat-panel explorer" aria-labelledby="explorer-heading">
      <h3 id="explorer-heading" className="panel-heading">
        Keep more terms. Stand somewhere else.
      </h3>

      <LineChart
        series={[{ id: 'truncated', label: 'R', points, tone: 'primary' }]}
        xDomain={[THETA_MIN_DEGREES, THETA_MAX_DEGREES]}
        yDomain={[-CLIP, CLIP]}
        guides={[
          { at: 0, label: 'θ = 0' },
          { at: 180, label: 'θ = π' },
          { at: degrees, tone: 'break' },
        ]}
        xLabel="θ (degrees)"
        yLabel="R"
        height={280}
        ariaLabel={`R against theta, keeping terms up to ${ORDER_LABELS[order]}. At theta = ${degrees} degrees the value is ${shown}.`}
        caption="The curve leaves the frame where the retained denominator dies."
      />

      <div className="controls">
        <label className="control" htmlFor={orderId}>
          <span className="control-row">
            <span>Keep terms up to</span>
            <span className="control-value">{ORDER_LABELS[order]}</span>
          </span>
          <input
            id={orderId}
            type="range"
            min={0}
            max={MAX_ORDER}
            step={1}
            value={order}
            onChange={(e) => move({ order: Number(e.target.value) as Order })}
          />
        </label>

        <label className="control" htmlFor={thetaId}>
          <span className="control-row">
            <span>Where you are standing</span>
            <span className="control-value">θ = {degrees}°</span>
          </span>
          <input
            id={thetaId}
            type="range"
            min={THETA_MIN_DEGREES}
            max={THETA_MAX_DEGREES}
            step={THETA_STEP_DEGREES}
            value={degrees}
            onChange={(e) => move({ theta: degreesToRadians(Number(e.target.value)) })}
          />
        </label>
      </div>

      <div className="widget-readout">
        <div>
          <span className="term">R, keeping {ORDER_LABELS[order]}</span>
          <span className={`value ${isValue(current) ? '' : 'value-indeterminate'}`}>
            {shown}
          </span>
        </div>
        <div>
          <span className="term">ρ here</span>
          <span
            className={`value ${report.verdict === 'well-separated' ? 'value-decisive' : 'value-indeterminate'}`}
          >
            {formatRho(report.binding)}
          </span>
        </div>
        <div>
          <span className="term">separation now</span>
          <span className="value value-text">{report.verdict}</span>
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {`Keeping ${ORDER_LABELS[order]} at theta = ${degrees} degrees: R is ${shown}, rho is ${formatRho(report.binding)}.`}
      </p>

      <p className="panel-note">
        α is fixed at {ALPHA} throughout. Set the order to {ORDER_LABELS[1]} and drag θ
        through zero: the exact value runs away, while at the point the first-order
        approximation has retained too little to report a value.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * Beat 5d — the reframe, and 5e — the confirmation
 * -------------------------------------------------------------------------- */

export function Reframe() {
  return (
    <section className="beat-panel" aria-labelledby="reframe-heading">
      <h3 id="reframe-heading" className="panel-heading">
        Nothing about α changed
      </h3>
      <div className="prose">
        <p>
          α was equally small in both columns. What changed was θ.
        </p>
        <p>
          At θ = π/3 the first-order term of the denominator is −α sin(π/3), which is
          non-zero, so it dominates and the α² term is genuinely negligible. At θ = 0
          that same term is −α sin 0 = 0. It is not small. It is <em>absent</em>. The
          α² term is no longer a correction: it is the entire denominator.
        </p>
        <p className="statement">
          The order you need to expand to is not a property of the expression. It is a
          property of the point you are standing at.
        </p>
      </div>
    </section>
  );
}

export function Confirmation() {
  const settled = rExact(SAFE_THETA, 1e-9);

  return (
    <details className="confirmation">
      <summary>Check this against the exact answer</summary>
      <div className="prose">
        <p>Sum to product gives a closed form:</p>
        <p className="statement">
          R(θ, α) = 2cos(θ + α/2)sin(α/2) ÷ −2sin(θ + α/2)sin(α/2) = −cot(θ + α/2)
        </p>
        <p>
          So R → −cot θ wherever cot is finite —{' '}
          {formatFixed(isValue(settled) ? settled.value : NaN, R_DECIMALS)} at θ = π/3 —
          and blows up where cot has a pole, at θ = 0. The special point is not an
          accident of the algebra. It is a pole sitting under the limit.
        </p>
      </div>
    </details>
  );
}
