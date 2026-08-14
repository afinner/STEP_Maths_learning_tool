import { scaleLinear, scaleLog } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import { Axes } from './Axes';
import {
  DEFAULT_MARGIN,
  TONE_VAR,
  type Band,
  type ChartFrame,
  type ScaleType,
  type Series,
} from './types';

export interface LineChartProps extends ChartFrame {
  series: readonly Series[];
  xScale?: ScaleType;
  yScale?: ScaleType;
  /** Override the computed domain. Useful when the point is that a curve leaves the frame. */
  xDomain?: readonly [number, number];
  yDomain?: readonly [number, number];
  /** Shaded vertical regions, in x units — 'here is where it breaks'. */
  bands?: readonly Band[];
  /** Horizontal reference lines, in y units — limits, bounds, targets. */
  rules?: readonly { at: number; label?: string; tone?: 'primary' | 'break' }[];
}

function extent(values: readonly number[], positiveOnly: boolean): [number, number] {
  const usable = positiveOnly ? values.filter((v) => v > 0) : values;
  if (usable.length === 0) return [0, 1];
  let min = usable[0] as number;
  let max = usable[0] as number;
  for (const v of usable) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === max) return positiveOnly ? [min / 2, max * 2] : [min - 1, max + 1];
  return [min, max];
}

/**
 * A line chart with optional log axes. The workhorse: sequences converging (or
 * not), functions and their approximations, error against n.
 */
export function LineChart({
  series,
  xScale = 'linear',
  yScale = 'linear',
  xDomain,
  yDomain,
  bands = [],
  rules = [],
  width = 640,
  height = 340,
  xLabel,
  yLabel,
  ariaLabel,
  caption,
}: LineChartProps) {
  const m = DEFAULT_MARGIN;
  const innerWidth = width - m.left - m.right;
  const innerHeight = height - m.top - m.bottom;

  const allX = series.flatMap((s) => s.points.map((p) => p[0]));
  const allY = series.flatMap((s) => s.points.map((p) => p[1]));
  const ruleYs = rules.map((r) => r.at);

  const xd = xDomain ?? extent(allX, xScale === 'log');
  const yd = yDomain ?? extent([...allY, ...ruleYs], yScale === 'log');

  const x = (xScale === 'log' ? scaleLog() : scaleLinear())
    .domain([...xd] as [number, number])
    .range([0, innerWidth]);
  const y = (yScale === 'log' ? scaleLog() : scaleLinear())
    .domain([...yd] as [number, number])
    .range([innerHeight, 0]);
  if (!yDomain && yScale === 'linear') y.nice();

  const path = d3line<readonly [number, number]>()
    .x((p) => x(p[0]))
    .y((p) => y(p[1]))
    .defined(
      (p) =>
        Number.isFinite(p[0]) &&
        Number.isFinite(p[1]) &&
        (xScale !== 'log' || p[0] > 0) &&
        (yScale !== 'log' || p[1] > 0),
    );

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
          {bands.map((b, i) => {
            const from = Math.min(x(b.from), x(b.to));
            const to = Math.max(x(b.from), x(b.to));
            return (
              <rect
                key={`band-${i}`}
                x={from}
                y={0}
                width={Math.max(0, to - from)}
                height={innerHeight}
                fill={b.tone === 'break' ? 'var(--chart-band-break)' : 'var(--chart-band)'}
              />
            );
          })}

          <Axes
            x={x}
            y={y}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            xLabel={xLabel}
            yLabel={yLabel}
          />

          {rules.map((r, i) => (
            <g key={`rule-${i}`}>
              <line
                x1={0}
                x2={innerWidth}
                y1={y(r.at)}
                y2={y(r.at)}
                stroke={r.tone === 'break' ? 'var(--chart-2)' : 'var(--chart-axis)'}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              {r.label ? (
                <text
                  className="tick-label"
                  x={innerWidth}
                  y={y(r.at) - 5}
                  textAnchor="end"
                  fill={r.tone === 'break' ? 'var(--chart-2)' : 'var(--ink-faint)'}
                >
                  {r.label}
                </text>
              ) : null}
            </g>
          ))}

          {series.map((s) => {
            const colour = TONE_VAR[s.tone ?? 'primary'];
            const d = path(s.points) ?? '';
            return (
              <g key={s.id}>
                <path
                  className="series"
                  d={d}
                  stroke={colour}
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                />
                {s.markers
                  ? s.points.map((p, i) => (
                      <circle
                        key={`${s.id}-${i}`}
                        className="point"
                        cx={x(p[0])}
                        cy={y(p[1])}
                        r={3}
                        fill={colour}
                      />
                    ))
                  : null}
              </g>
            );
          })}
        </g>
      </svg>

      {series.length > 1 ? (
        <div className="chart-legend">
          {series.map((s) => (
            <span key={s.id}>
              <span
                className="swatch"
                style={{ background: TONE_VAR[s.tone ?? 'primary'] }}
                aria-hidden="true"
              />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}

      {caption ? <figcaption className="chart-caption">{caption}</figcaption> : null}
    </figure>
  );
}
