import { LineChart } from './LineChart';
import type { ChartFrame, Point, ScaleType, SeriesTone } from './types';

export interface RunningValueProps extends ChartFrame {
  /** The sequence, in order. Index on the x axis, value on the y axis. */
  values: readonly number[];
  /** Index of values[0]. Sequences usually start at 1, partial sums sometimes at 0. */
  startIndex?: number;
  /** The value the reader expects it to approach. Drawn as a dashed rule. */
  target?: { at: number; label?: string; tone?: 'primary' | 'break' };
  /** Emphasise one term — typically the one the widget's slider is sitting on. */
  highlightIndex?: number;
  tone?: SeriesTone;
  yScale?: ScaleType;
  yDomain?: readonly [number, number];
  label?: string;
}

/**
 * A sequence plotted against its index, with the value it is supposed to be
 * approaching. The chart for 'does this converge, and to what' — which is most
 * of what these modules argue about.
 */
export function RunningValue({
  values,
  startIndex = 1,
  target,
  highlightIndex,
  tone = 'primary',
  yScale = 'linear',
  yDomain,
  label = 'value',
  width,
  height,
  xLabel = 'n',
  yLabel,
  ariaLabel,
  caption,
}: RunningValueProps) {
  const points: Point[] = values.map((v, i) => [startIndex + i, v] as Point);
  const highlight =
    highlightIndex !== undefined && highlightIndex >= startIndex
      ? points[highlightIndex - startIndex]
      : undefined;

  return (
    <LineChart
      series={[
        {
          id: 'running',
          label,
          points,
          tone,
          markers: values.length <= 40,
        },
        ...(highlight
          ? [
              {
                id: 'highlight',
                label: `n = ${highlight[0]}`,
                points: [highlight],
                tone: 'break' as SeriesTone,
                markers: true,
              },
            ]
          : []),
      ]}
      rules={target ? [target] : []}
      yScale={yScale}
      {...(yDomain ? { yDomain } : {})}
      {...(width !== undefined ? { width } : {})}
      {...(height !== undefined ? { height } : {})}
      xLabel={xLabel}
      {...(yLabel !== undefined ? { yLabel } : {})}
      ariaLabel={ariaLabel}
      {...(caption !== undefined ? { caption } : {})}
    />
  );
}
