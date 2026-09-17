import { formatFixed } from '../../../lib/numbers';

/**
 * Module 01 — Small enough to ignore.
 *
 * Every number the reader sees on this page is produced here. Nothing in the
 * prose, the tables or the panels is a literal: if a value appears on screen it
 * came out of a function below, so the page cannot drift away from the maths.
 *
 * Two situations live here:
 *   - the hook, n(sqrt(n^2 + 1) - n), where the answer is the term you dropped;
 *   - the ratio R(theta, alpha), where the same truncation is right at one point
 *     and returns nothing at all at another.
 *
 * The closed form of R, -cot(theta + alpha/2), is the oracle for everything
 * about R in this file.
 */

/* ------------------------------------------------------------------------- *
 * Estimates: a number, or an explicit state of not being one
 * ------------------------------------------------------------------------- */

export type IndeterminateReason =
  /** Every retained term is zero — you truncated away the whole expression. */
  | 'nothing-retained'
  /** The denominator you kept is exactly zero: not small, absent. */
  | 'retained-denominator-vanishes'
  /** A genuine pole: the value grows without bound. */
  | 'divergent'
  /** Asked for a quantity that only exists at a degenerate point. */
  | 'not-degenerate';

export type Estimate =
  | Readonly<{ kind: 'value'; value: number }>
  | Readonly<{ kind: 'indeterminate'; reason: IndeterminateReason }>;

/**
 * NaN and Infinity are not used to signal this. Both propagate silently through
 * arithmetic and both format as something a reader can mistake for a number; the
 * whole argument of the module is that this state is different in kind from a
 * large value, so it is a different return state.
 */
export const indeterminate = (reason: IndeterminateReason): Estimate => ({
  kind: 'indeterminate',
  reason,
});

export const estimate = (value: number): Estimate => ({ kind: 'value', value });

export const isValue = (e: Estimate): e is Readonly<{ kind: 'value'; value: number }> =>
  e.kind === 'value';

/** For tests and comparisons. Never use this to render: it discards the state. */
export function valueOr(e: Estimate, fallback: number): number {
  return isValue(e) ? e.value : fallback;
}

/* ------------------------------------------------------------------------- *
 * The hook: n(sqrt(n^2 + 1) - n)
 * ------------------------------------------------------------------------- */

/** Generalised binomial coefficient C(alpha, k), for the expansion of a root. */
export function binomialCoefficient(alpha: number, k: number): number {
  let c = 1;
  for (let j = 0; j < k; j += 1) c *= (alpha - j) / (j + 1);
  return c;
}

/** How many terms of the correction sqrt(n^2+1) - n = 1/2n - 1/8n^3 + ... are kept. */
export type Terms = 0 | 1 | 2;
export const TERMS: readonly Terms[] = [0, 1, 2];

/** What the reader replaced the root by, at each setting. Plain text: the island does not typeset. */
export const TERM_LABELS: Readonly<Record<Terms, string>> = {
  0: 'n',
  1: 'n + 1/2n',
  2: 'n + 1/2n − 1/8n³',
};

export const hook = {
  text: 'n(√(n² + 1) − n)',
  limit: 0.5,

  /**
   * The true value, computed as n / (sqrt(n^2+1) + n). Algebraically identical,
   * and the reason for the rearrangement is the module's own subject in
   * miniature: evaluating the subtraction directly at n = 10^6 cancels away
   * most of the significant digits of a double and returns 0.500003807. The
   * float arithmetic drops the same term the reader does.
   */
  value: (n: number): number => n / (Math.sqrt(n * n + 1) + n),

  /** The small quantity itself, sqrt(n^2+1) - n, computed the same stable way. */
  small: (n: number): number => 1 / (Math.sqrt(n * n + 1) + n),

  /** The leading term of the small quantity: what rounding the root to n throws away. */
  rawDroppedTerm: (n: number): number => binomialCoefficient(0.5, 1) / n,

  /** The same term after the factor of n outside multiplies it. This is where the answer went. */
  droppedTerm: (n: number): number => n * (binomialCoefficient(0.5, 1) / n),

  /** sqrt(n^2+1) - n with `terms` terms of its expansion kept. Zero terms is the shortcut. */
  correction: (n: number, terms: Terms): number => {
    let total = 0;
    for (let k = 1; k <= terms; k += 1) {
      total += binomialCoefficient(0.5, k) * Math.pow(n, 1 - 2 * k);
    }
    return total;
  },

  /** The whole expression with the root truncated: n times the kept correction. */
  truncated: (n: number, terms: Terms): number => n * hook.correction(n, terms),
} as const;

/** The discarded effect for the hook: how far the truncated answer sits from the true one. */
export function hookError(n: number, terms: Terms): number {
  return Math.abs(hook.value(n) - hook.truncated(n, terms));
}

/**
 * The n control carries an integer k and shows n = 10^(k/10), rounded, so that
 * 1, 10, 100, ... and 10^6 are exactly reachable and the slider is log-spaced.
 */
export const N_SLIDER = { min: 0, max: 60 } as const;

export function nFromSlider(k: number): number {
  return Math.round(Math.pow(10, k / 10));
}

/** The values of n in the hook's table. Inputs, not answers. */
export const HOOK_TABLE_N: readonly number[] = [1, 10, 100, 1_000, 1_000_000];

export interface HookSample {
  n: number;
  small: number;
  value: number;
  truncated: number;
}

/** The three curves of the first panel, sampled at every slider position. */
export function hookSweep(terms: Terms): HookSample[] {
  const samples: HookSample[] = [];
  for (let k = N_SLIDER.min; k <= N_SLIDER.max; k += 1) {
    const n = nFromSlider(k);
    samples.push({
      n,
      small: hook.small(n),
      value: hook.value(n),
      truncated: hook.truncated(n, terms),
    });
  }
  return samples;
}

/* ------------------------------------------------------------------------- *
 * The ratio R(theta, alpha)
 * ------------------------------------------------------------------------- */

export type Order = 0 | 1 | 2 | 3;
export const ORDERS: readonly Order[] = [0, 1, 2, 3];
/** The orders the panel offers. O(1) retains nothing at all and is left to the tests. */
export const PANEL_ORDERS: readonly Order[] = [1, 2, 3];

export const ORDER_LABELS: Readonly<Record<Order, string>> = {
  0: 'O(1)',
  1: 'O(α)',
  2: 'O(α²)',
  3: 'O(α³)',
};

export type Part = 'numerator' | 'denominator';

function factorial(k: number): number {
  let f = 1;
  for (let j = 2; j <= k; j += 1) f *= j;
  return f;
}

/**
 * How close to a zero of sine or cosine counts as being at it.
 *
 * Only theta = 0 is exactly representable among the degenerate points:
 * Math.sin(Math.PI) is 1.2246e-16, so a reader standing on pi would be shown
 * -8.2e15 — a huge finite number in the one place the module needs to say
 * "indeterminate", which is precisely the error the module is about. The
 * tolerance is fifteen orders of magnitude below anything a control can reach.
 */
export const ANGLE_TOLERANCE = 1e-9;

export function sinAt(theta: number): number {
  const s = Math.sin(theta);
  return Math.abs(s) < ANGLE_TOLERANCE ? 0 : s;
}

export function cosAt(theta: number): number {
  const c = Math.cos(theta);
  return Math.abs(c) < ANGLE_TOLERANCE ? 0 : c;
}

/** The points where the first-order denominator dies: theta = k pi. */
export function isDegenerate(theta: number): boolean {
  return sinAt(theta) === 0;
}

/**
 * Coefficient of alpha^k in the expansion about alpha = 0 of
 *
 *   numerator    sin(theta + alpha) - sin(theta) =  cos(theta)(alpha - alpha^3/6 + ...)
 *                                                 + sin(theta)(-alpha^2/2 + ...)
 *   denominator  cos(theta + alpha) - cos(theta) = -sin(theta)(alpha - alpha^3/6 + ...)
 *                                                 + cos(theta)(-alpha^2/2 + ...)
 *
 * Both have no constant term: at alpha = 0 the two points coincide.
 */
export function seriesCoefficient(part: Part, theta: number, k: number): number {
  if (k <= 0) return 0;
  const odd = k % 2 === 1;
  const m = odd ? (k - 1) / 2 : k / 2;
  const magnitude = Math.pow(-1, m) / factorial(k);
  if (odd) {
    return part === 'numerator' ? cosAt(theta) * magnitude : -sinAt(theta) * magnitude;
  }
  return part === 'numerator' ? sinAt(theta) * magnitude : cosAt(theta) * magnitude;
}

/** The retained part: every term up to and including alpha^order. */
export function truncatedPart(part: Part, theta: number, alpha: number, order: Order): number {
  let total = 0;
  for (let k = 0; k <= order; k += 1) {
    total += seriesCoefficient(part, theta, k) * Math.pow(alpha, k);
  }
  return total;
}

/**
 * R with both series truncated at the given order — the reader's approximation.
 *
 * When the retained denominator is exactly zero the result is not a number and
 * not a large number: the expansion has not been taken far enough to say
 * anything at all. That is the state the module exists to make visible.
 */
export function rTruncated(theta: number, alpha: number, order: Order): Estimate {
  const numerator = truncatedPart('numerator', theta, alpha, order);
  const denominator = truncatedPart('denominator', theta, alpha, order);
  if (denominator === 0) {
    return indeterminate(numerator === 0 ? 'nothing-retained' : 'retained-denominator-vanishes');
  }
  return estimate(numerator / denominator);
}

/**
 * The exact value, by sum to product:
 *
 *   R = 2cos(theta + alpha/2)sin(alpha/2) / -2sin(theta + alpha/2)sin(alpha/2)
 *     = -cot(theta + alpha/2)
 *
 * The oracle. Every truncation in this file is checked against it.
 */
export function rExact(theta: number, alpha: number): Estimate {
  const argument = theta + alpha / 2;
  const sin = sinAt(argument);
  if (sin === 0) return indeterminate('divergent');
  return estimate(-cosAt(argument) / sin);
}

/** R straight from the definition, for the tests to establish the closed form is the same object. */
export function rFromDefinition(theta: number, alpha: number): Estimate {
  const numerator = Math.sin(theta + alpha) - Math.sin(theta);
  const denominator = Math.cos(theta + alpha) - Math.cos(theta);
  if (denominator === 0) {
    return indeterminate(numerator === 0 ? 'nothing-retained' : 'divergent');
  }
  return estimate(numerator / denominator);
}

/** The two points the prose contrasts. */
export const SAFE_THETA = Math.PI / 3;
export const DEGENERATE_THETA = 0;

/** The values of alpha in the explanation's table. */
export const WITNESS_ALPHAS: readonly number[] = [0.1, 0.01, 0.001, 0.0001];

/**
 * E = |F - F_trunc|: how far the truncated expression sits from the exact one,
 * after everything that happens to it later. Null when either side is not a
 * value, because a distance from a non-value is not a number.
 */
export function truncationError(exact: Estimate, truncated: Estimate): number | null {
  if (!isValue(exact) || !isValue(truncated)) return null;
  return Math.abs(exact.value - truncated.value);
}

/* ------------------------------------------------------------------------- *
 * The window around theta = 0 where the "smaller" term is the bigger one
 * ------------------------------------------------------------------------- */

/** The values of alpha the panel offers, largest first. */
export const ALPHAS: readonly number[] = [0.3, 0.2, 0.1, 0.05, 0.03, 0.02, 0.01, 0.005, 0.002, 0.001];
export const DEFAULT_ALPHA_INDEX = 3;

export function alphaAt(index: number): number {
  return ALPHAS[Math.max(0, Math.min(ALPHAS.length - 1, index))] as number;
}

/**
 * The theta control works in units of alpha/10, carried as an integer, so the
 * window scales with alpha and the point theta = 0 is exactly reachable. The
 * true pole of R sits at theta = -alpha/2, which is index -5: also exact.
 */
export const THETA_INDEX = { min: -40, max: 40, perAlpha: 10 } as const;

export function thetaFromIndex(index: number, alpha: number): number {
  return (index * alpha) / THETA_INDEX.perAlpha;
}

/** The window the panel draws: four alphas either side of zero. */
export function thetaWindow(alpha: number): readonly [number, number] {
  return [thetaFromIndex(THETA_INDEX.min, alpha), thetaFromIndex(THETA_INDEX.max, alpha)];
}

export interface TermSizes {
  /** |alpha sin theta|: the first-order term of the denominator, which the truncation keeps. */
  kept: number;
  /** |alpha^2 cos theta / 2|: the second-order term, which it drops. */
  dropped: number;
}

export function termSizes(theta: number, alpha: number): TermSizes {
  return {
    kept: Math.abs(seriesCoefficient('denominator', theta, 1) * alpha),
    dropped: Math.abs(seriesCoefficient('denominator', theta, 2) * alpha * alpha),
  };
}

/** rho = kept / dropped for the denominator. Below one, the truncation is upside down. */
export function rhoDenominator(theta: number, alpha: number): number {
  const { kept, dropped } = termSizes(theta, alpha);
  return dropped === 0 ? Number.POSITIVE_INFINITY : kept / dropped;
}

/**
 * The half-width of the window in which the dropped term is the larger one:
 * |alpha sin theta| < alpha^2 |cos theta| / 2, i.e. |tan theta| < alpha / 2.
 */
export function dominanceHalfWidth(alpha: number): number {
  return Math.atan(alpha / 2);
}

export interface WindowSample {
  theta: number;
  exact: Estimate;
  truncated: Estimate;
  sizes: TermSizes;
}

/** Both curves of the second panel across the window, at every reachable theta. */
export function windowSweep(alpha: number, order: Order): WindowSample[] {
  const samples: WindowSample[] = [];
  for (let index = THETA_INDEX.min; index <= THETA_INDEX.max; index += 1) {
    const theta = thetaFromIndex(index, alpha);
    samples.push({
      theta,
      exact: rExact(theta, alpha),
      truncated: rTruncated(theta, alpha, order),
      sizes: termSizes(theta, alpha),
    });
  }
  return samples;
}

/** How far the R chart's frame extends, in units of 1/alpha: -2/alpha at theta = 0 must fit. */
export const R_FRAME = 3;

/* ------------------------------------------------------------------------- *
 * Display
 * ------------------------------------------------------------------------- */

export { formatFixed };

const SUPERSCRIPTS: Readonly<Record<string, string>> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};

/** Exponents as real superscript characters: they read aloud correctly too. */
export function superscript(exponent: number): string {
  return String(exponent)
    .split('')
    .map((character) => SUPERSCRIPTS[character] ?? character)
    .join('');
}

/**
 * A magnitude the reader is meant to feel rather than read: five ten-millionths
 * is a small number, and seeing how small is the point.
 */
export function formatSmall(value: number): string {
  const magnitude = Math.abs(value);
  if (magnitude === 0) return '0';
  if (magnitude >= 1e-4) return value.toFixed(7).replace(/0+$/, '');
  const exponent = Math.floor(Math.log10(magnitude));
  const mantissa = value / Math.pow(10, exponent);
  return `${formatFixed(mantissa, 1)} × 10${superscript(exponent)}`;
}

/** Decimal places for R on screen. */
export const R_DECIMALS = 3;

/**
 * Values near a pole run away faster than a fixed-decimal column can hold. Past
 * the point where the digits stop meaning anything, say the size instead.
 */
export function formatLarge(value: number, decimals: number = R_DECIMALS): string {
  const magnitude = Math.abs(value);
  if (magnitude >= 1e6) {
    const exponent = Math.floor(Math.log10(magnitude));
    const mantissa = formatFixed(magnitude / Math.pow(10, exponent), 1);
    return `${value < 0 ? '-' : ''}${mantissa} × 10${superscript(exponent)}`;
  }
  return formatFixed(value, magnitude >= 1000 ? 0 : decimals);
}

/**
 * What a reader sees in place of a value that does not exist. The expression
 * itself is perfectly determinate; it is the approximation that has kept too
 * little to report anything, and the wording says which.
 */
export const INDETERMINATE_LABELS: Readonly<Record<IndeterminateReason, string>> = {
  'nothing-retained': '0/0 — nothing kept',
  'retained-denominator-vanishes': 'kept denominator is 0',
  divergent: 'no value: a pole',
  'not-degenerate': 'not at a cusp',
};

export function formatEstimate(e: Estimate, decimals: number): string {
  return isValue(e) ? formatFixed(e.value, decimals) : INDETERMINATE_LABELS[e.reason];
}

/** The live readout beside the controls, where the value may be running away. */
export function formatReadout(e: Estimate): string {
  return isValue(e) ? formatLarge(e.value) : INDETERMINATE_LABELS[e.reason];
}

/** rho, which is unbounded whenever the truncation discards nothing at all. */
export function formatRho(value: number): string {
  if (!Number.isFinite(value)) return 'unbounded';
  if (value === 0) return '0';
  if (value >= 1000) return formatLarge(value, 0);
  return formatFixed(value, value < 10 ? 2 : 0);
}

/** A theta from the window control, as a multiple of alpha and in radians. */
export function formatWindowTheta(index: number, alpha: number): string {
  const multiple = index / THETA_INDEX.perAlpha;
  const radians = thetaFromIndex(index, alpha);
  const sign = multiple < 0 ? '−' : '';
  return `${sign}${formatFixed(Math.abs(multiple), 1)}α = ${formatFixed(radians, 4)}`;
}

export function formatN(n: number): string {
  return n.toLocaleString('en-GB');
}
