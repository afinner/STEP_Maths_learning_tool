import { scaleLinear } from 'd3-scale';
import { formatTick, TONE_VAR, type ChartFrame, type SeriesTone } from './types';

export interface NumberLineInterval {
  from: number;
  to: number;
  /** The interval continues past the window's edge: drawn with an arrowhead. */
  clipFrom?: boolean;
  clipTo?: boolean;
}

export interface NumberLineRow {
  id: string;
  label: string;
  intervals: readonly NumberLineInterval[];
  tone?: SeriesTone;
}

export interface NumberLineMark {
  at: number;
  label?: string;
  tone?: SeriesTone;
  /** Open circle for an excluded point, filled for included. */
  open?: boolean;
}

export interface NumberLineProps extends ChartFrame {
  domain: readonly [number, number];
  /** Rows of intervals, drawn bottom-up above the line, each with a label at the left. */
  rows: readonly NumberLineRow[];
  marks?: readonly NumberLineMark[];
  tickCount?: number;
}

const ROW_HEIGHT = 26;
const BAR = 10;

/**
 * Several sets on one line, one row each: a solution set, what a step
 * produced, and where they disagree. Rows rather than overlays, because two of
 * these routinely cover the same stretch and the later one would hide the
 * earlier.
 */
export function NumberLine({
  domain,
  rows,
  marks = [],
  tickCount = 8,
  width = 640,
  ariaLabel,
  caption,
  xLabel,
}: NumberLineProps) {
  const m = { top: 14, right: 20, bottom: 36, left: 96 };
  const innerWidth = width - m.left - m.right;
  const axisY = m.top + rows.length * ROW_HEIGHT + 8;
  const height = axisY + m.bottom;

  const x = scaleLinear()
    .domain([...domain] as [number, number])
    .range([0, innerWidth]);
  const ticks = x.ticks(tickCount);
  const arrow = 7;

  return (
    <figure className="chart-figure">
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${m.left},0)`}>
          {rows.map((row, r) => {
            const colour = TONE_VAR[row.tone ?? 'primary'];
            const y = m.top + (rows.length - 1 - r) * ROW_HEIGHT + ROW_HEIGHT / 2;
            return (
              <g key={row.id}>
                <text className="row-label" x={-10} y={y} dy="0.32em" textAnchor="end">
                  {row.label}
                </text>
                <line
                  className="row-guide"
                  x1={0}
                  x2={innerWidth}
                  y1={y}
                  y2={y}
                />
                {row.intervals.map((iv, i) => {
                  const from = x(Math.max(domain[0], Math.min(iv.from, iv.to)));
                  const to = x(Math.min(domain[1], Math.max(iv.from, iv.to)));
                  const left = iv.clipFrom ? from + arrow : from;
                  const right = iv.clipTo ? to - arrow : to;
                  return (
                    <g key={i} fill={colour}>
                      <rect
                        x={left}
                        y={y - BAR / 2}
                        width={Math.max(1, right - left)}
                        height={BAR}
                        rx={2}
                        opacity={0.9}
                      />
                      {iv.clipFrom ? (
                        <path d={`M${from},${y} l${arrow},${-BAR / 2} v${BAR} z`} />
                      ) : null}
                      {iv.clipTo ? (
                        <path d={`M${to},${y} l${-arrow},${-BAR / 2} v${BAR} z`} />
                      ) : null}
                    </g>
                  );
                })}
                {row.intervals.length === 0 ? (
                  <text className="row-empty" x={4} y={y} dy="0.32em">
                    empty
                  </text>
                ) : null}
              </g>
            );
          })}

          <line className="axis-line" x1={0} x2={innerWidth} y1={axisY} y2={axisY} />

          {ticks.map((t) => (
            <g key={`t-${t}`} transform={`translate(${x(t)},${axisY})`} aria-hidden="true">
              <line className="tick-line" y2={6} />
              <text className="tick-label" y={20} textAnchor="middle">
                {formatTick(t)}
              </text>
            </g>
          ))}

          {marks.map((mk, i) => {
            const colour = TONE_VAR[mk.tone ?? 'primary'];
            const top = m.top - 4;
            return (
              <g key={`m-${i}`} transform={`translate(${x(mk.at)},0)`}>
                <line
                  x1={0}
                  x2={0}
                  y1={top}
                  y2={axisY}
                  stroke={colour}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <circle
                  cy={axisY}
                  r={5}
                  fill={mk.open ? 'var(--paper-raised)' : colour}
                  stroke={colour}
                  strokeWidth={2}
                />
                {mk.label ? (
                  <text className="tick-label" y={top - 4} textAnchor="middle" fill={colour}>
                    {mk.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {xLabel ? (
            <text className="axis-title" x={innerWidth} y={axisY + 32} textAnchor="end">
              {xLabel}
            </text>
          ) : null}
        </g>
      </svg>
      {caption ? <figcaption className="chart-caption">{caption}</figcaption> : null}
    </figure>
  );
}
