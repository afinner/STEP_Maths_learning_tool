import { describe, expect, it } from 'vitest';
import {
  PRIMARY_WITNESS,
  WITNESSES,
  X_DECIMALS,
  curveOf,
  disagreementSet,
  errorDirection,
  formatIntervals,
  formatLength,
  intervalsWhere,
  operationAt,
  operationRange,
  orderOf,
  readingAt,
  solutionSet,
  stepIsSound,
  tenthsToX,
  totalLength,
  verdict,
  witnessById,
  xToTenths,
  type Witness,
} from './compute';

/**
 * The inequalities themselves are the oracle. Every interval below is found by
 * evaluating them and refining the endpoint, so these tests check the maths
 * rather than restating a number someone typed.
 */

describe('verdicts', () => {
  it('separates false from not defined', () => {
    const { original, transformed } = PRIMARY_WITNESS;
    // At x = 2 the quotient asks nothing at all...
    expect(verdict(original, 2)).toBe('undefined');
    // ...while the multiplied-out version has an opinion.
    expect(verdict(transformed, 2)).toBe('false');
  });

  it('reads the original correctly either side of the pole', () => {
    expect(verdict(PRIMARY_WITNESS.original, 0)).toBe('true');
    expect(verdict(PRIMARY_WITNESS.original, 3)).toBe('false');
    expect(verdict(PRIMARY_WITNESS.original, 4)).toBe('true');
  });

  it('agrees with itself where the step was sound, and disagrees on the discarded branch', () => {
    expect(readingAt(PRIMARY_WITNESS, 4)).toEqual({
      x: 4,
      original: 'true',
      transformed: 'true',
      agree: true,
    });
    const lost = readingAt(PRIMARY_WITNESS, 0);
    expect(lost.original).toBe('true');
    expect(lost.transformed).toBe('false');
    expect(lost.agree).toBe(false);
  });

  it('treats a root of a negative as not defined', () => {
    const square = witnessById('square-both-sides');
    expect(verdict(square.original, -2.5)).toBe('undefined');
    expect(verdict(square.original, -2)).toBe('true');
  });
});

describe('solution sets', () => {
  it('finds both branches of the true solution', () => {
    const intervals = solutionSet(PRIMARY_WITNESS.original, PRIMARY_WITNESS.domain);
    expect(intervals).toHaveLength(2);
    expect(intervals[0]?.to).toBeCloseTo(2, 9);
    expect(intervals[0]?.fromClipped).toBe(true);
    expect(intervals[1]?.from).toBeCloseTo(3.5, 9);
    expect(intervals[1]?.toClipped).toBe(true);
  });

  it('finds only one branch after the step', () => {
    const intervals = solutionSet(PRIMARY_WITNESS.transformed, PRIMARY_WITNESS.domain);
    expect(intervals).toHaveLength(1);
    expect(intervals[0]?.from).toBeCloseTo(3.5, 9);
  });

  it('refines endpoints rather than reporting the scan grid', () => {
    const found = intervalsWhere((x) => x > 1 / 3, [-1, 1]);
    expect(found).toHaveLength(1);
    expect(found[0]?.from).toBeCloseTo(1 / 3, 12);
  });

  it('reports a predicate that never fails as one clipped interval, and one that never holds as nothing', () => {
    expect(intervalsWhere(() => true, [-2, 2])).toEqual([
      { from: -2, to: 2, fromClipped: true, toClipped: true },
    ]);
    expect(intervalsWhere(() => false, [-2, 2])).toEqual([]);
    expect(formatIntervals([])).toBe('empty');
  });
});

describe('the disagreement set', () => {
  it('is the branch the multiplication threw away', () => {
    const d = disagreementSet(PRIMARY_WITNESS);
    expect(d).toHaveLength(1);
    expect(d[0]?.fromClipped).toBe(true);
    expect(d[0]?.to).toBeCloseTo(2, 9);
    expect(formatIntervals(d)).toBe('−∞ to 2.00');
  });

  it('is where the right-hand side is negative and larger in size, when squaring', () => {
    const d = disagreementSet(witnessById('square-both-sides'));
    expect(d).toHaveLength(1);
    expect(d[0]?.from).toBeCloseTo(-2, 9);
    expect(d[0]?.to).toBeCloseTo(-1, 9);
    expect(totalLength(d)).toBeCloseTo(1, 9);
  });

  it('is everything below zero, when dividing by x', () => {
    const d = disagreementSet(witnessById('divide-by-variable'));
    expect(d).toHaveLength(1);
    expect(d[0]?.fromClipped).toBe(true);
    expect(d[0]?.to).toBeCloseTo(0, 9);
  });

  it('covers the negative axis for the STEP question, part (i)', () => {
    const witness = witnessById('step-2001-i');
    // Wrong at every negative x but one: gains x < -1, loses -1 < x < 0.
    expect(readingAt(witness, -2)).toMatchObject({ original: 'false', transformed: 'true' });
    expect(readingAt(witness, -0.5)).toMatchObject({ original: 'true', transformed: 'false' });
    expect(readingAt(witness, -1).agree).toBe(true);
    // And right on the positive side.
    for (const x of [0.5, 1.5, 2.5]) expect(readingAt(witness, x).agree).toBe(true);

    const d = disagreementSet(witness);
    expect(d[0]?.fromClipped).toBe(true);
    expect(d.at(-1)?.to).toBeCloseTo(0, 6);
    expect(errorDirection(witness)).toBe('loses and gains');
  });

  it('is the third of a unit the second squaring admits, for part (ii)', () => {
    const witness = witnessById('step-2001-ii');
    const d = disagreementSet(witness);
    expect(d).toHaveLength(1);
    expect(d[0]?.from).toBeCloseTo(-10 / 3, 9);
    expect(d[0]?.to).toBeCloseTo(-3, 9);
    expect(errorDirection(witness)).toBe('gains solutions');
    // The true solution is x > 5 and nothing else.
    const truth = solutionSet(witness.original, witness.domain);
    expect(truth).toHaveLength(1);
    expect(truth[0]?.from).toBeCloseTo(5, 9);
    expect(truth[0]?.toClipped).toBe(true);
  });

  it('is empty exactly when the step is sound', () => {
    for (const witness of WITNESSES) {
      expect(disagreementSet(witness).length).toBeGreaterThan(0);
      expect(stepIsSound(witness)).toBe(false);
    }

    const sound: Witness = {
      ...PRIMARY_WITNESS,
      id: 'multiply-by-unknown-sign',
      original: { text: 'x < 4', relation: '<', left: (x) => x, right: () => 4 },
      step: 'add 3 to both sides',
      transformed: { text: 'x + 3 < 7', relation: '<', left: (x) => x + 3, right: () => 7 },
    };
    expect(disagreementSet(sound)).toEqual([]);
    expect(stepIsSound(sound)).toBe(true);
  });
});

describe('the direction of the error', () => {
  it('is loss for the three constructed witnesses', () => {
    for (const id of ['multiply-by-unknown-sign', 'square-both-sides', 'divide-by-variable']) {
      expect(errorDirection(witnessById(id))).toBe('loses solutions');
    }
  });

  it('is both when the step reverses the order outright', () => {
    const reversed: Witness = {
      ...PRIMARY_WITNESS,
      original: { text: '−2x < 6', relation: '<', left: (x) => -2 * x, right: () => 6 },
      transformed: { text: 'x < −3', relation: '<', left: (x) => x, right: () => -3 },
      domain: [-8, 8],
    };
    expect(errorDirection(reversed)).toBe('loses and gains');
  });
});

describe('the step as a function', () => {
  it('preserves order where the multiplier is positive and reverses it where it is negative', () => {
    expect(operationAt(PRIMARY_WITNESS, 5).outcome).toBe('preserved');
    expect(operationAt(PRIMARY_WITNESS, 0).outcome).toBe('reversed');
    expect(operationAt(PRIMARY_WITNESS, 2).outcome).toBe('undefined');
  });

  it('agrees with the verdicts: preserved means the two statements agree', () => {
    for (const witness of WITNESSES) {
      for (let tenths = xToTenths(witness.domain[0]); tenths <= xToTenths(witness.domain[1]); tenths += 1) {
        const x = tenthsToX(tenths);
        const reading = readingAt(witness, x);
        const op = operationAt(witness, x);
        if (op.outcome === 'preserved') expect(reading.agree).toBe(true);
        if (op.outcome === 'reversed' && reading.original !== 'undefined') {
          // Reversal flips the verdict unless both sides coincide.
          expect(reading.agree).toBe(false);
        }
      }
    }
  });

  it('reverses squaring exactly where one side is negative and further from zero', () => {
    const square = witnessById('square-both-sides');
    expect(operationAt(square, -1.5).outcome).toBe('reversed');
    expect(operationAt(square, -0.5).outcome).toBe('preserved');
    expect(operationAt(square, 1).outcome).toBe('preserved');
    expect(operationAt(square, -2.5).outcome).toBe('undefined');
  });

  it('describes the multiplier at the reader’s x', () => {
    expect(PRIMARY_WITNESS.operation.describe(0)).toContain('−2.0');
    expect(PRIMARY_WITNESS.operation.describe(5)).toContain('3.0');
  });

  it('draws a window that contains both sides and zero', () => {
    for (const witness of WITNESSES) {
      const x = witness.start;
      const [lo, hi] = operationRange(witness, x);
      const sides = witness.operation.sides(x);
      expect(sides).not.toBeNull();
      for (const side of sides ?? []) {
        expect(side).toBeGreaterThan(lo);
        expect(side).toBeLessThan(hi);
      }
      expect(lo).toBeLessThan(0);
      expect(hi).toBeGreaterThan(0);
    }
  });

  it('orders numbers, and refuses to order what is not a number', () => {
    expect(orderOf(1, 2)).toBe('lt');
    expect(orderOf(2, 1)).toBe('gt');
    expect(orderOf(1, 1)).toBe('eq');
    expect(orderOf(NaN, 1)).toBe('undefined');
  });
});

describe('curves', () => {
  it('breaks the line where a side leaves the frame or is undefined', () => {
    const points = curveOf(PRIMARY_WITNESS.original.left, PRIMARY_WITNESS.domain, PRIMARY_WITNESS.yRange, 140);
    const broken = points.filter((p) => Number.isNaN(p[1]));
    // Near the pole at x = 2 the quotient leaves the frame.
    expect(broken.length).toBeGreaterThan(0);
    expect(broken.every((p) => Math.abs(p[0] - 2) < 0.5)).toBe(true);
    // Everywhere else it is drawn.
    expect(points.filter((p) => !Number.isNaN(p[1])).length).toBeGreaterThan(100);
  });
});

describe('the total-length item', () => {
  it('adds up the branches the statement actually has', () => {
    const modulus = { text: 'x² − 5|x| + 6 < 0', relation: '<' as const, left: (x: number) => x * x - 5 * Math.abs(x) + 6, right: () => 0 };
    const naive = { text: 'x² − 5x + 6 < 0', relation: '<' as const, left: (x: number) => x * x - 5 * x + 6, right: () => 0 };
    const truth = totalLength(solutionSet(modulus, [-8, 8]));
    const dropped = totalLength(solutionSet(naive, [-8, 8]));
    expect(truth).toBeCloseTo(2, 9);
    expect(dropped).toBeCloseTo(1, 9);
  });

  it('refuses to give a total length to an unbounded set', () => {
    const unbounded = solutionSet(PRIMARY_WITNESS.original, PRIMARY_WITNESS.domain);
    expect(totalLength(unbounded)).toBeNull();
    expect(formatLength(unbounded)).toBe('unbounded');
  });
});

describe('the x control', () => {
  it('puts every critical point exactly on the grid', () => {
    for (const x of [-2, -1, 0, 2, 3, 3.5, -3, 5]) {
      expect(tenthsToX(xToTenths(x))).toBe(x);
    }
  });

  it('cannot land beside a pole and report a verdict for somewhere else', () => {
    expect(tenthsToX(20)).toBe(2);
    expect(verdict(PRIMARY_WITNESS.original, tenthsToX(20))).toBe('undefined');
    expect(verdict(PRIMARY_WITNESS.original, tenthsToX(19))).toBe('true');
    expect(verdict(PRIMARY_WITNESS.original, tenthsToX(21))).toBe('false');
  });

  it('starts every witness where the two statements agree', () => {
    for (const witness of WITNESSES) {
      expect(readingAt(witness, witness.start).agree).toBe(true);
      expect(witness.start).toBeGreaterThanOrEqual(witness.domain[0]);
      expect(witness.start).toBeLessThanOrEqual(witness.domain[1]);
    }
  });
});

describe('display', () => {
  it('marks an interval that runs off the window', () => {
    expect(formatIntervals(disagreementSet(PRIMARY_WITNESS), X_DECIMALS)).toBe('−∞ to 2.00');
  });

  it('joins the two branches of a solution set', () => {
    expect(formatIntervals(solutionSet(PRIMARY_WITNESS.original, PRIMARY_WITNESS.domain))).toBe(
      '−∞ to 2.00, and 3.50 to ∞',
    );
  });

  it('gives a bounded set its length', () => {
    expect(formatLength(disagreementSet(witnessById('square-both-sides')))).toBe('1.00');
  });
});
