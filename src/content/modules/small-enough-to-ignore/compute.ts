import { AMPLIFIERS, type Amplifier } from '../../../lib/amplifiers';

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

/**
 * The vocabulary is shared across modules rather than owned by this one, since
 * the bank sorts by mechanism and later modules sort into the same drawers.
 */
export type { Amplifier };

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
  /** The leading term the naive move discards, before anything amplifies it. */
  rawDroppedTerm(n: number): number;
  /** The same term, after whatever multiplies it. This is where the answer went. */
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
  // Rounding the root down to n throws away 1/(2n) ...
  rawDroppedTerm: (n) => binomialCoefficient(0.5, 1) / n,
  // ... and then the n outside multiplies it straight back up to the answer.
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
  rawDroppedTerm: (n) => 1 / n,
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

/** How the slider labels each stop, in KaTeX and in plain readable text. */
export const ORDER_LATEX: Readonly<Record<Order, string>> = {
  0: 'O(1)',
  1: 'O(\\alpha)',
  2: 'O(\\alpha^{2})',
  3: 'O(\\alpha^{3})',
};

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

/**
 * The one alpha the interactive part of the module runs at.
 *
 * The slider has two controls, order and theta, so alpha has to be a constant —
 * and which constant matters. The module's claim is that at theta = pi/3 the
 * displayed value stops changing once first order is kept, but the first-order
 * and second-order values differ by about 0.67 alpha, so that claim is only
 * true on screen if alpha is small enough for the difference to fall below the
 * displayed precision. At alpha = 0.001 and three decimals both read -0.577,
 * and the degenerate point reads a satisfying -2000.000.
 */
export const ALPHA = 0.001;

/** Decimal places for R on screen. Chosen with ALPHA; see above. */
export const R_DECIMALS = 3;

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
 * Driving theta through the degenerate point
 * ------------------------------------------------------------------------- */

/**
 * The theta control works in whole degrees.
 *
 * This is the detent. A slider carrying radians as floats lands on 1e-17 rather
 * than 0 and shows a huge finite number exactly where the module needs
 * "indeterminate"; integers cannot miss. Degrees also put the two degenerate
 * points (0 and 180) and both interesting angles (60 and 90) on the grid.
 */
export const THETA_MIN_DEGREES = -90;
export const THETA_MAX_DEGREES = 270;
export const THETA_STEP_DEGREES = 1;

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return Math.round((radians * 180) / Math.PI);
}

export interface SweepSample {
  degrees: number;
  theta: number;
  value: Estimate;
}

/**
 * The truncated value across the whole range of theta, at a fixed order.
 *
 * Sweeping this at first order is the module's key interaction: the value grows
 * without bound on the approach to theta = 0 and then stops being a value at
 * all. Generated here rather than in the widget so the shape of that transition
 * is testable.
 */
export function thetaSweep(
  order: Order,
  alpha: number = ALPHA,
  step: number = THETA_STEP_DEGREES,
): SweepSample[] {
  const samples: SweepSample[] = [];
  for (let degrees = THETA_MIN_DEGREES; degrees <= THETA_MAX_DEGREES; degrees += step) {
    const theta = degreesToRadians(degrees);
    samples.push({ degrees, theta, value: rTruncated(theta, alpha, order) });
  }
  return samples;
}

/* ------------------------------------------------------------------------- *
 * The bank
 * ------------------------------------------------------------------------- */

export interface BankEntry {
  id: string;
  /** Where it sits in the run: worked through, to try, or the closer. */
  slot: string;
  /** Paper and question, as a citation. No question text appears anywhere. */
  question: string;
  amplifiers: readonly Amplifier[];
  /** Why rho collapses, in one line. */
  why: string;
  paper: string;
}

/**
 * Organised by amplifier, never by topic.
 *
 * A topic taxonomy — surds, trigonometry, series, binomial, probability —
 * teaches surface pattern-matching, which is the habit this module exists to
 * break. Sorting by mechanism is the part that transfers.
 *
 * Every entry is a citation and a paraphrase. No question text is reproduced;
 * see the standing rule in CONTRIBUTING.md.
 */
export const BANK: readonly BankEntry[] = [
  {
    id: 'step3-2024-q2',
    slot: 'Worked',
    question: '2024 STEP 3, Q2(ii)(a)',
    amplifiers: ['cancellation'],
    why: 'The leading terms cancel exactly, and what is left under the root decides the answer. The cheapest example in the bank: start here.',
    paper: 'https://step.maths.org/sites/default/files/2025-06/STEP3_2024_Mock.pdf',
  },
  {
    id: 'step3-2022-q6',
    slot: 'Worked',
    question: '2022 STEP 3, Q6',
    amplifiers: ['cancellation'],
    why: 'The leading coefficient vanishes at the one point the question asks about — the witness worked through above.',
    paper: 'https://step.maths.org/sites/default/files/2023-06/2022STEP3Mock.pdf',
  },
  {
    id: 'step3-2024-q11',
    slot: 'Closer',
    question: '2024 STEP 3, Q11(iii)–(iv)',
    amplifiers: ['cancellation'],
    why: 'The term you would discard is the entire answer. Simplify it away and the question evaporates.',
    paper: 'https://step.maths.org/sites/default/files/2025-06/STEP3_2024_Mock.pdf',
  },
  {
    id: 'step3-2023-q2',
    slot: 'Try',
    question: '2023 STEP 3, Q2(iv)',
    amplifiers: ['cancellation', 'multiplication'],
    why: 'Two different orders in one expression, because one term is amplified by k and another by k². Sketch the region first: the contradiction only lands if the picture is yours.',
    paper: 'https://step.maths.org/sites/default/files/2025-02/2023STEP3Mock.pdf',
  },
  {
    id: 'step2-2021-q6',
    slot: 'Try',
    question: '2021 STEP 2, Q6(iii)–(iv)',
    amplifiers: ['cancellation', 'multiplication'],
    why: 'A ratio that tends to 1/(1 − cos α), which is order one rather than small.',
    paper: 'https://step.maths.org/sites/default/files/2023-06/STEP_2_2021_Mock_0.pdf',
  },
  {
    id: 'step2-2024-q11',
    slot: 'Try',
    question: '2024 STEP 2, Q11(iv)',
    amplifiers: ['multiplication'],
    why: 'The expansion is in pk, not in p, so the approximation is excellent at one group size and nonsense at another. Find the size where it breaks.',
    paper: 'https://step.maths.org/sites/default/files/2025-06/STEP2_2024_Mock.pdf',
  },
  {
    id: 'step3-2024-q3',
    slot: 'Stretch',
    question: '2024 STEP 3, Q3',
    amplifiers: ['multiplication'],
    why: 'A threshold that naive limiting cannot see at all.',
    paper: 'https://step.maths.org/sites/default/files/2025-06/STEP3_2024_Mock.pdf',
  },
];

export interface BankGroup {
  amplifier: Amplifier;
  entries: readonly BankEntry[];
}

/**
 * The bank grouped by mechanism. A question driven by both amplifiers appears
 * under both, because it is an example of each.
 */
export function bankByAmplifier(bank: readonly BankEntry[] = BANK): BankGroup[] {
  return AMPLIFIERS.map((amplifier) => ({
    amplifier,
    entries: bank.filter((entry) => entry.amplifiers.includes(amplifier)),
  })).filter((group) => group.entries.length > 0);
}

/* ------------------------------------------------------------------------- *
 * Measurement
 * ------------------------------------------------------------------------- */

/**
 * The same ratio the other way up.
 *
 * The transfer item asks where first-order expansion fails for the reciprocal.
 * The answer is deliberately not the one the module taught, so it is worked out
 * here from the same machinery rather than written down: whichever part is on
 * the bottom is the part whose leading coefficient has to survive.
 */
export function reciprocalTruncated(theta: number, alpha: number, order: Order): Estimate {
  const numerator = truncatedPart('denominator', theta, alpha, order);
  const denominator = truncatedPart('numerator', theta, alpha, order);
  if (denominator === 0) {
    return indeterminate(numerator === 0 ? 'nothing-retained' : 'retained-denominator-vanishes');
  }
  return estimate(numerator / denominator);
}

/** Where first-order expansion fails, in degrees over [0, 360). */
export function degeneratePointsOf(
  which: 'r' | 'reciprocal',
  alpha: number = ALPHA,
): number[] {
  const evaluate = which === 'r' ? rTruncated : reciprocalTruncated;
  const points: number[] = [];
  for (let degrees = 0; degrees < 360; degrees += 1) {
    if (!isValue(evaluate(degreesToRadians(degrees), alpha, 1))) points.push(degrees);
  }
  return points;
}

/**
 * Truncating too early makes the answer too small here: the naive move keeps
 * nothing, and nothing is below the true value. Read off rather than asserted,
 * because the other direction is just as common — a truncation that leaves a
 * confident wrong number that is too big.
 */
export function hookErrorDirection(): 'too big' | 'too small' {
  return hook.naiveValue(1) < hook.limit ? 'too small' : 'too big';
}

export interface OrderItem {
  id: string;
  /** The limit, in plain text: the island does not typeset. */
  text: string;
  /** Computed stably, never written down. */
  limit(): number;
  /** How many orders past the leading one you have to keep. */
  ordersPastLeading: number;
  /** What makes it that many, once they have answered. */
  because: string;
}

/**
 * M1. Order prediction with no computation — the skill on its own, and immune
 * to having seen the question before.
 */
export const ORDER_ITEMS: readonly OrderItem[] = [
  {
    id: 'root-x-squared-plus-3x',
    text: 'lim (x → ∞) of √(x² + 3x) − x',
    // Rearranged to 3x / (√(x² + 3x) + x): the subtraction loses its own answer.
    limit: () => {
      const x = 1e8;
      return (3 * x) / (Math.sqrt(x * x + 3 * x) + x);
    },
    ordersPastLeading: 1,
    because: 'The x terms cancel, so the answer sits in the next one.',
  },
  {
    id: 'tan-minus-sin',
    text: 'lim (x → 0) of (tan x − sin x) / x³',
    limit: () => {
      const x = 1e-3;
      return (Math.tan(x) - Math.sin(x)) / (x * x * x);
    },
    ordersPastLeading: 2,
    because: 'Both expansions agree to first order, and the x³ terms are the first to differ.',
  },
  {
    id: 'cos-quartic',
    text: 'lim (n → ∞) of n⁴(cos(1/n) − 1 + 1/(2n²))',
    limit: () => {
      const n = 100;
      return Math.pow(n, 4) * (Math.cos(1 / n) - 1 + 1 / (2 * n * n));
    },
    ordersPastLeading: 3,
    because: 'Two terms of the cosine are subtracted away by hand; the third survives.',
  },
];

/** How many orders past leading the learner says are needed. Whole numbers only. */
export function parseOrderAnswer(raw: string): number | null {
  const text = raw.trim();
  return /^\d+$/.test(text) ? Number(text) : null;
}

/**
 * The simplest fraction within tolerance of a value, by continued fractions.
 * Limits computed numerically are far more legible written as 1/24 than as
 * 0.041666, and the fraction is derived rather than typed beside it.
 */
export function toFraction(
  value: number,
  tolerance = 1e-4,
  maxDenominator = 1000,
): { numerator: number; denominator: number } | null {
  const sign = value < 0 ? -1 : 1;
  const magnitude = Math.abs(value);

  let lowerN = 0;
  let lowerD = 1;
  let upperN = 1;
  let upperD = 0;

  for (let guard = 0; guard < 64; guard += 1) {
    const mediantN = lowerN + upperN;
    const mediantD = lowerD + upperD;
    if (mediantD > maxDenominator) return null;

    const mediant = mediantN / mediantD;
    if (Math.abs(mediant - magnitude) < tolerance) {
      return { numerator: sign * mediantN, denominator: mediantD };
    }
    if (mediant < magnitude) {
      lowerN = mediantN;
      lowerD = mediantD;
    } else {
      upperN = mediantN;
      upperD = mediantD;
    }
  }
  return null;
}

/* ------------------------------------------------------------------------- *
 * Display
 * ------------------------------------------------------------------------- */

/** Fixed-decimal rendering, so a column of numbers lines up and can be compared. */
export function formatFixed(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

const SUPERSCRIPTS: Readonly<Record<string, string>> = {
  '0': '\u2070',
  '1': '\u00b9',
  '2': '\u00b2',
  '3': '\u00b3',
  '4': '\u2074',
  '5': '\u2075',
  '6': '\u2076',
  '7': '\u2077',
  '8': '\u2078',
  '9': '\u2079',
  '-': '\u207b',
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

/** What a reader sees in place of a value that does not exist. */
export const INDETERMINATE_LABEL = 'indeterminate';

export function formatEstimate(e: Estimate, decimals: number): string {
  return isValue(e) ? formatFixed(e.value, decimals) : INDETERMINATE_LABEL;
}

/** The live readout beside the controls, where the value may be running away. */
export function formatReadout(e: Estimate): string {
  return isValue(e) ? formatLarge(e.value) : INDETERMINATE_LABEL;
}

/** A limit written the way it would be written by hand, where that is possible. */
export function formatLimit(value: number): string {
  const fraction = toFraction(value);
  if (!fraction) return formatFixed(value, 4);
  if (fraction.denominator === 1) return String(fraction.numerator);
  return `${fraction.numerator}/${fraction.denominator}`;
}

/** rho, which is unbounded whenever the truncation discards nothing at all. */
export function formatRho(value: number): string {
  if (!Number.isFinite(value)) return 'unbounded';
  if (value === 0) return '0';
  if (value >= 1000) return formatLarge(value, 0);
  return formatFixed(value, value < 10 ? 2 : 0);
}
