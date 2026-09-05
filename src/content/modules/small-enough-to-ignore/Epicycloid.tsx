import { scaleLinear } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import { formatReadout, isValue, radiansToDegrees } from './compute';
import {
  EPICYCLOID_A,
  EPICYCLOID_N,
  epicycloidCuspGradient,
  epicycloidCusps,
  epicycloidGradient,
  epicycloidPath,
  epicycloidPoint,
  epicycloidRadius,
  epicycloidVelocity,
  isAtCusp,
} from './epicycloid';

/**
 * Beat 5f — the degeneracy you can see.
 *
 * Shares the theta control with the panel above, so driving theta to a cusp and
 * watching the first-order gradient die is one gesture. Self-contained: this
 * file, epicycloid.ts and its test are the whole beat.
 */

const SIZE = 320;
const PADDING = 10;
const TANGENT_HALF_LENGTH = 1.4;

export function Epicycloid({ theta }: { theta: number }) {
  const n = EPICYCLOID_N;
  const radius = epicycloidRadius(n, EPICYCLOID_A);

  const scale = scaleLinear()
    .domain([-radius, radius])
    .range([PADDING, SIZE - PADDING]);
  // y grows upwards in the plane and downwards in SVG.
  const flip = scaleLinear()
    .domain([-radius, radius])
    .range([SIZE - PADDING, PADDING]);

  const draw = d3line<{ x: number; y: number }>()
    .x((point) => scale(point.x))
    .y((point) => flip(point.y));

  const curve = draw(epicycloidPath(720, n)) ?? '';
  const cusps = epicycloidCusps(n);
  const point = epicycloidPoint(theta, n);
  const atCusp = isAtCusp(theta, n);

  const firstOrder = epicycloidGradient(theta, n);
  const secondOrder = epicycloidCuspGradient(theta, n);


  /**
   * The tangent direction: from the first-order coefficients where they survive,
   * and along the radius where they do not — which is the whole point.
   */
  const velocity = epicycloidVelocity(theta, n);
  const direction = atCusp
    ? { x: point.x, y: point.y }
    : { x: velocity.x, y: velocity.y };
  const length = Math.hypot(direction.x, direction.y) || 1;
  const unit = { x: direction.x / length, y: direction.y / length };
  const tangent = {
    x1: point.x - unit.x * TANGENT_HALF_LENGTH,
    y1: point.y - unit.y * TANGENT_HALF_LENGTH,
    x2: point.x + unit.x * TANGENT_HALF_LENGTH,
    y2: point.y + unit.y * TANGENT_HALF_LENGTH,
  };

  const degrees = radiansToDegrees(theta);

  return (
    <div className="epicycloid">
      <figure className="epicycloid-figure">
        <svg
          className="chart"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={
            atCusp
              ? `An epicycloid with ${n - 1} cusps. The point sits exactly on a cusp at theta = ${degrees} degrees, where the first-order gradient is indeterminate.`
              : `An epicycloid with ${n - 1} cusps. The point sits at theta = ${degrees} degrees, away from every cusp, where the gradient is ${formatReadout(firstOrder)}.`
          }
        >
          <circle
            cx={scale(0)}
            cy={flip(0)}
            r={2.5}
            fill="var(--chart-axis)"
            aria-hidden="true"
          />

          <path className="series" d={curve} stroke="var(--chart-1)" strokeWidth={1.5} />

          {cusps.map((cuspTheta) => {
            const cusp = epicycloidPoint(cuspTheta, n);
            return (
              <circle
                key={cuspTheta}
                cx={scale(cusp.x)}
                cy={flip(cusp.y)}
                r={4}
                fill="var(--paper-raised)"
                stroke="var(--chart-2)"
                strokeWidth={2}
              />
            );
          })}

          {/* The radius OP: at a cusp the tangent lies along it. */}
          <line
            x1={scale(0)}
            y1={flip(0)}
            x2={scale(point.x)}
            y2={flip(point.y)}
            stroke="var(--chart-axis)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          <line
            x1={scale(tangent.x1)}
            y1={flip(tangent.y1)}
            x2={scale(tangent.x2)}
            y2={flip(tangent.y2)}
            stroke={atCusp ? 'var(--chart-2)' : 'var(--chart-3)'}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          <circle
            cx={scale(point.x)}
            cy={flip(point.y)}
            r={5}
            fill={atCusp ? 'var(--chart-2)' : 'var(--chart-1)'}
          />
        </svg>
        <figcaption className="chart-caption">
          The tracing point at θ = {degrees}°, with the tangent through it and the
          radius dashed. The {n - 1} cusps are ringed.
        </figcaption>
      </figure>

      <div className="epicycloid-readout">
        <div className="widget-readout">
          <div>
            <span className="term">gradient from first order</span>
            <span className={`value ${isValue(firstOrder) ? '' : 'value-indeterminate'}`}>
              {formatReadout(firstOrder)}
            </span>
          </div>
          {/* Only at a cusp: away from one, the ratio of the second-order
              coefficients is a number but not the gradient of anything, and two
              contradicting figures under one heading would argue against the
              prose beside them. */}
          {atCusp ? (
            <div>
              <span className="term">keeping second order</span>
              <span className="value">{formatReadout(secondOrder)}</span>
            </div>
          ) : null}
        </div>

        <p className="panel-note">
          {atCusp
            ? 'Both first-order coefficients vanish here at once, so first order returns nothing at all — the same 0/0 as before. The second-order terms give the gradient of the radius, which is what the tangent does at a corner.'
            : 'Away from a cusp the first-order coefficients survive and settle the gradient on their own. Drive θ onto a ringed point to kill them.'}
        </p>
      </div>
    </div>
  );
}

/**
 * The whole of beat 5f: the reason the exam question asks for this, and the
 * picture. One element in widget.tsx renders it; deleting that line and these
 * three files removes the beat cleanly.
 */
export function CuspBeat({ theta }: { theta: number }) {
  const n = EPICYCLOID_N;
  const first = epicycloidCusps(n)[0] ?? 0;

  return (
    <section className="beat-panel" aria-labelledby="cusp-heading">
      <h3 id="cusp-heading" className="panel-heading">
        The same death, with a picture
      </h3>

      <div className="prose">
        <p>
          The second half of the question this came from is where it pays. A circle
          rolls without slipping around the outside of a fixed one, and a point on the
          rolling circle traces the curve below — an epicycloid with {n - 1} cusps. You
          are asked for its gradient at one particular angle.
        </p>
        <p>
          At that angle the two first-order coefficients do not merely become small.
          They vanish together, because the rolling and the turning cancel exactly, and
          the gradient arrives as 0/0 — the same 0/0 as before, from the same cause.
          Push the second-order terms through instead and the gradient comes out along
          the radius, which is what a tangent does at a corner.
        </p>
        <p className="statement">
          The point where first order dies is the point where the curve is not smooth.
        </p>
        <p className="panel-note">
          The examiner's report on this question notes candidates who reached the 0/0
          and then asserted the answer they had found in the earlier part. The failure
          is common and unglamorous, which is the most useful thing about it.
        </p>
      </div>

      <Epicycloid theta={theta} />

      <p className="panel-note">
        The θ control above drives this too. The first cusp is at{' '}
        {radiansToDegrees(first)}° — where R itself is perfectly well behaved. Which
        points are special belongs to the expression, not to θ.
      </p>
    </section>
  );
}
