import type { ScaleLinear, ScaleLogarithmic } from 'd3-scale';
import { formatTick } from './types';

export type NumericScale = ScaleLinear<number, number> | ScaleLogarithmic<number, number>;

interface AxesProps {
  x: NumericScale;
  y: NumericScale;
  innerWidth: number;
  innerHeight: number;
  xLabel?: string;
  yLabel?: string;
  xTickCount?: number;
  yTickCount?: number;
}

/**
 * Grid, ticks and axis titles for a cartesian chart. Shared by every chart so
 * that two modules never disagree about what an axis looks like.
 */
export function Axes({
  x,
  y,
  innerWidth,
  innerHeight,
  xLabel,
  yLabel,
  xTickCount = 6,
  yTickCount = 5,
}: AxesProps) {
  const xTicks = x.ticks(xTickCount);
  const yTicks = y.ticks(yTickCount);

  return (
    <g aria-hidden="true">
      {yTicks.map((t) => (
        <line
          key={`gy-${t}`}
          className="grid-line"
          x1={0}
          x2={innerWidth}
          y1={y(t)}
          y2={y(t)}
        />
      ))}

      <line className="axis-line" x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} />
      <line className="axis-line" x1={0} x2={0} y1={0} y2={innerHeight} />

      {xTicks.map((t) => (
        <g key={`tx-${t}`} transform={`translate(${x(t)},${innerHeight})`}>
          <line className="tick-line" y2={5} />
          <text className="tick-label" y={18} textAnchor="middle">
            {formatTick(t)}
          </text>
        </g>
      ))}

      {yTicks.map((t) => (
        <g key={`ty-${t}`} transform={`translate(0,${y(t)})`}>
          <line className="tick-line" x2={-5} />
          <text className="tick-label" x={-9} dy="0.32em" textAnchor="end">
            {formatTick(t)}
          </text>
        </g>
      ))}

      {xLabel ? (
        <text className="axis-title" x={innerWidth} y={innerHeight + 34} textAnchor="end">
          {xLabel}
        </text>
      ) : null}

      {yLabel ? (
        <text
          className="axis-title"
          transform={`translate(${-42},0) rotate(-90)`}
          textAnchor="end"
        >
          {yLabel}
        </text>
      ) : null}
    </g>
  );
}
