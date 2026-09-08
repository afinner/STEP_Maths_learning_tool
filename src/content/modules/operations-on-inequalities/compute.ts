import { AMPLIFIERS, type Amplifier } from '../../../lib/amplifiers';
import { canonicalSelection } from '../../../lib/selection';
import { formatFixed } from '../../../lib/numbers';

/**
 * Module 02 — Operations on inequalities.
 *
 * Every number the reader sees comes from here. Nothing in the prose or the
 * widget is a literal: the solution sets, the places the two statements
 * disagree and the endpoints of every interval are found by evaluating the
 * inequalities themselves, so the page cannot drift away from the maths.
 *
 * The decisive quantity is the disagreement set D: the values of x at which the
 * original statement and the transformed one return different verdicts. A step
 * is sound exactly when D is empty, and when it is not empty its endpoints say
 * precisely what the step cost.
 */

export type { Amplifier };

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
  undefined: 'not defined here',
};

export interface Inequality {
  /** As the reader sees it. */
  text: string;
  verdict(x: number): Verdict;
}

/** Guards a comparison so that a non-finite side reports as undefined. */
function compare(left: number, right: number, holds: (a: number, b: number) => boolean): Verdict {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return 'undefined';
  return holds(left, right) ? 'true' : 'false';
}

/* ------------------------------------------------------------------------- *
 * The witnesses
 * ------------------------------------------------------------------------- */

export interface Witness {
  id: string;
  /** What the reader is asked to solve. */
  original: Inequality;
  /** The move, in the reader's words. */
  step: string;
  transformed: Inequality;
  amplifier: Amplifier;
  /** The window the number line draws. */
  domain: readonly [number, number];
  /** Where x starts: somewhere the two agree, so the disagreement is found. */
  start: number;
  /** Said only after the reader has seen the disagreement for themselves. */
  because: string;
}

/**
 * The primary witness. Multiplying by (x - 2) is the move everyone makes, and
 * it is sound on one side of 2 and reversing on the other, so the naive answer
 * silently discards an unbounded interval of solutions.
 */
const multiplyByUnknownSign: Witness = {
  id: 'multiply-by-unknown-sign',
  original: {
    text: '(x + 1)/(x − 2) < 3',
    verdict: (x) => compare((x + 1) / (x - 2), 3, (a, b) => a < b),
  },
  step: 'multiply both sides by (x − 2)',
  transformed: {
    text: 'x + 1 < 3(x − 2)',
    verdict: (x) => compare(x + 1, 3 * (x - 2), (a, b) => a < b),
  },
  amplifier: 'sign-reversal',
  domain: [-6, 8],
  start: 5,
  because:
    'x − 2 is positive above 2 and negative below it. Multiplying by it keeps the inequality the same way round on one side and turns it round on the other, so one whole branch of the solution set is thrown away.',
};

/**
 * Squaring. Order-preserving on non-negative numbers and order-reversing on
 * negative ones, which costs the part of the solution set where the right-hand
 * side is negative.
 */
const squareBothSides: Witness = {
  id: 'square-both-sides',
  original: {
    text: '√(x + 2) > x',
    verdict: (x) => (x < -2 ? 'undefined' : compare(Math.sqrt(x + 2), x, (a, b) => a > b)),
  },
  step: 'square both sides',
  transformed: {
    text: 'x + 2 > x²',
    verdict: (x) => (x < -2 ? 'undefined' : compare(x + 2, x * x, (a, b) => a > b)),
  },
  amplifier: 'sign-reversal',
  domain: [-3, 3],
  start: 1,
  because:
    'Squaring only preserves order between numbers that are both non-negative. Where x is negative the left-hand side is a square root and cannot be, so the comparison turns round and those solutions are lost.',
};

/**
 * Cancelling a factor. Dividing by x looks like cancelling and is sound above
 * zero, reversing below it, and meaningless at it — all three at once.
 */
const divideByVariable: Witness = {
  id: 'divide-by-variable',
  original: {
    text: 'x² > 3x',
    verdict: (x) => compare(x * x, 3 * x, (a, b) => a > b),
  },
  step: 'divide both sides by x',
  transformed: {
    text: 'x > 3',
    verdict: (x) => compare(x, 3, (a, b) => a > b),
  },
  amplifier: 'domain-loss',
  domain: [-4, 6],
  start: 4,
  because:
    'Dividing by x assumes x is positive and assumes it is not zero. Below zero the inequality reverses, and at zero the division is not a step at all.',
};

export const WITNESSES: readonly Witness[] = [
  multiplyByUnknownSign,
  squareBothSides,
  divideByVariable,
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
  const original = witness.original.verdict(x);
  const transformed = witness.transformed.verdict(x);
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
 * reader never sees an interval that was typed rather than found.
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
    const holds = predicate(here);

    if (holds && runStart === null) {
      runStart = here === start ? start : boundary(predicate, here, previous);
    } else if (!holds && runStart !== null) {
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
  return intervalsWhere((x) => inequality.verdict(x) === 'true', domain);
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
export type ErrorDirection = 'loses solutions' | 'gains solutions' | 'both' | 'neither';

export function errorDirection(witness: Witness): ErrorDirection {
  const loses = intervalsWhere(
    (x) => readingAt(witness, x).original === 'true' && readingAt(witness, x).transformed !== 'true',
    witness.domain,
  ).length > 0;
  const gains = intervalsWhere(
    (x) => readingAt(witness, x).transformed === 'true' && readingAt(witness, x).original !== 'true',
    witness.domain,
  ).length > 0;

  if (loses && gains) return 'both';
  if (loses) return 'loses solutions';
  if (gains) return 'gains solutions';
  return 'neither';
}

/* ------------------------------------------------------------------------- *
 * The control
 * ------------------------------------------------------------------------- */

/**
 * x moves in tenths, carried as an integer.
 *
 * The same detent as module 01's whole degrees, for the same reason: the
 * interesting points here are 2, 3.5, −2, −1 and 0, and a float slider that
 * lands at 1.9999999 would report a verdict for a place the reader is not
 * standing. Tenths put every critical point exactly on the grid.
 */
export const X_STEP_TENTHS = 1;

export function tenthsToX(tenths: number): number {
  return tenths / 10;
}

export function xToTenths(x: number): number {
  return Math.round(x * 10);
}


/* ------------------------------------------------------------------------- *
 * The bank
 * ------------------------------------------------------------------------- */

/**
 * Two kinds of question, and the difference matters.
 *
 * In the first, order preservation is the trap: the step looks symmetric, the
 * arithmetic is right, and the solution set moves. In the second it is the tool
 * — the thing the question asks you to establish or to use on purpose. A reader
 * who has only met the mechanism as a hazard has half of it.
 *
 * Every entry is a citation and a paraphrase. No question text is reproduced;
 * see the standing rule in CONTRIBUTING.md.
 */
export type BankKind = 'trap' | 'principle';

interface BankEntryBase {
  id: string;
  /** Paper, year and question, as a citation. */
  question: string;
  /** The mathematical situation, in this module's words. */
  situation: string;
  /** The question's entry in the STEP database, which carries the paper. */
  link: string;
}

export interface TrapEntry extends BankEntryBase {
  kind: 'trap';
  amplifiers: readonly Amplifier[];
  /**
   * One line per mechanism, because a question listed under two of them is
   * there for two different reasons and repeating one paragraph in both places
   * says neither.
   */
  why: Readonly<Partial<Record<Amplifier, string>>>;
}

export interface PrincipleEntry extends BankEntryBase {
  kind: 'principle';
  amplifiers: readonly [];
  /** What the question asks you to establish or to lean on. */
  why: string;
}

export type BankEntry = TrapEntry | PrincipleEntry;

export const BANK: readonly BankEntry[] = [
  {
    id: 'step1-2001-q2',
    link: 'https://step.maths.org/questions/01-s1-q2',
    kind: 'trap',
    question: 'STEP I 2001, Q2',
    situation:
      'Two inequalities to solve: a cubic against 2/x with x non-zero, and a comparison between two square roots.',
    amplifiers: ['sign-reversal', 'domain-loss'],
    why: {
      'sign-reversal':
        'This module twice over. The first part multiplies through by x, whose sign is unknown; the second squares twice, so order preservation has to be argued at each squaring rather than once.',
      'domain-loss':
        'Each root carries a domain the squared form forgets, and the first part excludes zero before any multiplying starts.',
    },
  },
  {
    id: 'step1-2003-q4',
    link: 'https://step.maths.org/questions/03-s1-q4',
    kind: 'trap',
    question: 'STEP I 2003, Q4',
    situation: 'Solve (sin θ + 1)/cos θ ≤ 1 over a full period, with cos θ non-zero.',
    amplifiers: ['sign-reversal', 'domain-loss'],
    why: {
      'sign-reversal':
        'The same shape as the witness, but the multiplier changes sign twice inside the range, so the step runs one way on some arcs and the other way on the rest.',
      'domain-loss':
        'The two angles where the cosine vanishes are outside the original statement and inside the cleared one, which is where the extra ranges come from.',
    },
  },
  {
    id: 'specimen-1986-s1-q9',
    link: 'https://step.maths.org/questions/spec-s1-q9',
    kind: 'trap',
    question: '1986 Specimen S1, Q9(i)',
    situation: 'Solve |x + (x − 1)/(x + 1)| < 2.',
    amplifiers: ['sign-reversal', 'domain-loss'],
    why: {
      'sign-reversal':
        'A modulus stacked on a rational expression: the modulus splits the problem into cases with opposite order behaviour, and the expression inside changes sign as well.',
      'domain-loss':
        'One value of x is outside the statement altogether, and it sits in the middle of the region the cases are being argued over.',
    },
  },
  {
    id: 'step1-1995-q1',
    link: 'https://step.maths.org/questions/95-s1-q1',
    kind: 'trap',
    question: 'STEP I 1995, Q1(i) and (iii)',
    situation: 'The same cubic inequality posed first in one variable and then in two.',
    amplifiers: ['sign-reversal'],
    why: {
      'sign-reversal':
        'The tempting reduction divides through by an odd power of the second variable, which changes sign with it. The same lesson as the witness, one dimension up, where it is much easier to miss.',
    },
  },
  {
    id: 'step2-2004-q2',
    link: 'https://step.maths.org/questions/04-s2-q2',
    kind: 'trap',
    question: 'STEP II 2004, Q2',
    situation:
      'Solve x² − α|x| + 2 < 0, then give the total length of the solution intervals.',
    amplifiers: ['sign-reversal'],
    why: {
      'sign-reversal':
        'The modulus splits the problem at zero into branches with opposite order behaviour. Self-marking, which is rare and worth using: drop a branch and the total length comes out visibly wrong, so the arithmetic reports the omission back to you.',
    },
  },
  {
    id: 'step2-1997-q8',
    link: 'https://step.maths.org/questions/97-s2-q8',
    kind: 'principle',
    question: 'STEP II 1997, Q8',
    situation:
      'Explain why one function being at least another on an interval means its integral is at least the other\u2019s, then use it.',
    amplifiers: [],
    why: 'This module\u2019s boundary, set as an examination instruction: integration is order-preserving, and the question asks you to say why before leaning on it.',
  },
  {
    id: 'step1-2017-q2',
    link: 'https://step.maths.org/questions/17-s1-q2',
    kind: 'principle',
    question: 'STEP I 2017, Q2',
    situation: 'An inequality integrated three times in succession.',
    amplifiers: [],
    why: 'Order survives each integration, but the direction has to be tracked as the interval flips. The rule used correctly, repeatedly, is the best practice there is for noticing when it is not.',
  },
  {
    id: 'step2-2017-q6',
    link: 'https://step.maths.org/questions/17-s2-q6',
    kind: 'principle',
    question: 'STEP II 2017, Q6(ii)',
    situation: 'A step that squares an inequality, licensed by both sides being non-negative.',
    amplifiers: [],
    why: 'The exact condition the squaring witness violates, stated as a permission rather than a warning.',
  },
  {
    id: 'step2-2016-q4',
    link: 'https://step.maths.org/questions/16-s2-q4',
    kind: 'principle',
    question: 'STEP II 2016, Q4(i)',
    situation: 'A step from A² ≥ B² to |A| ≥ |B|.',
    amplifiers: [],
    why: 'Squaring read backwards. It recovers the moduli and nothing more, which is precisely why the forward step loses the sign information it does.',
  },
  {
    id: 'step1-2018-q2',
    link: 'https://step.maths.org/questions/18-s1-q2',
    kind: 'principle',
    question: 'STEP I 2018, Q2(i)',
    situation: 'A step taking reciprocals of both sides.',
    amplifiers: [],
    why: 'Reciprocals reverse order between quantities of the same sign, and do something else entirely across zero. A third operation with the same character as the two the module works through.',
  },
  {
    id: 'step1-2011-q8',
    link: 'https://step.maths.org/questions/11-s1-q8',
    kind: 'principle',
    question: 'STEP I 2011, Q8(a)',
    situation:
      'Show that one quantity is less than another exactly when a quadratic in n is positive.',
    amplifiers: [],
    why: 'The closest thing in the archive to the disagreement set: the question asks for the precise range on which the two statements agree, which is the same object this module measures.',
  },
];

export interface BankGroup {
  amplifier: Amplifier;
  entries: readonly TrapEntry[];
}

/** Traps grouped by mechanism. A question driven by two appears under both. */
export function bankByAmplifier(bank: readonly BankEntry[] = BANK): BankGroup[] {
  return AMPLIFIERS.map((amplifier) => ({
    amplifier,
    entries: bank.filter(
      (entry): entry is TrapEntry =>
        entry.kind === 'trap' && entry.amplifiers.includes(amplifier),
    ),
  })).filter((group) => group.entries.length > 0);
}

/** The questions where order preservation is the tool rather than the hazard. */
export function principleQuestions(bank: readonly BankEntry[] = BANK): PrincipleEntry[] {
  return bank.filter((entry): entry is PrincipleEntry => entry.kind === 'principle');
}

/**
 * What is behind a bank citation.
 *
 * Paper, year and question number, and nothing else: these are references to
 * work from, and the module has no verified link to give for them. Adding links
 * later means saying what is behind each one — an official paper and a worked
 * solution are different objects to hand somebody who is about to attempt the
 * question.
 */
export const BANK_CITATION_NOTE =
  'Each link is the question\u2019s entry in the STEP database, which carries the paper itself and onward links to worked solutions. Follow one expecting the question, not the answer.';

/**
 * Further questions in the same family, listed and nothing more.
 *
 * The module has not worked these through, and the database entries carry topic
 * keywords rather than the questions themselves, so there is no honest note to
 * write about what each one does with order preservation. They are here because
 * a reader who has run out of the annotated ones should know they exist — with
 * the topics the database itself gives, and no claim beyond that.
 */
export interface FurtherQuestion {
  id: string;
  question: string;
  /** The topics the STEP question database files it under. */
  topics: string;
  link: string;
}

export const FURTHER_QUESTIONS: readonly FurtherQuestion[] = [
  {
    id: '91-s1-q9',
    question: 'STEP I 1991, Q9',
    topics: 'Sums, inequalities, approximation',
    link: 'https://step.maths.org/questions/91-s1-q9',
  },
  {
    id: '02-s3-q4',
    question: 'STEP III 2002, Q4',
    topics: 'Number theory, differences of cubes, sums of squares',
    link: 'https://step.maths.org/questions/02-s3-q4',
  },
  {
    id: '93-s2-q8',
    question: 'STEP II 1993, Q8',
    topics: 'The arithmetic-geometric mean inequality, induction',
    link: 'https://step.maths.org/questions/93-s2-q8',
  },
  {
    id: '15-s2-q1',
    question: 'STEP II 2015, Q1',
    topics: 'Differentiation, infinite series, logarithms',
    link: 'https://step.maths.org/questions/15-s2-q1',
  },
  {
    id: '12-s1-q3',
    question: 'STEP I 2012, Q3',
    topics: 'Integration, curve sketching, tangents, exponentials',
    link: 'https://step.maths.org/questions/12-s1-q3',
  },
  {
    id: '90-s1-q9',
    question: 'STEP I 1990, Q9',
    topics: 'Coordinate geometry, intersections, areas',
    link: 'https://step.maths.org/questions/90-s1-q9',
  },
];

/* ------------------------------------------------------------------------- *
 * Measurement
 * ------------------------------------------------------------------------- */

/**
 * Where a multiplier changes sign, found by bisection on the function itself.
 *
 * This is the item that isolates the mechanism from the solving: a reader who
 * has the idea can name the place a step turns round without touching the
 * inequality it is applied to.
 */
export interface MultiplierItem {
  id: string;
  /** The factor about to be multiplied through, as the reader sees it. */
  text: string;
  factor(x: number): number;
  domain: readonly [number, number];
}

export const MULTIPLIER_ITEMS: readonly MultiplierItem[] = [
  {
    id: 'five-minus-x',
    text: '5 − x',
    factor: (x) => 5 - x,
    domain: [-10, 10],
  },
  {
    id: 'two-x-plus-six',
    text: '2x + 6',
    factor: (x) => 2 * x + 6,
    domain: [-10, 10],
  },
];

/** Every place the factor changes sign inside the window. */
export function signChanges(item: MultiplierItem): number[] {
  const positive = intervalsWhere((x) => item.factor(x) > 0, item.domain);
  const points: number[] = [];
  for (const interval of positive) {
    if (!interval.fromClipped) points.push(interval.from);
    if (!interval.toClipped) points.push(interval.to);
  }
  return points.sort((a, b) => a - b);
}

/** Marked against the computed sign change, to a tenth. */
export function marksSignChange(item: MultiplierItem, response: string): boolean {
  const answer = Number(response.trim());
  if (!Number.isFinite(answer)) return false;
  return signChanges(item).some((point) => Math.abs(point - answer) < 0.05);
}

/**
 * Total length of the solution set.
 *
 * The property worth stealing from 2004 S2 Q2: ask for the total length and the
 * arithmetic marks itself. A reader who drops a branch does not get a wrong
 * shape that has to be checked against a graph — they get a number that is
 * visibly, quantifiably short, and the size of the shortfall is the size of what
 * they lost.
 *
 * The statement here is the module's own, not the examination's.
 */
export interface LengthItem {
  id: string;
  text: string;
  /** The step that loses a branch, and what it leaves. */
  naiveText: string;
  original: Inequality;
  naive: Inequality;
  domain: readonly [number, number];
}

export const LENGTH_ITEM: LengthItem = {
  id: 'total-length',
  text: 'x² − 5|x| + 6 < 0',
  naiveText: 'treating |x| as x, giving x² − 5x + 6 < 0',
  original: {
    text: 'x² − 5|x| + 6 < 0',
    verdict: (x) => compare(x * x - 5 * Math.abs(x) + 6, 0, (a, b) => a < b),
  },
  naive: {
    text: 'x² − 5x + 6 < 0',
    verdict: (x) => compare(x * x - 5 * x + 6, 0, (a, b) => a < b),
  },
  domain: [-8, 8],
};

/**
 * The total length of a set of intervals, or null when one of them runs off the
 * window — an unbounded set has no total length, and reporting a window-sized
 * number for it would be a lie the reader could not see.
 */
export function totalLength(intervals: readonly Interval[]): number | null {
  if (intervals.some((interval) => interval.fromClipped || interval.toClipped)) return null;
  return intervals.reduce((sum, interval) => sum + (interval.to - interval.from), 0);
}

export function solutionLength(
  inequality: Inequality,
  domain: readonly [number, number],
): number | null {
  return totalLength(solutionSet(inequality, domain));
}

/** Marked against the computed total, to a tenth. */
export function marksTotalLength(item: LengthItem, response: string): boolean {
  const answer = Number(response.trim());
  const truth = solutionLength(item.original, item.domain);
  if (!Number.isFinite(answer) || truth === null) return false;
  return Math.abs(truth - answer) < 0.05;
}

export interface StepCase {
  id: string;
  /** The statement and the move, as the reader sees them. */
  text: string;
  stepText: string;
  original: Inequality;
  transformed: Inequality;
  domain: readonly [number, number];
  because: string;
}

/**
 * Cross-context transfer: four steps of the same shape in four different
 * settings, where only whether the operation preserves order separates them.
 * None of them is the witness the module worked through, so recall does not
 * help — and the key is computed from the statements rather than declared.
 */
export const STEP_CASES: readonly StepCase[] = [
  {
    id: 'a',
    text: '2x < 6',
    stepText: 'divide both sides by 2',
    original: { text: '2x < 6', verdict: (x) => compare(2 * x, 6, (a, b) => a < b) },
    transformed: { text: 'x < 3', verdict: (x) => compare(x, 3, (a, b) => a < b) },
    domain: [-8, 8],
    because: 'Dividing by a positive constant is order-preserving everywhere.',
  },
  {
    id: 'b',
    text: '−2x < 6',
    stepText: 'divide both sides by −2',
    original: { text: '−2x < 6', verdict: (x) => compare(-2 * x, 6, (a, b) => a < b) },
    transformed: { text: 'x < −3', verdict: (x) => compare(x, -3, (a, b) => a < b) },
    domain: [-8, 8],
    because:
      'Dividing by a negative constant reverses the order, so the inequality has to turn round. It did not, and the answer is the complement of the truth.',
  },
  {
    id: 'c',
    text: 'x < 4',
    stepText: 'add 3 to both sides',
    original: { text: 'x < 4', verdict: (x) => compare(x, 4, (a, b) => a < b) },
    transformed: { text: 'x + 3 < 7', verdict: (x) => compare(x + 3, 7, (a, b) => a < b) },
    domain: [-8, 8],
    because: 'Adding a constant shifts both sides equally and cannot change the order.',
  },
  {
    id: 'd',
    text: 'x < 4',
    stepText: 'square both sides',
    original: { text: 'x < 4', verdict: (x) => compare(x, 4, (a, b) => a < b) },
    transformed: { text: 'x² < 16', verdict: (x) => compare(x * x, 16, (a, b) => a < b) },
    domain: [-8, 8],
    because:
      'Squaring preserves order only between non-negative numbers. Every x below −4 satisfies the original and fails the square.',
  },
];

export function casePreservesSolutions(item: StepCase): boolean {
  return (
    intervalsWhere(
      (x) => item.original.verdict(x) !== item.transformed.verdict(x),
      item.domain,
    ).length === 0
  );
}

/** The key for the transfer item, in the exact form the widget submits. */
export function stepCaseAnswerKey(): string {
  return canonicalSelection(
    STEP_CASES.filter((item) => casePreservesSolutions(item)).map((item) => item.id),
  );
}

export function marksStepCases(response: string): boolean {
  return response === stepCaseAnswerKey();
}

/** The direction item's key, read off the witness rather than declared. */
export function marksErrorDirection(witnessId: string, response: string): boolean {
  return response === errorDirection(witnessById(witnessId));
}

/* ------------------------------------------------------------------------- *
 * Display
 * ------------------------------------------------------------------------- */

export const X_DECIMALS = 2;

export { formatFixed };

/** An interval as a reader would write it, with the window's edges marked. */
export function formatInterval(interval: Interval, decimals: number = X_DECIMALS): string {
  const from = interval.fromClipped ? '…' : formatFixed(interval.from, decimals);
  const to = interval.toClipped ? '…' : formatFixed(interval.to, decimals);
  return `${from} to ${to}`;
}

export function formatIntervals(intervals: readonly Interval[], decimals: number = X_DECIMALS): string {
  if (intervals.length === 0) return 'nowhere';
  return intervals.map((interval) => formatInterval(interval, decimals)).join(', and ');
}
