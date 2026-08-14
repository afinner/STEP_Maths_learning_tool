/**
 * Shared chart vocabulary.
 *
 * Charts here are thin: d3-scale computes positions, d3-shape computes path
 * strings, React emits the SVG. There is no chart library and no runtime
 * measurement — every chart draws into a fixed viewBox and scales with CSS, so
 * it is responsive without JavaScript and renders identically on the server.
 *
 * Colour never appears as a literal. Series pick a token slot, so light and
 * dark mode are handled entirely by tokens.css.
 */

export type Point = readonly [x: number, y: number];

/** Token slots for series colour, in preference order. */
export type SeriesTone = 'primary' | 'break' | 'repair' | 'alt';

export const TONE_VAR: Record<SeriesTone, string> = {
  primary: 'var(--chart-1)',
  break: 'var(--chart-2)',
  repair: 'var(--chart-3)',
  alt: 'var(--chart-4)',
};

export interface Series {
  id: string;
  label: string;
  points: readonly Point[];
  tone?: SeriesTone;
  /** Dashed lines read as 'the thing being approached' — limits, bounds, targets. */
  dashed?: boolean;
  /** Draw a dot at each sample. Use for small n, where the samples are the point. */
  markers?: boolean;
}

export interface Band {
  from: number;
  to: number;
  label?: string;
  tone?: 'primary' | 'break';
}

export type ScaleType = 'linear' | 'log';

export interface ChartFrame {
  /** viewBox width. Not a pixel width — the SVG scales to its container. */
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  /** Sentence describing what the chart shows, for screen readers. Required. */
  ariaLabel: string;
  caption?: string;
}

export const DEFAULT_MARGIN = { top: 12, right: 16, bottom: 40, left: 52 } as const;

/** Ticks are formatted for reading, not for precision. */
export function formatTick(value: number): string {
  const abs = Math.abs(value);
  if (value === 0) return '0';
  if (abs >= 10000 || abs < 0.001) return value.toExponential(0).replace('e+', 'e');
  if (Number.isInteger(value)) return String(value);
  if (abs >= 100) return value.toFixed(0);
  if (abs >= 1) return value.toFixed(2).replace(/\.?0+$/, '');
  return value.toFixed(3).replace(/\.?0+$/, '');
}
