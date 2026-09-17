import { formatFixed } from '../../../lib/numbers';

/**
 * Module 02 — Operations on inequalities.
 *
 * Every number the reader sees comes from here. Nothing in the prose or the
 * panels is a literal: the solution sets, the places the two statements
 * disagree and the endpoints of every interval are found by evaluating the
 * inequalities themselves, so the page cannot drift away from the maths.
 *
 * The decisive quantity is the disagreement set D: the values of x at which the
 * original statement and the transformed one return different verdicts. A step
 * is sound exactly when D is empty, and when it is not empty its endpoints say
 * precisely what the step cost.
 */

/* ------------------------------------------------------------------------- *
 * Verdicts
 * ------------------------------------------------------------------------- */

/**
 * Three states, not two. "Undefined" is not a kind of false: at x = 2 the
 * statement (x+1)/(x-2) < 3 asks nothing at all, while the multiplied-out
 * version has an opinion. That difference is one of the ways a step goes wrong,
 * so it has to be representable.
 */
export type Verdict = 'true' | 'false' | 'undefined';

export const VERDICT_LABELS: Readonly<Record<Verdict, string>> = {
  true: 'holds',
  false: 'fails',
  undefined: 'not defined',
};

export type Relation = '<' | '>';

export interface Inequality {
  /** As the reader sees it. */
  text: string;
  relation: Relation;
  left(x: number): number;
  right(x: number): number;
  /** Where the statement makes sense at all. By default, wherever both sides are finite. */
  defined?(x: number): boolean;
}

function holds(relation: Relation, a: number, b: number): boolean {
  return relation === '<' ? a < b : a > b;
}

export function verdict(inequality: Inequality, x: number): Verdict {
  if (inequality.defined && !inequality.defined(x)) return 'undefined';
  const a = inequality.left(x);
  const b = inequality.right(x);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 'undefined';
  return holds(inequality.relation, a, b) ? 'true' : 'false';
}

/* ------------------------------------------------------------------------- *
 * The step as a function
 * ------------------------------------------------------------------------- */

/**
 * "Do the same thing to both sides" is a map phi applied to each side. Whether
 * the step is sound at a given x is whether phi is increasing between the two
 * sides there — and for most steps phi itself depends on x.
 */
export interface Operation {
  /** Describes phi at this x, as the reader sees it: 't ↦ (x − 2)·t = −2t'. */
  describe(x: number): string;
  apply(x: number, t: number): number;
  /** The two sides the operation is applied to at this x, or null where one is not defined. */
  sides(x: number): readonly [number, number] | null;
  /** The two sides as the reader sees them. */
  labels: readonly [string, string];
}

export type OrderState = 'lt' | 'gt' | 'eq' | 'undefined';

export function orderOf(a: number, b: number): OrderState {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 'undefined';
  if (a < b) return 'lt';
  if (a > b) return 'gt';
  return 'eq';
}

export const ORDER_SYMBOLS: Readonly<Record<OrderState, string>> = {
  lt: '<',
  gt: '>',
  eq: '=',
  undefined: '?',
};

export type Outcome = 'preserved' | 'reversed' | 'collapsed' | 'undefined';

export const OUTCOME_LABELS: Readonly<Record<Outcome, string>> = {
  preserved: 'order preserved',
  reversed: 'order reversed',
  collapsed: 'order destroyed',
  undefined: 'not defined here',
};

export interface OperationReading {
  sides: readonly [number, number] | null;
  images: readonly [number, number] | null;
  before: OrderState;
  after: OrderState;
  outcome: Outcome;
}

/** What the step does to the order of the two sides at this x. */
export function operationAt(witness: Witness, x: number): OperationReading {
  const sides = witness.operation.sides(x);
  if (!sides) {
    return { sides: null, images: null, before: 'undefined', after: 'undefined', outcome: 'undefined' };
  }
  const [a, b] = sides;
  const images: readonly [number, number] = [
    witness.operation.apply(x, a),
    witness.operation.apply(x, b),
  ];
  const before = orderOf(a, b);
  const after = orderOf(images[0], images[1]);
  let outcome: Outcome;
  if (before === 'undefined' || after === 'undefined') outcome = 'undefined';
  else if (before === after) outcome = 'preserved';
  else if (after === 'eq') outcome = 'collapsed';
  else outcome = 'reversed';
  return { sides, images, before, after, outcome };
}

/* ------------------------------------------------------------------------- *
 * The witnesses
 * ------------------------------------------------------------------------- */

export type WitnessId =
  | 'multiply-by-unknown-sign'
  | 'square-both-sides'
  | 'divide-by-variable'
  | 'step-2001-i'
  | 'step-2001-ii';

export interface Witness {
  id: WitnessId;
  /** For the select: the statement and the move, in a few words. */
  name: string;
  original: Inequality;
  /** The move, in the reader's words. */
  step: string;
  transformed: Inequality;
  operation: Operation;
  /** The window the charts draw. */
  domain: readonly [number, number];
  /** The window the two-sides chart draws vertically; values outside break the line. */
  yRange: readonly [number, number];
  /** Where x starts: somewhere the two agree, so the disagreement is found. */
  start: number;
  /** Why the step goes wrong, said after the reader has seen it. */
  because: string;
}

/** A coefficient as the reader sees it, with a real minus sign rather than a hyphen. */
const fmt = (x: number) => formatFixed(x, 1).replace(/^-/, '\u2212');

/**
 * The primary witness. Multiplying by (x - 2) is the move everyone makes, and
 * it is sound on one side of 2 and reversing on the other, so the naive answer
 * silently discards an unbounded interval of solutions.
 */
const multiplyByUnknownSign: Witness = {
  id: 'multiply-by-unknown-sign',
  name: '(x + 1)/(x − 2) < 3 — multiply by (x − 2)',
  original: {
    text: '(x + 1)/(x − 2) < 3',
    relation: '<',
    left: (x) => (x + 1) / (x - 2),
    right: () => 3,
    defined: (x) => x !== 2,
  },
  step: 'multiply both sides by (x − 2)',
  transformed: {
    text: 'x + 1 < 3(x − 2)',
    relation: '<',
    left: (x) => x + 1,
    right: (x) => 3 * (x - 2),
  },
  operation: {
    describe: (x) => `t ↦ (x − 2)·t = ${fmt(x - 2)}·t`,
    apply: (x, t) => (x - 2) * t,
    sides: (x) => (x === 2 ? null : [(x + 1) / (x - 2), 3]),
    labels: ['(x + 1)/(x − 2)', '3'],
  },
  domain: [-6, 8],
  yRange: [-8, 8],
  start: 5,
  because:
    'x − 2 is positive above 2 and negative below it. Multiplying by it keeps the order on one side and turns it round on the other, so one whole branch of the solution set is thrown away.',
};

/**
 * Squaring. Order-preserving on non-negative numbers and order-reversing on
 * negative ones, which costs the part of the solution set where the right-hand
 * side is negative.
 */
const squareBothSides: Witness = {
  id: 'square-both-sides',
  name: '√(x + 2) > x — square both sides',
  original: {
    text: '√(x + 2) > x',
    relation: '>',
    left: (x) => Math.sqrt(x + 2),
    right: (x) => x,
    defined: (x) => x >= -2,
  },
  step: 'square both sides',
  transformed: {
    text: 'x + 2 > x²',
    relation: '>',
    left: (x) => x + 2,
    right: (x) => x * x,
    defined: (x) => x >= -2,
  },
  operation: {
    describe: () => 't ↦ t²',
    apply: (_x, t) => t * t,
    sides: (x) => (x < -2 ? null : [Math.sqrt(x + 2), x]),
    labels: ['√(x + 2)', 'x'],
  },
  domain: [-3, 3],
  yRange: [-3, 4],
  start: 1,
  because:
    'Squaring only preserves order between numbers that are both non-negative. Where x is negative the comparison turns round and those solutions are lost.',
};

/**
 * Cancelling a factor. Dividing by x looks like cancelling and is sound above
 * zero, reversing below it, and meaningless at it — all three at once.
 */
const divideByVariable: Witness = {
  id: 'divide-by-variable',
  name: 'x² > 3x — divide by x',
  original: {
    text: 'x² > 3x',
    relation: '>',
    left: (x) => x * x,
    right: (x) => 3 * x,
  },
  step: 'divide both sides by x',
  transformed: {
    text: 'x > 3',
    relation: '>',
    left: (x) => x,
    right: () => 3,
  },
  operation: {
    describe: (x) => `t ↦ t/x = t/${fmt(x)}`,
    apply: (x, t) => t / x,
    sides: (x) => (x === 0 ? null : [x * x, 3 * x]),
    labels: ['x²', '3x'],
  },
  domain: [-4, 6],
  yRange: [-8, 16],
  start: 4,
  because:
    'Dividing by x assumes x is positive and assumes it is not zero. Below zero the inequality reverses, and at zero the division is not a step at all.',
};

/** STEP I 2001, Q2(i), paraphrased: the multiplier is x itself. */
const step2001i: Witness = {
  id: 'step-2001-i',
  name: 'STEP I 2001 Q2(i): 1 + 2x − x² > 2/x — multiply by x',
  original: {
    text: '1 + 2x − x² > 2/x',
    relation: '>',
    left: (x) => 1 + 2 * x - x * x,
    right: (x) => 2 / x,
    defined: (x) => x !== 0,
  },
  step: 'multiply both sides by x',
  transformed: {
    text: 'x + 2x² − x³ > 2',
    relation: '>',
    left: (x) => x + 2 * x * x - x * x * x,
    right: () => 2,
  },
  operation: {
    describe: (x) => `t ↦ x·t = ${fmt(x)}·t`,
    apply: (x, t) => x * t,
    sides: (x) => (x === 0 ? null : [1 + 2 * x - x * x, 2 / x]),
    labels: ['1 + 2x − x²', '2/x'],
  },
  domain: [-3, 3],
  yRange: [-8, 8],
  start: 1.5,
  because:
    'Multiplying by x is one step for positive x and the opposite step for negative x. Applied everywhere at once it is right above zero and wrong at every negative x but one.',
};

/**
 * STEP I 2001, Q2(ii), paraphrased. The first squaring is licensed — both sides
 * are non-negative — and the second is not, because x + 1 can be negative.
 */
const STEP_II_DOMAIN = -10 / 3;
const step2001ii: Witness = {
  id: 'step-2001-ii',
  name: 'STEP I 2001 Q2(ii): √(3x + 10) > 2 + √(x + 4) — square twice',
  original: {
    text: '√(3x + 10) > 2 + √(x + 4)',
    relation: '>',
    left: (x) => Math.sqrt(3 * x + 10),
    right: (x) => 2 + Math.sqrt(x + 4),
    defined: (x) => x >= STEP_II_DOMAIN,
  },
  step: 'square, tidy up, and square again',
  transformed: {
    text: 'x² − 2x − 15 > 0',
    relation: '>',
    left: (x) => x * x - 2 * x - 15,
    right: () => 0,
    defined: (x) => x >= STEP_II_DOMAIN,
  },
  operation: {
    describe: () => 't ↦ t², the second squaring',
    apply: (_x, t) => t * t,
    sides: (x) => (x < STEP_II_DOMAIN ? null : [x + 1, 2 * Math.sqrt(x + 4)]),
    labels: ['x + 1', '2√(x + 4)'],
  },
  domain: [-4, 7],
  yRange: [0, 6],
  start: 6,
  because:
    'The first squaring compares two non-negative quantities and is sound. The second compares x + 1 with 2√(x + 4), and below x = −1 the left side is negative: squaring there reverses the order and admits half a unit of x that never satisfied the original.',
};

export const WITNESSES: readonly Witness[] = [
  multiplyByUnknownSign,
  squareBothSides,
  divideByVariable,
  step2001i,
  step2001ii,
];

export const PRIMARY_WITNESS = multiplyByUnknownSign;

export function witnessById(id: string): Witness {
  return WITNESSES.find((witness) => witness.id === id) ?? PRIMARY_WITNESS;
}

/* ------------------------------------------------------------------------- *
 * The decisive quantity: where the two statements disagree
 * ------------------------------------------------------------------------- */

export interface Reading {
  x: number;
  original: Verdict;
  transformed: Verdict;
  /** Whether the two statements say the same thing about this x. */
  agree: boolean;
}

export function readingAt(witness: Witness, x: number): Reading {
  const original = verdict(witness.original, x);
  const transformed = verdict(witness.transformed, x);
  return { x, original, transformed, agree: original === transformed };
}

export interface Interval {
  from: number;
  to: number;
  /** True when the interval runs to the edge of the window rather than ending. */
  fromClipped: boolean;
  toClipped: boolean;
}

/** How finely the domain is swept before endpoints are refined. */
const SCAN_STEP = 0.005;
/** Bisections per endpoint: 40 halvings takes 0.005 below 1e-14. */
const REFINEMENTS = 40;

/**
 * The boundary between two x values where a predicate changes, to within
 * floating-point noise. Bisection rather than a formula, so the endpoints
 * reported are the ones the statements themselves produce.
 */
function boundary(predicate: (x: number) => boolean, inside: number, outside: number): number {
  let lo = inside;
  let hi = outside;
  for (let i = 0; i < REFINEMENTS; i += 1) {
    const mid = (lo + hi) / 2;
    if (predicate(mid)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Every maximal run of the window on which the predicate holds, with refined
 * endpoints. Used for both the solution sets and the disagreement set, so a
 * reader never sees an interval that was typed rather than found. Isolated
 * points narrower than the scan are not seen; the prose says so where it matters.
 */
export function intervalsWhere(
  predicate: (x: number) => boolean,
  domain: readonly [number, number],
  step: number = SCAN_STEP,
): Interval[] {
  const [start, end] = domain;
  const intervals: Interval[] = [];
  let runStart: number | null = null;
  let previous = start;

  for (let x = start; x <= end + step / 2; x += step) {
    const here = Math.min(x, end);
    const holdsHere = predicate(here);

    if (holdsHere && runStart === null) {
      runStart = here === start ? start : boundary(predicate, here, previous);
    } else if (!holdsHere && runStart !== null) {
      intervals.push({
        from: runStart,
        to: boundary(predicate, previous, here),
        fromClipped: runStart === start,
        toClipped: false,
      });
      runStart = null;
    }
    previous = here;
  }

  if (runStart !== null) {
    intervals.push({ from: runStart, to: end, fromClipped: runStart === start, toClipped: true });
  }
  return intervals;
}

/** Where the statement holds, inside the window. */
export function solutionSet(inequality: Inequality, domain: readonly [number, number]): Interval[] {
  return intervalsWhere((x) => verdict(inequality, x) === 'true', domain);
}

/**
 * D, the decisive quantity: where the original and the transformed statement
 * return different verdicts. Empty exactly when the step was sound.
 */
export function disagreementSet(witness: Witness): Interval[] {
  return intervalsWhere((x) => !readingAt(witness, x).agree, witness.domain);
}

/** Whether the step is sound across the whole window. */
export function stepIsSound(witness: Witness): boolean {
  return disagreementSet(witness).length === 0;
}

/**
 * Which way the step went wrong: a step can lose solutions, gain them, or do
 * both. Naming the direction separates a reader who has the mechanism from one
 * who has memorised "watch out for negatives".
 */
export type ErrorDirection = 'loses solutions' | 'gains solutions' | 'loses and gains' | 'neither';

export function errorDirection(witness: Witness): ErrorDirection {
  const loses =
    intervalsWhere(
      (x) => readingAt(witness, x).original === 'true' && readingAt(witness, x).transformed !== 'true',
      witness.domain,
    ).length > 0;
  const gains =
    intervalsWhere(
      (x) => readingAt(witness, x).transformed === 'true' && readingAt(witness, x).original !== 'true',
      witness.domain,
    ).length > 0;

  if (loses && gains) return 'loses and gains';
  if (loses) return 'loses solutions';
  if (gains) return 'gains solutions';
  return 'neither';
}

/**
 * The total length of a set of intervals, or null when one of them runs off the
 * window — an unbounded set has no total length, and reporting a window-sized
 * number for it would be a lie the reader could not see.
 */
export function totalLength(intervals: readonly Interval[]): number | null {
  if (intervals.some((interval) => interval.fromClipped || interval.toClipped)) return null;
  return intervals.reduce((sum, interval) => sum + (interval.to - interval.from), 0);
}

/* ------------------------------------------------------------------------- *
 * Curves for the charts
 * ------------------------------------------------------------------------- */

export type CurvePoint = readonly [x: number, y: number];

/** Samples of a function across the window, with NaN wherever it would leave the frame. */
export function curveOf(
  fn: (x: number) => number,
  domain: readonly [number, number],
  yRange: readonly [number, number],
  samples = 400,
): CurvePoint[] {
  const [start, end] = domain;
  const points: CurvePoint[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const x = start + ((end - start) * i) / samples;
    const y = fn(x);
    const visible = Number.isFinite(y) && y >= yRange[0] && y <= yRange[1];
    points.push([x, visible ? y : NaN]);
  }
  return points;
}

/** The window the operation graph draws in t: both sides and zero, with room around them. */
export function operationRange(witness: Witness, x: number): readonly [number, number] {
  const sides = witness.operation.sides(x);
  if (!sides) return [-3, 3];
  const lo = Math.min(sides[0], sides[1], 0);
  const hi = Math.max(sides[0], sides[1], 0);
  const pad = Math.max(1, 0.35 * (hi - lo));
  return [lo - pad, hi + pad];
}

/* ------------------------------------------------------------------------- *
 * The control
 * ------------------------------------------------------------------------- */

/**
 * x moves in tenths, carried as an integer, so every critical point — 2, 3.5,
 * −2, −1, 0, −3 — is exactly on the grid and a verdict is never reported for a
 * place the reader is not standing.
 */
export const X_STEP_TENTHS = 1;

export function tenthsToX(tenths: number): number {
  return tenths / 10;
}

export function xToTenths(x: number): number {
  return Math.round(x * 10);
}

/* ------------------------------------------------------------------------- *
 * Display
 * ------------------------------------------------------------------------- */

export const X_DECIMALS = 2;

export { formatFixed };

/** An interval as a reader would write it, with the window's edges marked. */
export function formatInterval(interval: Interval, decimals: number = X_DECIMALS): string {
  const from = interval.fromClipped ? '−∞' : formatFixed(interval.from, decimals);
  const to = interval.toClipped ? '∞' : formatFixed(interval.to, decimals);
  return `${from} to ${to}`;
}

export function formatIntervals(intervals: readonly Interval[], decimals: number = X_DECIMALS): string {
  if (intervals.length === 0) return 'empty';
  return intervals.map((interval) => formatInterval(interval, decimals)).join(', and ');
}

export function formatLength(intervals: readonly Interval[]): string {
  const length = totalLength(intervals);
  return length === null ? 'unbounded' : formatFixed(length, 2);
}
