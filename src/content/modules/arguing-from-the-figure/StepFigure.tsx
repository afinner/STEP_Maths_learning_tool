import { scaleLinear } from 'd3-scale';
import { type Point, type StepPlacement, type StepTriangle } from './compute';

/**
 * The featured question's triangle: base AB of length 1, angles alpha and
 * beta, and one root of (*) drawn as the points P and Q it places. The
 * roots the figure does not show are as real as the one it does.
 */

const WIDTH = 460;
const HEIGHT = 400;

export function StepFigure({
  triangle,
  placement,
  alphaDegrees,
  betaDegrees,
}: {
  triangle: StepTriangle;
  placement: StepPlacement | null;
  alphaDegrees: number;
  betaDegrees: number;
}) {
  const points: Point[] = [triangle.a, triangle.b, triangle.c];
  if (placement) points.push(placement.p, placement.q);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const pad = 0.35;
  const lo = { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad };
  const hi = { x: Math.max(...xs) + pad, y: Math.max(...ys) + pad };
  // One scale for both axes, so the triangle is not distorted.
  const span = Math.max(hi.x - lo.x, (hi.y - lo.y) * (WIDTH / HEIGHT));
  const cx = (lo.x + hi.x) / 2;
  const cy = (lo.y + hi.y) / 2;
  const x = scaleLinear().domain([cx - span / 2, cx + span / 2]).range([0, WIDTH]);
  const y = scaleLinear()
    .domain([cy - (span * HEIGHT) / WIDTH / 2, cy + (span * HEIGHT) / WIDTH / 2])
    .range([HEIGHT, 0]);

  const seg = (from: Point, to: Point, stroke: string, width = 1.5, dashed = false) => (
    <line
      x1={x(from.x)}
      y1={y(from.y)}
      x2={x(to.x)}
      y2={y(to.y)}
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dashed ? '4 4' : undefined}
      strokeLinecap="round"
    />
  );
  const extend = (from: Point, to: Point, k: number): Point => ({
    x: from.x + (to.x - from.x) * k,
    y: from.y + (to.y - from.y) * k,
  });
  const label = (at: Point, text: string, dx: number, dy: number) => (
    <text className="figure-label" x={x(at.x) + dx} y={y(at.y) + dy}>
      {text}
    </text>
  );

  const { a, b, c } = triangle;
  const description = placement
    ? `Triangle with base AB of length 1, angles ${alphaDegrees} and ${betaDegrees} degrees. For x = ${placement.x.toFixed(3)}, P is ${placement.sigmaP >= 0 ? 'on' : 'beyond'} the side AC and Q is ${placement.sigmaQ >= 0 ? 'on' : 'beyond'} the side BC.`
    : `Triangle with base AB of length 1, angles ${alphaDegrees} and ${betaDegrees} degrees. The equation has no real root here.`;

  return (
    <figure className="chart-figure figure-frame">
      <svg className="chart figure" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={description}>
        {/* The sides produced, faintly, so a point beyond a vertex has a line to sit on. */}
        {placement ? (
          <>
            {seg(a, extend(a, c, Math.max(1.05, placement.tP + 0.1)), 'var(--chart-grid)', 1)}
            {seg(b, extend(b, c, Math.max(1.05, placement.tQ + 0.1)), 'var(--chart-grid)', 1)}
            {placement.tP < 0 ? seg(a, extend(a, c, placement.tP - 0.1), 'var(--chart-grid)', 1) : null}
            {placement.tQ < 0 ? seg(b, extend(b, c, placement.tQ - 0.1), 'var(--chart-grid)', 1) : null}
          </>
        ) : null}
        {seg(a, b, 'var(--ink)', 2)}
        {seg(a, c, 'var(--ink)', 2)}
        {seg(b, c, 'var(--ink)', 2)}

        {placement ? (
          <>
            {/* The three equal lengths. */}
            {seg(a, placement.p, 'var(--chart-1)', 3)}
            {seg(placement.p, placement.q, 'var(--chart-1)', 3)}
            {seg(placement.q, b, 'var(--chart-1)', 3)}
            {/* The line through P parallel to AB, for the angle theta. */}
            {seg(extend(placement.p, { x: placement.p.x + 1, y: placement.p.y }, -0.35), extend(placement.p, { x: placement.p.x + 1, y: placement.p.y }, 0.6), 'var(--ink-faint)', 1, true)}
            <circle cx={x(placement.p.x)} cy={y(placement.p.y)} r={5} fill={placement.sigmaP >= 0 ? 'var(--chart-3)' : 'var(--chart-2)'} />
            <circle cx={x(placement.q.x)} cy={y(placement.q.y)} r={5} fill={placement.sigmaQ >= 0 ? 'var(--chart-3)' : 'var(--chart-2)'} />
            {label(placement.p, 'P', -16, -8)}
            {label(placement.q, 'Q', 10, -8)}
          </>
        ) : null}

        <circle cx={x(a.x)} cy={y(a.y)} r={4} fill="var(--ink)" />
        <circle cx={x(b.x)} cy={y(b.y)} r={4} fill="var(--ink)" />
        <circle cx={x(c.x)} cy={y(c.y)} r={4} fill="var(--ink)" />
        {label(a, 'A', -16, 18)}
        {label(b, 'B', 8, 18)}
        {label(c, 'C', 8, -8)}
      </svg>
      <figcaption className="chart-caption">
        AB = 1, with angles α = {alphaDegrees}° at A and β = {betaDegrees}° at B. Blue: the three equal lengths AP, PQ, QB. Green points lie on their sides; orange ones have passed a vertex.
      </figcaption>
    </figure>
  );
}
