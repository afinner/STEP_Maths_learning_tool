import { useRef, type PointerEvent } from 'react';
import { scaleLinear } from 'd3-scale';
import {
  A_X_TENTHS,
  A_Y_TENTHS,
  B,
  C,
  circumcircle,
  drawnFigure,
  isFigure,
  trueFigure,
  unitsToTenths,
  type Params,
  type Point,
  type View,
} from './compute';

/**
 * The figure, as it really is or as it gets drawn.
 *
 * A is the only thing that moves. Drag it with the pointer, or use the
 * sliders beside the figure. Everything else — P, the feet, which foot has
 * left its side — is computed from where A stands, never placed by hand.
 */

const WIDTH = 460;
const HEIGHT = 560;
const X_RANGE: readonly [number, number] = [-3, 15];
const Y_RANGE: readonly [number, number] = [-9.5, 12.5];

const x = scaleLinear().domain(X_RANGE).range([0, WIDTH]);
// y grows upwards in the plane and downwards in SVG.
const y = scaleLinear().domain(Y_RANGE).range([HEIGHT, 0]);

function Label({ at, text, dx = 8, dy = -8 }: { at: Point; text: string; dx?: number; dy?: number }) {
  return (
    <text className="figure-label" x={x(at.x) + dx} y={y(at.y) + dy}>
      {text}
    </text>
  );
}

function Segment({
  from,
  to,
  stroke = 'var(--ink-muted)',
  width = 1.5,
  dashed = false,
}: {
  from: Point;
  to: Point;
  stroke?: string;
  width?: number;
  dashed?: boolean;
}) {
  return (
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
}

/** A right-angle mark at `corner`, opening towards `along` and `across`. */
function RightAngle({ corner, along, across }: { corner: Point; along: Point; across: Point }) {
  const size = 0.45;
  const u = unit({ x: along.x - corner.x, y: along.y - corner.y });
  const v = unit({ x: across.x - corner.x, y: across.y - corner.y });
  const p1 = { x: corner.x + u.x * size, y: corner.y + u.y * size };
  const p2 = { x: corner.x + (u.x + v.x) * size, y: corner.y + (u.y + v.y) * size };
  const p3 = { x: corner.x + v.x * size, y: corner.y + v.y * size };
  return (
    <path
      d={`M${x(p1.x)},${y(p1.y)} L${x(p2.x)},${y(p2.y)} L${x(p3.x)},${y(p3.y)}`}
      fill="none"
      stroke="var(--ink-faint)"
      strokeWidth={1}
    />
  );
}

function unit(p: Point): Point {
  const length = Math.hypot(p.x, p.y) || 1;
  return { x: p.x / length, y: p.y / length };
}

/** Extend the segment from `from` through `to` by a fraction of its length. */
function beyond(from: Point, to: Point, factor: number): Point {
  return { x: to.x + (to.x - from.x) * factor, y: to.y + (to.y - from.y) * factor };
}

export interface FigureProps {
  params: Params;
  view: View;
  onMove: (patch: Partial<Params>) => void;
}

export function Figure({ params, view, onMove }: FigureProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const a: Point = { x: params.xTenths / 10, y: params.yTenths / 10 };
  const result = trueFigure(a);
  const drawn = drawnFigure(a);
  const circle = circumcircle(a);
  const showTrue = view === 'true';

  /**
   * Screen to plane, through the SVG's own transform. The element can be
   * letterboxed inside its box (its height is capped), so dividing by the
   * bounding rectangle would put A somewhere the pointer is not.
   */
  const toPlane = (event: PointerEvent<SVGSVGElement>): Point | null => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: x.invert(local.x), y: y.invert(local.y) };
  };

  const moveTo = (plane: Point) => {
    const xTenths = Math.max(A_X_TENTHS.min, Math.min(A_X_TENTHS.max, unitsToTenths(plane.x)));
    const yTenths = Math.max(A_Y_TENTHS.min, Math.min(A_Y_TENTHS.max, unitsToTenths(plane.y)));
    if (xTenths !== params.xTenths || yTenths !== params.yTenths) onMove({ xTenths, yTenths });
  };

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    const plane = toPlane(event);
    if (!plane) return;
    dragging.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A synthetic event has no pointer to capture; dragging still works without it.
    }
    moveTo(plane);
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const plane = toPlane(event);
    if (plane) moveTo(plane);
  };
  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Nothing was captured.
    }
  };

  const m: Point = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const figure = showTrue ? (isFigure(result) ? result : null) : drawn;

  const description = !figure
    ? `A is at (${a.x.toFixed(1)}, ${a.y.toFixed(1)}), directly above the midpoint of BC, so AB = AC and the two lines of the construction coincide.`
    : showTrue
      ? `A is at (${a.x.toFixed(1)}, ${a.y.toFixed(1)}). P lies below BC on the circle through A, B and C. The foot ${figure.f.inside ? 'G on AC' : 'F on AB'} has passed its vertex.`
      : `A is at (${a.x.toFixed(1)}, ${a.y.toFixed(1)}). The figure as drawn: P inside the triangle, both feet inside their sides.`;

  return (
    <figure className="chart-figure figure-frame">
      <svg
        ref={svgRef}
        className="chart figure"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={description}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        {/* The circle P lies on, in the true view. */}
        {showTrue && circle ? (
          <circle
            cx={x(circle.centre.x)}
            cy={y(circle.centre.y)}
            r={x(circle.radius) - x(0)}
            fill="none"
            stroke="var(--chart-grid)"
            strokeWidth={1.5}
          />
        ) : null}

        {/* The sides, produced a little past each vertex so a foot outside has a line to sit on. */}
        {figure ? (
          <>
            <Segment from={a} to={beyond(a, B, 0.3)} stroke="var(--chart-grid)" width={1} />
            <Segment from={a} to={beyond(a, C, 0.3)} stroke="var(--chart-grid)" width={1} />
          </>
        ) : null}

        {/* The triangle. */}
        <Segment from={a} to={B} stroke="var(--ink)" width={2} />
        <Segment from={a} to={C} stroke="var(--ink)" width={2} />
        <Segment from={B} to={C} stroke="var(--ink)" width={2} />

        {figure ? (
          <>
            {/* The bisector of angle A, and the line through M that is supposed to be perpendicular to BC. */}
            <Segment from={a} to={beyond(a, figure.p, 0.15)} stroke="var(--chart-1)" width={1.2} dashed />
            <Segment from={m} to={beyond(m, figure.p, 0.15)} stroke="var(--chart-1)" width={1.2} dashed />
            {showTrue ? <RightAngle corner={m} along={C} across={figure.p} /> : null}

            {/* The perpendiculars from P to the two sides. */}
            <Segment from={figure.p} to={figure.f.point} stroke="var(--chart-3)" width={1.2} dashed />
            <Segment from={figure.p} to={figure.g.point} stroke="var(--chart-3)" width={1.2} dashed />
            <RightAngle corner={figure.f.point} along={a} across={figure.p} />
            <RightAngle corner={figure.g.point} along={a} across={figure.p} />

            {/* A foot that has passed its vertex: the piece between vertex and foot, which the
                argument added when it should have subtracted. */}
            {!figure.f.inside ? <Segment from={B} to={figure.f.point} stroke="var(--chart-2)" width={4} /> : null}
            {!figure.g.inside ? <Segment from={C} to={figure.g.point} stroke="var(--chart-2)" width={4} /> : null}

            <circle cx={x(figure.p.x)} cy={y(figure.p.y)} r={5} fill="var(--chart-1)" />
            <circle cx={x(figure.f.point.x)} cy={y(figure.f.point.y)} r={4} fill={figure.f.inside ? 'var(--chart-3)' : 'var(--chart-2)'} />
            <circle cx={x(figure.g.point.x)} cy={y(figure.g.point.y)} r={4} fill={figure.g.inside ? 'var(--chart-3)' : 'var(--chart-2)'} />
            <Label at={figure.p} text="P" dx={10} dy={14} />
            <Label at={figure.f.point} text="F" dx={-16} dy={4} />
            <Label at={figure.g.point} text="G" dx={10} dy={4} />
          </>
        ) : (
          <Segment from={a} to={beyond(a, m, 1.2)} stroke="var(--chart-2)" width={2} dashed />
        )}

        <circle cx={x(m.x)} cy={y(m.y)} r={3} fill="var(--ink-muted)" />
        <Label at={m} text="M" dx={-6} dy={18} />
        <circle cx={x(B.x)} cy={y(B.y)} r={4} fill="var(--ink)" />
        <circle cx={x(C.x)} cy={y(C.y)} r={4} fill="var(--ink)" />
        <Label at={B} text="B" dx={-16} dy={18} />
        <Label at={C} text="C" dx={8} dy={18} />

        {/* A: the handle. */}
        <circle cx={x(a.x)} cy={y(a.y)} r={12} fill="var(--accent-wash)" stroke="var(--accent)" strokeWidth={1.5} />
        <circle cx={x(a.x)} cy={y(a.y)} r={5} fill="var(--accent)" />
        <Label at={a} text="A" dx={14} dy={-6} />
      </svg>
      <figcaption className="chart-caption">
        Drag A. {showTrue
          ? 'Solid blue: P, where the bisector of angle A really meets the perpendicular bisector of BC. Orange: the piece of a side between a vertex and the foot that has passed it.'
          : 'The figure as it gets drawn, with P inside the triangle. The line from M to P is no longer perpendicular to BC.'}
      </figcaption>
    </figure>
  );
}
