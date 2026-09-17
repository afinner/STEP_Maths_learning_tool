import { scaleLinear } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import { formatReadout, isValue } from './compute';
import {
  EPICYCLOID_A,
  contactPoint,
  cuspDegrees,
  degreesToRadians,
  epicycloidCusps,
  epicycloidGradient,
  epicycloidPath,
  epicycloidPoint,
  epicycloidRadius,
  epicycloidVelocity,
  isAtCusp,
  rollingCentre,
} from './epicycloid';

/**
 * The rolling circle, the curve it traces, and the tangent at the tracing
 * point. Where the first-order coefficients survive, the tangent is drawn from
 * them; at a cusp they are both zero and the tangent is drawn along the radius,
 * which is what the second-order terms give.
 */

const SIZE = 360;
const PADDING = 14;
const TANGENT_HALF_LENGTH = 1.3;
/** The velocity arrow, scaled so the fastest point fits inside the frame. */
const VELOCITY_SCALE = 0.12;

export function Epicycloid({ degrees, n }: { degrees: number; n: number }) {
  const theta = degreesToRadians(degrees);
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

  const whole = draw(epicycloidPath(720, n)) ?? '';
  const traced = draw(epicycloidPath(Math.max(2, Math.round(degrees * 2)), n, EPICYCLOID_A, theta)) ?? '';

  const cusps = epicycloidCusps(n);
  const point = epicycloidPoint(theta, n);
  const centre = rollingCentre(theta, n);
  const contact = contactPoint(theta, n);
  const atCusp = isAtCusp(theta, n);
  const gradient = epicycloidGradient(theta, n);

  const velocity = epicycloidVelocity(theta, n);
  const direction = atCusp ? { x: point.x, y: point.y } : { x: velocity.x, y: velocity.y };
  const length = Math.hypot(direction.x, direction.y) || 1;
  const unit = { x: direction.x / length, y: direction.y / length };
  const tangent = {
    x1: point.x - unit.x * TANGENT_HALF_LENGTH,
    y1: point.y - unit.y * TANGENT_HALF_LENGTH,
    x2: point.x + unit.x * TANGENT_HALF_LENGTH,
    y2: point.y + unit.y * TANGENT_HALF_LENGTH,
  };
  const arrow = {
    x: point.x + velocity.x * VELOCITY_SCALE,
    y: point.y + velocity.y * VELOCITY_SCALE,
  };

  const rollingRadiusPx = scale(EPICYCLOID_A) - scale(0);
  const fixedRadiusPx = scale((n - 1) * EPICYCLOID_A) - scale(0);

  return (
    <figure className="chart-figure">
      <svg
        className="chart epicycloid"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={
          atCusp
            ? `An epicycloid with ${n - 1} cusps. The tracing point sits exactly on a cusp at theta = ${degrees} degrees, where both first-order coefficients are zero and the gradient from first order is indeterminate.`
            : `An epicycloid with ${n - 1} cusps. The tracing point is at theta = ${degrees} degrees, away from every cusp, where the gradient is ${formatReadout(gradient)}.`
        }
      >
        <defs>
          <marker id="epi-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--chart-3)" />
          </marker>
        </defs>

        {/* The fixed circle and the rolling circle. */}
        <circle
          cx={scale(0)}
          cy={flip(0)}
          r={fixedRadiusPx}
          fill="none"
          stroke="var(--chart-grid)"
          strokeWidth={1.5}
        />
        <circle
          cx={scale(centre.x)}
          cy={flip(centre.y)}
          r={rollingRadiusPx}
          fill="var(--chart-band)"
          stroke="var(--chart-axis)"
          strokeWidth={1}
        />
        <circle cx={scale(0)} cy={flip(0)} r={2.5} fill="var(--chart-axis)" />
        <circle cx={scale(contact.x)} cy={flip(contact.y)} r={2} fill="var(--chart-axis)" />

        {/* The whole curve, faint, and the part traced so far. */}
        <path className="series" d={whole} stroke="var(--chart-1)" strokeWidth={1} opacity={0.3} />
        <path className="series" d={traced} stroke="var(--chart-1)" strokeWidth={2} />

        {cusps.map((cuspTheta) => {
          const cusp = epicycloidPoint(cuspTheta, n);
          return (
            <circle
              key={cuspTheta}
              cx={scale(cusp.x)}
              cy={flip(cusp.y)}
              r={4.5}
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
        {/* The spoke from the rolling centre to the tracing point. */}
        <line
          x1={scale(centre.x)}
          y1={flip(centre.y)}
          x2={scale(point.x)}
          y2={flip(point.y)}
          stroke="var(--chart-axis)"
          strokeWidth={1}
        />

        <line
          x1={scale(tangent.x1)}
          y1={flip(tangent.y1)}
          x2={scale(tangent.x2)}
          y2={flip(tangent.y2)}
          stroke={atCusp ? 'var(--chart-2)' : 'var(--chart-1)'}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {atCusp ? null : (
          <line
            x1={scale(point.x)}
            y1={flip(point.y)}
            x2={scale(arrow.x)}
            y2={flip(arrow.y)}
            stroke="var(--chart-3)"
            strokeWidth={2}
            markerEnd="url(#epi-arrow)"
          />
        )}

        <circle
          cx={scale(point.x)}
          cy={flip(point.y)}
          r={5}
          fill={atCusp ? 'var(--chart-2)' : 'var(--chart-1)'}
          stroke="var(--paper-raised)"
          strokeWidth={1.5}
        />
      </svg>
      <figcaption className="chart-caption">
        The tracing point P at θ = {degrees}°, with the tangent through it, the velocity as a
        green arrow, and the radius OP dashed. The {n - 1} cusps are ringed, at θ ={' '}
        {cuspDegrees(n).map((d) => `${d}°`).join(', ')}.
        {isValue(gradient) ? '' : ' The velocity is zero here: the point is momentarily at rest.'}
      </figcaption>
    </figure>
  );
}
