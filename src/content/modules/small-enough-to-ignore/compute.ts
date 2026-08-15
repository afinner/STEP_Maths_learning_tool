/**
 * Module 01 — Small enough to ignore.
 *
 * Every number the reader sees on this page is produced here. Nothing in the
 * prose, the tables or the widget is a literal: if a value appears on screen, it
 * came out of a function below, so the page cannot drift away from the maths.
 *
 * Two witnesses live here:
 *   - the hook, n(sqrt(n^2 + 1) - n), where the answer is the term you dropped;
 *   - the ratio R(theta, alpha), where the same truncation is right at one point
 *     and useless at another.
 *
 * The closed form of R is the oracle for everything else in this file.
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
  | 'divergent';

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
 * Amplifiers: why a dropped term comes back
 * ------------------------------------------------------------------------- */

/** The bank is organised by these, not by topic. */
export type Amplifier = 'cancellation' | 'multiplication';

export const AMPLIFIER_NAMES: Record<Amplifier, string> = {
  cancellation: 'Cancellation',
  multiplication: 'Multiplication',
};

/* ------------------------------------------------------------------------- *
 * The hook
 * ------------------------------------------------------------------------- */

/** Generalised binomial coefficient C(alpha, k), for the expansion of a root. */
export function binomialCoefficient(alpha: number, k: number): number {
  let c = 1;
  for (let j = 0; j < k; j += 1) c *= (alpha - j) / (j + 1);
  return c;
}

export interface HookExpression {
  readonly id: string;
  /** The expression itself, as KaTeX. */
  readonly latex: string;
  /** The variable the reader watches grow. */
  readonly variableLatex: string;
  readonly limit: number;
  readonly limitLatex: string;
  /** Which amplifiers this hook fires. See §7 question 1: the fewer, the cleaner. */
  readonly amplifiers: readonly Amplifier[];
  /** The true value, computed stably. */
  value(n: number): number;
  /** What the naive move leaves behind, after the terms you kept cancel. */
  naiveValue(n: number): number;
  /** The leading term the naive move discards, after whatever multiplies it. */
  droppedTerm(n: number): number;
  /** Partial sum of the expansion, keeping `terms` terms. */
  expansion(n: number, terms: number): number;
  /** Each term of the expansion as KaTeX, in order. */
  readonly expansionLatex: readonly string[];
}

/**
 * n(sqrt(n^2+1) - n).
 *
 * Computed as n / (sqrt(n^2+1) + n). Algebraically identical, and the reason for
 * the rearrangement is the module's own subject in miniature: evaluating the
 * subtraction directly at n = 10^6 cancels away most of the significant digits
 * of a double and returns 0.500003807, which is wrong in the fourth decimal
 * place. The float arithmetic drops the same term the reader does.
 */
const rootHook: HookExpression = {
  id: 'root-of-n-squared-plus-one',
  latex: 'n\\left(\\sqrt{n^{2}+1}-n\\right)',
  variableLatex: 'n',
  limit: 0.5,
  limitLatex: '\\tfrac{1}{2}',
  amplifiers: ['cancellation', 'multiplication'],
  value: (n) => n / (Math.sqrt(n * n + 1) + n),
  // sqrt(n^2+1) rounded down to n: what you keep is n - n.
  naiveValue: (n) => n * (n - n),
  // The first discarded term of the root, 1/(2n), multiplied by the n outside.
  droppedTerm: (n) => n * (binomialCoefficient(0.5, 1) / n),
  expansion: (n, terms) => {
    let total = 0;
    for (let k = 1; k <= terms; k += 1) {
      total += binomialCoefficient(0.5, k) * Math.pow(n, 2 - 2 * k);
    }
    return total;
  },
  expansionLatex: ['\\tfrac{1}{2}', '-\\tfrac{1}{8n^{2}}', '+\\tfrac{1}{16n^{4}}'],
};

/**
 * The alternative from §7 question 1: one amplifier, cleaner to diagnose, more
 * likely to be recognised. Kept working so the choice stays a one-line change.
 */
const compoundHook: HookExpression = {
  id: 'compound-interest',
  latex: '\\left(1+\\tfrac{1}{n}\\right)^{n}',
  variableLatex: 'n',
  limit: Math.E,
  limitLatex: 'e',
  amplifiers: ['multiplication'],
  value: (n) => Math.pow(1 + 1 / n, n),
  // 1/n rounded down to 0: what you keep is 1^n.
  naiveValue: (n) => Math.pow(1 + 0 * n, n),
  droppedTerm: (n) => Math.pow(1 + 1 / n, n) - Math.pow(1 + 0 * n, n),
  expansion: (n, terms) => {
    // e(1 - 1/(2n) + 11/(24n^2) - ...)
    const coefficients = [1, -1 / 2, 11 / 24];
    let total = 0;
    for (let k = 0; k < Math.min(terms, coefficients.length); k += 1) {
      total += (coefficients[k] as number) * Math.pow(n, -k);
    }
    return Math.E * total;
  },
  expansionLatex: ['e', '-\\tfrac{e}{2n}', '+\\tfrac{11e}{24n^{2}}'],
};

export const HOOKS: Readonly<Record<string, HookExpression>> = {
  [rootHook.id]: rootHook,
  [compoundHook.id]: compoundHook,
};

/**
 * §7 question 1 is open. This is the single parameter that settles it — change
 * this one line to swap the hook; nothing else in the module refers to either
 * expression by name.
 */
export const ACTIVE_HOOK_ID = rootHook.id;

export const hook: HookExpression = HOOKS[ACTIVE_HOOK_ID] as HookExpression;

/** The values of n shown in the break table. Inputs, not answers. */
export const HOOK_TABLE_N: readonly number[] = [1, 10, 100, 1_000, 1_000_000];

export interface HookSample {
  n: number;
  value: number;
}

export function hookTable(ns: readonly number[] = HOOK_TABLE_N): HookSample[] {
  return ns.map((n) => ({ n, value: hook.value(n) }));
}

/* ------------------------------------------------------------------------- *
 * The witness: R(theta, alpha)
 * ------------------------------------------------------------------------- */

export const MAX_ORDER = 3;
export type Order = 0 | 1 | 2 | 3;
export const ORDERS: readonly Order[] = [0, 1, 2, 3];

/** How the slider labels each stop. */
export const ORDER_LATEX: Readonly<Record<Order, string>> = {
  0: 'O(1)',
  1: 'O(\\alpha)',
  2: 'O(\\alpha^{2})',
  3: 'O(\\alpha^{3})',
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
 * This is not a fudge factor, and the module would be dishonest with a sloppy
 * one. The degenerate points are theta = 0, pi, 2pi, where the denominator's
 * first-order coefficient -sin(theta) vanishes. Only theta = 0 is exactly
 * representable: Math.sin(Math.PI) is 1.2246e-16, so a reader standing on pi
 * would be shown -8.2e15 — a huge finite number in the one place the module
 * needs to say "indeterminate", which is precisely the error the module is
 * about.
 *
 * The tolerance is safe because it is nowhere near anything reachable. The
 * theta control moves in steps of pi/180 at finest, so every point a reader can
 * visit is either exactly a degenerate point or ~0.017 away from one — fifteen
 * orders of magnitude outside this window. No point that is genuinely non-zero
 * can be swallowed by it.
 */
export const ANGLE_TOLERANCE = 1e-9;

/** sin(theta), reading exact zeros as zero. */
export function sinAt(theta: number): number {
  const s = Math.sin(theta);
  return Math.abs(s) < ANGLE_TOLERANCE ? 0 : s;
}

/** cos(theta), reading exact zeros as zero. */
export function cosAt(theta: number): number {
  const c = Math.cos(theta);
  return Math.abs(c) < ANGLE_TOLERANCE ? 0 : c;
}

/** The points where the first-order denominator dies: theta = k pi. */
export function isDegenerate(theta: number): boolean {
  return sinAt(theta) === 0;
}

/** The degenerate point nearest a given theta — what the theta control snaps to. */
export function nearestDegenerateTheta(theta: number): number {
  return Math.round(theta / Math.PI) * Math.PI;
}

/**
 * Coefficient of alpha^k in the expansion about alpha = 0 of
 *
 *   numerator    sin(theta + alpha) - sin(theta) =  cos(theta)(alpha - alpha^3/6 + ...)
 *                                                 + sin(theta)(-alpha^2/2 + ...)
 *   denominator  cos(theta + alpha) - cos(theta) = -sin(theta)(alpha - alpha^3/6 + ...)
 *                                                 + cos(theta)(-alpha^2/2 + ...)
 *
 * Both have no constant term: at alpha = 0 the two points coincide. That is why
 * the O(1) setting of the slider retains nothing at all.
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
export function truncatedPart(
  part: Part,
  theta: number,
  alpha: number,
  order: Order,
): number {
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

/**
 * R straight from the definition, without the identity. Used by the tests to
 * establish that the closed form is the same object, not a claim about it.
 */
export function rFromDefinition(theta: number, alpha: number): Estimate {
  const numerator = Math.sin(theta + alpha) - Math.sin(theta);
  const denominator = Math.cos(theta + alpha) - Math.cos(theta);
  if (denominator === 0) {
    return indeterminate(numerator === 0 ? 'nothing-retained' : 'divergent');
  }
  return estimate(numerator / denominator);
}

/** The two points the module contrasts. Everything else is the reader's to explore. */
export const SAFE_THETA = Math.PI / 3;
export const DEGENERATE_THETA = 0;

/** The values of alpha shown in the side-by-side tables. */
export const WITNESS_ALPHAS: readonly number[] = [0.1, 0.01, 0.001, 0.0001];

export interface WitnessSample {
  alpha: number;
  exact: Estimate;
  truncated: Estimate;
}

export function witnessTable(
  theta: number,
  order: Order,
  alphas: readonly number[] = WITNESS_ALPHAS,
): WitnessSample[] {
  return alphas.map((alpha) => ({
    alpha,
    exact: rExact(theta, alpha),
    truncated: rTruncated(theta, alpha, order),
  }));
}

/* ------------------------------------------------------------------------- *
 * The decisive quantity
 * ------------------------------------------------------------------------- */

export interface RhoPart {
  /** Size of everything retained, at this alpha. */
  kept: number;
  /** Size of the leading term discarded, at this alpha. */
  dropped: number;
  /** kept / dropped. Infinite when nothing was discarded. */
  rho: number;
}

export interface RhoReport {
  numerator: RhoPart;
  denominator: RhoPart;
  /** The smaller of the two: a truncation is only as good as its worse half. */
  binding: number;
  /**
   * Truncation is legitimate iff rho tends to infinity as alpha tends to zero.
   * rho scales like 1/alpha whenever the retained terms survive, so the verdict
   * turns on exactly one thing: whether what you kept is non-zero.
   */
  verdict: 'safe' | 'unsafe';
}

/** How far past the truncation to look for the leading discarded term. */
const DROPPED_TERM_SEARCH_DEPTH = 4;

export function rhoFor(part: Part, theta: number, alpha: number, order: Order): RhoPart {
  const kept = Math.abs(truncatedPart(part, theta, alpha, order));

  let dropped = 0;
  for (let k = order + 1; k <= order + DROPPED_TERM_SEARCH_DEPTH; k += 1) {
    const term = Math.abs(seriesCoefficient(part, theta, k) * Math.pow(alpha, k));
    if (term !== 0) {
      dropped = term;
      break;
    }
  }

  return {
    kept,
    dropped,
    rho: dropped === 0 ? Number.POSITIVE_INFINITY : kept / dropped,
  };
}

export function rho(theta: number, alpha: number, order: Order): RhoReport {
  const numerator = rhoFor('numerator', theta, alpha, order);
  const denominator = rhoFor('denominator', theta, alpha, order);
  const binding = Math.min(numerator.rho, denominator.rho);
  return {
    numerator,
    denominator,
    binding,
    verdict: binding === 0 ? 'unsafe' : 'safe',
  };
}

/** The same ratio for the hook: what survives the cancellation, over what was lost. */
export function hookRho(n: number): RhoPart {
  const kept = Math.abs(hook.naiveValue(n));
  const dropped = Math.abs(hook.droppedTerm(n));
  return {
    kept,
    dropped,
    rho: dropped === 0 ? Number.POSITIVE_INFINITY : kept / dropped,
  };
}

/* ------------------------------------------------------------------------- *
 * Display
 * ------------------------------------------------------------------------- */

/** Fixed-decimal rendering, so a column of numbers lines up and can be compared. */
export function formatFixed(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

/** What a reader sees in place of a value that does not exist. */
export const INDETERMINATE_LABEL = 'indeterminate';

export function formatEstimate(e: Estimate, decimals: number): string {
  return isValue(e) ? formatFixed(e.value, decimals) : INDETERMINATE_LABEL;
}
