import { describe, expect, it } from 'vitest';
import {
  BANK,
  PRIMARY_WITNESS,
  STEP_CASES,
  WITNESSES,
  X_DECIMALS,
  bankByAmplifier,
  casePreservesSolutions,
  disagreementSet,
  errorDirection,
  formatIntervals,
  MULTIPLIER_ITEMS,
  intervalsWhere,
  marksErrorDirection,
  marksSignChange,
  signChanges,
  marksStepCases,
  principleQuestions,
  readingAt,
  solutionSet,
  stepCaseAnswerKey,
  stepIsSound,
  tenthsToX,
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
    expect(original.verdict(2)).toBe('undefined');
    // ...while the multiplied-out version has an opinion, which is the whole
    // point: the step changed where the statement is defined.
    expect(transformed.verdict(2)).toBe('false');
  });

  it('reads the original correctly either side of the pole', () => {
    // (0 + 1)/(0 - 2) = -0.5, comfortably under 3.
    expect(PRIMARY_WITNESS.original.verdict(0)).toBe('true');
    // (3 + 1)/(3 - 2) = 4, which is not.
    expect(PRIMARY_WITNESS.original.verdict(3)).toBe('false');
    // (4 + 1)/(4 - 2) = 2.5.
    expect(PRIMARY_WITNESS.original.verdict(4)).toBe('true');
  });

  it('agrees with itself where the step was sound', () => {
    const reading = readingAt(PRIMARY_WITNESS, 4);
    expect(reading).toEqual({ x: 4, original: 'true', transformed: 'true', agree: true });
  });

  it('disagrees on the branch the step discards', () => {
    const reading = readingAt(PRIMARY_WITNESS, 0);
    expect(reading.original).toBe('true');
    expect(reading.transformed).toBe('false');
    expect(reading.agree).toBe(false);
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
    // 1/3 is not on any decimal grid; the endpoint still comes back exactly.
    const found = intervalsWhere((x) => x > 1 / 3, [-1, 1]);
    expect(found).toHaveLength(1);
    expect(found[0]?.from).toBeCloseTo(1 / 3, 12);
  });

  it('reports a predicate that never fails as one clipped interval', () => {
    const found = intervalsWhere(() => true, [-2, 2]);
    expect(found).toEqual([{ from: -2, to: 2, fromClipped: true, toClipped: true }]);
  });

  it('reports a predicate that never holds as nothing', () => {
    expect(intervalsWhere(() => false, [-2, 2])).toEqual([]);
    expect(formatIntervals([])).toBe('nowhere');
  });
});

describe('the disagreement set', () => {
  it('is the branch the multiplication threw away', () => {
    const d = disagreementSet(PRIMARY_WITNESS);
    expect(d).toHaveLength(1);
    expect(d[0]?.fromClipped).toBe(true);
    expect(d[0]?.to).toBeCloseTo(2, 9);
    expect(formatIntervals(d)).toBe('… to 2.00');
  });

  it('is where the right-hand side is negative, when squaring', () => {
    const witness = witnessById('square-both-sides');
    const d = disagreementSet(witness);
    expect(d).toHaveLength(1);
    expect(d[0]?.from).toBeCloseTo(-2, 9);
    expect(d[0]?.to).toBeCloseTo(-1, 9);
  });

  it('is everything below zero, when dividing by x', () => {
    const d = disagreementSet(witnessById('divide-by-variable'));
    expect(d).toHaveLength(1);
    expect(d[0]?.to).toBeCloseTo(0, 9);
  });

  it('is empty exactly when the step is sound', () => {
    for (const witness of WITNESSES) {
      expect(disagreementSet(witness).length).toBeGreaterThan(0);
      expect(stepIsSound(witness)).toBe(false);
    }

    // The same machinery on a step that really is sound.
    const sound: Witness = {
      ...PRIMARY_WITNESS,
      id: 'sound',
      original: { text: 'x < 4', verdict: (x) => (x < 4 ? 'true' : 'false') },
      step: 'add 3 to both sides',
      transformed: { text: 'x + 3 < 7', verdict: (x) => (x + 3 < 7 ? 'true' : 'false') },
    };
    expect(disagreementSet(sound)).toEqual([]);
    expect(stepIsSound(sound)).toBe(true);
  });
});

describe('the direction of the error', () => {
  it('is loss for every witness the module works through', () => {
    for (const witness of WITNESSES) {
      expect(errorDirection(witness)).toBe('loses solutions');
    }
  });

  it('is both when the step reverses the order outright', () => {
    // -2x < 6 is x > -3; dividing by -2 without turning it round gives x < -3,
    // which is the complement: everything true is lost and everything gained is false.
    const reversed = STEP_CASES.find((item) => item.id === 'b');
    const witness: Witness = {
      ...PRIMARY_WITNESS,
      id: 'reversed',
      original: reversed!.original,
      transformed: reversed!.transformed,
      domain: reversed!.domain,
    };
    expect(errorDirection(witness)).toBe('both');
  });

  it('marks the direction item from the witness rather than a stored answer', () => {
    expect(marksErrorDirection(PRIMARY_WITNESS.id, 'loses solutions')).toBe(true);
    expect(marksErrorDirection(PRIMARY_WITNESS.id, 'gains solutions')).toBe(false);
    expect(marksErrorDirection(PRIMARY_WITNESS.id, 'both')).toBe(false);
  });
});

describe('the transfer item', () => {
  it('separates the steps that preserve the solution set from those that do not', () => {
    expect(
      STEP_CASES.map((item) => [item.id, casePreservesSolutions(item)]),
    ).toEqual([
      ['a', true],
      ['b', false],
      ['c', true],
      ['d', false],
    ]);
  });

  it('derives its key from the statements', () => {
    expect(stepCaseAnswerKey()).toBe('a,c');
    expect(marksStepCases('a,c')).toBe(true);
    // The taught shape — "it has a negative in it" — is not the answer.
    expect(marksStepCases('b,d')).toBe(false);
    expect(marksStepCases('a,b,c,d')).toBe(false);
  });

  it('offers cases the module never worked through', () => {
    const workedThrough = WITNESSES.map((witness) => witness.original.text);
    for (const item of STEP_CASES) {
      expect(workedThrough).not.toContain(item.original.text);
    }
  });
});

describe('the bank', () => {
  it('groups the traps by mechanism, not by topic', () => {
    const groups = bankByAmplifier();
    // Only mechanisms with entries appear, so extending the shared vocabulary
    // never leaves an empty drawer on the page.
    expect(groups.map((group) => group.amplifier)).toEqual(['sign-reversal', 'domain-loss']);
    for (const group of groups) {
      expect(group.entries.length).toBeGreaterThan(0);
      for (const entry of group.entries) {
        expect(entry.kind).toBe('trap');
        expect(entry.amplifiers).toContain(group.amplifier);
      }
    }
  });

  it('lists a question driven by two mechanisms under both', () => {
    const both = BANK.filter((entry) => entry.amplifiers.length === 2);
    expect(both.length).toBeGreaterThan(0);
    const groups = bankByAmplifier();
    for (const entry of both) {
      const appearances = groups.filter((group) =>
        group.entries.some((each) => each.id === entry.id),
      );
      expect(appearances).toHaveLength(2);
    }
  });

  it('keeps the questions where the principle is the tool in their own group', () => {
    const principles = principleQuestions();
    expect(principles.length).toBeGreaterThan(0);
    for (const entry of principles) {
      // A principle question has no amplifier: nothing is going wrong in it.
      expect(entry.amplifiers).toEqual([]);
      expect(entry.kind).toBe('principle');
    }
    // And none of them leaks into the trap groupings.
    const traps = bankByAmplifier().flatMap((group) => group.entries.map((e) => e.id));
    for (const entry of principles) expect(traps).not.toContain(entry.id);
  });

  it('cites every entry by paper, year and question', () => {
    for (const entry of BANK) {
      expect(entry.question).toMatch(/^(STEP I{1,2} \d{4}|1986 Specimen S1), Q/);
      expect(entry.situation.length).toBeGreaterThan(20);
    }
  });

  it('says what each mechanism contributes, so no cell repeats another', () => {
    for (const entry of BANK) {
      if (entry.kind === 'principle') {
        expect(entry.why.length).toBeGreaterThan(20);
        continue;
      }
      // A trap listed under two mechanisms is there for two different reasons.
      for (const amplifier of entry.amplifiers) {
        expect(entry.why[amplifier]?.length ?? 0).toBeGreaterThan(20);
      }
      const reasons = entry.amplifiers.map((amplifier) => entry.why[amplifier]);
      expect(new Set(reasons).size).toBe(reasons.length);
      // ...and carries no reason for a mechanism it is not filed under.
      expect(Object.keys(entry.why).sort()).toEqual([...entry.amplifiers].sort());
    }
  });

  it('covers every entry exactly once between the two groups', () => {
    const trapIds = new Set(
      BANK.filter((entry) => entry.kind === 'trap').map((entry) => entry.id),
    );
    const principleIds = new Set(principleQuestions().map((entry) => entry.id));
    expect(trapIds.size + principleIds.size).toBe(BANK.length);
  });
});

describe('the sign-change item', () => {
  it('finds where each factor turns round', () => {
    // Bisection, so the endpoint is correct to floating-point rather than exact.
    const found = MULTIPLIER_ITEMS.map((item) => signChanges(item));
    expect(found.map((points) => points.length)).toEqual([1, 1]);
    expect(found[0]?.[0]).toBeCloseTo(5, 12);
    expect(found[1]?.[0]).toBeCloseTo(-3, 12);
  });

  it('marks the computed point and nothing else', () => {
    const [fiveMinusX] = MULTIPLIER_ITEMS;
    expect(marksSignChange(fiveMinusX!, '5')).toBe(true);
    expect(marksSignChange(fiveMinusX!, '5.0')).toBe(true);
    expect(marksSignChange(fiveMinusX!, '-5')).toBe(false);
    expect(marksSignChange(fiveMinusX!, '0')).toBe(false);
    expect(marksSignChange(fiveMinusX!, 'five')).toBe(false);
  });
});

describe('the x control', () => {
  it('puts every critical point exactly on the grid', () => {
    for (const x of [-2, -1, 0, 2, 3, 3.5]) {
      expect(tenthsToX(xToTenths(x))).toBe(x);
    }
  });

  it('cannot land beside a pole and report a verdict for somewhere else', () => {
    // The detent: 20 tenths is exactly 2, where the quotient is undefined.
    expect(tenthsToX(20)).toBe(2);
    expect(PRIMARY_WITNESS.original.verdict(tenthsToX(20))).toBe('undefined');
    expect(PRIMARY_WITNESS.original.verdict(tenthsToX(19))).toBe('true');
    expect(PRIMARY_WITNESS.original.verdict(tenthsToX(21))).toBe('false');
  });
});

describe('display', () => {
  it('marks an interval that runs off the window', () => {
    expect(formatIntervals(disagreementSet(PRIMARY_WITNESS), X_DECIMALS)).toBe('… to 2.00');
  });

  it('joins the two branches of a solution set', () => {
    expect(formatIntervals(solutionSet(PRIMARY_WITNESS.original, PRIMARY_WITNESS.domain))).toBe(
      '… to 2.00, and 3.50 to …',
    );
  });
});
