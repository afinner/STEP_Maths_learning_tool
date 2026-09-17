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
  type SeriesTone,
} from './types';

export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
  tone?: SeriesTone;
  open?: boolean;
}

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
  /** Vertical reference lines, in x units: where the reader is, and where the interesting points are. */
  guides?: readonly {
    at: number;
    label?: string;
    tone?: 'primary' | 'break';
    /** Where the label sits. Two guides close together can take one end each. */
    labelAt?: 'top' | 'bottom';
  }[];
  /** Single marked points: the reader's current position on a curve. */
  points?: readonly ChartPoint[];
  xTickCount?: number;
  yTickCount?: number;
}

function extent(values: readonly number[], positiveOnly: boolean): [number, number] {
  const usable = values.filter((v) => Number.isFinite(v) && (!positiveOnly || v > 0));
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
 * not), functions and their approximations, error against n. Non-finite values
 * break the line rather than being drawn, so a curve that leaves the frame is
 * seen leaving.
 */
export function LineChart({
  series,
  xScale = 'linear',
  yScale = 'linear',
  xDomain,
  yDomain,
  bands = [],
  rules = [],
  guides = [],
  points = [],
  width = 640,
  height = 320,
  xLabel,
  yLabel,
  ariaLabel,
  caption,
  xTickCount,
  yTickCount,
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

  const inFrame = (px: number, py: number) =>
    Number.isFinite(px) &&
    Number.isFinite(py) &&
    (xScale !== 'log' || px > 0) &&
    (yScale !== 'log' || py > 0);

  const path = d3line<readonly [number, number]>()
    .x((p) => x(p[0]))
    .y((p) => y(p[1]))
    .defined((p) => inFrame(p[0], p[1]));

  const clampX = (v: number) => Math.max(0, Math.min(innerWidth, x(v)));

  return (
    <figure className="chart-figure">
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${m.left},${m.top})`}>
          {bands.map((b, i) => {
            const from = Math.min(clampX(b.from), clampX(b.to));
            const to = Math.max(clampX(b.from), clampX(b.to));
            return (
              <g key={`band-${i}`}>
                <rect
                  x={from}
                  y={0}
                  width={Math.max(0, to - from)}
                  height={innerHeight}
                  fill={b.tone === 'break' ? 'var(--chart-band-break)' : 'var(--chart-band)'}
                />
                {b.label ? (
                  // Break-tone labels sit at the foot of the band, primary at
                  // the head, so two bands covering the same stretch can both
                  // be read.
                  <text
                    className="tick-label"
                    x={(from + to) / 2}
                    y={(b.labelAt ?? (b.tone === 'break' ? 'bottom' : 'top')) === 'bottom' ? innerHeight - 6 : 12}
                    textAnchor="middle"
                    fill={b.tone === 'break' ? 'var(--chart-2)' : 'var(--chart-1)'}
                  >
                    {b.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          <Axes
            x={x}
            y={y}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            xLabel={xLabel}
            yLabel={yLabel}
            {...(xTickCount !== undefined ? { xTickCount } : {})}
            {...(yTickCount !== undefined ? { yTickCount } : {})}
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
                  x={4}
                  y={y(r.at) - 6}
                  textAnchor="start"
                  fill={r.tone === 'break' ? 'var(--chart-2)' : 'var(--ink-faint)'}
                >
                  {r.label}
                </text>
              ) : null}
            </g>
          ))}

          {guides.map((g, i) => (
            <g key={`guide-${i}`}>
              <line
                x1={x(g.at)}
                x2={x(g.at)}
                y1={0}
                y2={innerHeight}
                stroke={g.tone === 'break' ? 'var(--chart-2)' : 'var(--chart-axis)'}
                strokeDasharray={g.tone === 'break' ? undefined : '3 3'}
                strokeWidth={g.tone === 'break' ? 1.5 : 1}
              />
              {g.label ? (
                <text
                  className="tick-label"
                  x={x(g.at)}
                  y={g.labelAt === 'bottom' ? innerHeight - 6 : -2}
                  textAnchor="middle"
                  fill={g.tone === 'break' ? 'var(--chart-2)' : 'var(--ink-faint)'}
                >
                  {g.label}
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
                  ? s.points
                      .filter((p) => inFrame(p[0], p[1]))
                      .map((p, i) => (
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

          {points
            .filter((p) => inFrame(p.x, p.y))
            .map((p, i) => {
              const colour = TONE_VAR[p.tone ?? 'primary'];
              return (
                <g key={`pt-${i}`} transform={`translate(${x(p.x)},${y(p.y)})`}>
                  <circle
                    r={5}
                    fill={p.open ? 'var(--paper-raised)' : colour}
                    stroke={colour}
                    strokeWidth={2}
                  />
                  {p.label ? (
                    <text className="tick-label" x={8} dy="0.32em" fill={colour}>
                      {p.label}
                    </text>
                  ) : null}
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
                className={`swatch${s.dashed ? ' swatch-dashed' : ''}`}
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
