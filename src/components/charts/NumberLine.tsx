import { scaleLinear } from 'd3-scale';
import { formatTick, type ChartFrame } from './types';

export interface NumberLineMark {
  at: number;
  label?: string;
  tone?: 'primary' | 'break';
  /** Open circle for an excluded endpoint, filled for included. */
  open?: boolean;
}

export interface NumberLineInterval {
  from: number;
  to: number;
  label?: string;
  tone?: 'primary' | 'break';
}

export interface NumberLineProps extends ChartFrame {
  domain: readonly [number, number];
  intervals?: readonly NumberLineInterval[];
  marks?: readonly NumberLineMark[];
  tickCount?: number;
}

/**
 * A number line with shaded intervals. For claims about where something holds:
 * domains of convergence, regions of validity, the gap between them.
 */
export function NumberLine({
  domain,
  intervals = [],
  marks = [],
  tickCount = 8,
  width = 640,
  height = 120,
  ariaLabel,
  caption,
  xLabel,
}: NumberLineProps) {
  const m = { top: 28, right: 24, bottom: 34, left: 24 };
  const innerWidth = width - m.left - m.right;
  const axisY = height - m.bottom - m.top;

  const x = scaleLinear()
    .domain([...domain] as [number, number])
    .range([0, innerWidth]);
  const ticks = x.ticks(tickCount);

  return (
    <figure>
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${m.left},${m.top})`}>
          {intervals.map((iv, i) => {
            const from = Math.min(x(iv.from), x(iv.to));
            const to = Math.max(x(iv.from), x(iv.to));
            const colour = iv.tone === 'break' ? 'var(--chart-2)' : 'var(--chart-1)';
            return (
              <g key={`iv-${i}`}>
                <rect
                  x={from}
                  y={axisY - 16}
                  width={Math.max(1, to - from)}
                  height={32}
                  fill={
                    iv.tone === 'break' ? 'var(--chart-band-break)' : 'var(--chart-band)'
                  }
                />
                <line
                  x1={from}
                  x2={to}
                  y1={axisY}
                  y2={axisY}
                  stroke={colour}
                  strokeWidth={3}
                />
                {iv.label ? (
                  <text
                    className="tick-label"
                    x={(from + to) / 2}
                    y={axisY - 22}
                    textAnchor="middle"
                    fill={colour}
                  >
                    {iv.label}
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
            const colour = mk.tone === 'break' ? 'var(--chart-2)' : 'var(--chart-1)';
            return (
              <g key={`m-${i}`} transform={`translate(${x(mk.at)},${axisY})`}>
                <circle
                  r={5}
                  fill={mk.open ? 'var(--paper-raised)' : colour}
                  stroke={colour}
                  strokeWidth={2}
                />
                {mk.label ? (
                  <text className="tick-label" y={-14} textAnchor="middle" fill={colour}>
                    {mk.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {xLabel ? (
            <text className="axis-title" x={innerWidth} y={axisY + 34} textAnchor="end">
              {xLabel}
            </text>
          ) : null}
        </g>
      </svg>
      {caption ? <figcaption className="chart-caption">{caption}</figcaption> : null}
    </figure>
  );
}
