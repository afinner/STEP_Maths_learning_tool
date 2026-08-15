import { describe, expect, it } from 'vitest';
import {
  ALPHA,
  DEGENERATE_THETA,
  HOOK_TABLE_N,
  ORDERS,
  SAFE_THETA,
  THETA_MAX_DEGREES,
  THETA_MIN_DEGREES,
  WITNESS_ALPHAS,
  degreesToRadians,
  formatEstimate,
  formatFixed,
  formatLarge,
  formatReadout,
  formatRho,
  formatSmall,
  hook,
  hookRho,
  isDegenerate,
  isValue,
  indeterminate as indeterminateOf,
  nearestDegenerateTheta,
  rExact,
  rFromDefinition,
  rTruncated,
  radiansToDegrees,
  rho,
  seriesCoefficient,
  thetaSweep,
  valueOr,
  type Order,
} from './compute';

/**
 * The closed form -cot(theta + alpha/2) is the oracle. Every truncation, every
 * table and every value of rho is checked against it rather than against a
 * number someone typed in.
 */

const cot = (x: number) => Math.cos(x) / Math.sin(x);

/** Points away from the degenerate set {0, pi, 2pi, ...}, where cot is finite. */
const ORDINARY_THETAS = [SAFE_THETA, 0.4, 1.0, 2.5, -0.7];

describe('the closed form is the definition', () => {
  it.each(ORDINARY_THETAS)('agrees with the difference quotient at theta = %f', (theta) => {
    for (const alpha of WITNESS_ALPHAS) {
      const exact = rExact(theta, alpha);
      const direct = rFromDefinition(theta, alpha);
      expect(isValue(exact) && isValue(direct)).toBe(true);
      expect(valueOr(exact, NaN)).toBeCloseTo(valueOr(direct, NaN), 10);
    }
  });

  it('is -cot(theta + alpha/2)', () => {
    expect(valueOr(rExact(SAFE_THETA, 0.1), NaN)).toBeCloseTo(-cot(SAFE_THETA + 0.05), 12);
  });
});

describe('truncated expansions', () => {
  it('retain nothing at O(1): both series start at first order', () => {
    for (const theta of ORDINARY_THETAS) {
      expect(seriesCoefficient('numerator', theta, 0)).toBe(0);
      expect(seriesCoefficient('denominator', theta, 0)).toBe(0);
      expect(rTruncated(theta, 0.1, 0)).toEqual({
        kind: 'indeterminate',
        reason: 'nothing-retained',
      });
    }
  });

  it('reproduce the first-order coefficients of the two series', () => {
    for (const theta of ORDINARY_THETAS) {
      expect(seriesCoefficient('numerator', theta, 1)).toBeCloseTo(Math.cos(theta), 12);
      expect(seriesCoefficient('denominator', theta, 1)).toBeCloseTo(-Math.sin(theta), 12);
      expect(seriesCoefficient('numerator', theta, 2)).toBeCloseTo(-Math.sin(theta) / 2, 12);
      expect(seriesCoefficient('denominator', theta, 2)).toBeCloseTo(-Math.cos(theta) / 2, 12);
    }
  });

  it('give -cot(theta) at first order, away from the degenerate points', () => {
    for (const theta of ORDINARY_THETAS) {
      expect(valueOr(rTruncated(theta, 0.01, 1), NaN)).toBeCloseTo(-cot(theta), 12);
    }
  });

  /**
   * The orders come in pairs, which is a property of this expression and not an
   * accident of the arithmetic.
   *
   * Writing h = alpha/2, the exact value is -(cos - sin tan h)/(sin + cos tan h)
   * once the common factor of cos h is divided out. Truncating at second order
   * is that expression with tan h replaced by h; at third order it is tan h
   * replaced by h + (2/3)h^3. Since tan h = h + h^3/3, the two truncations sit
   * the same distance from the exact value on opposite sides. So the second
   * order buys two powers of alpha, and the third buys none.
   *
   * The test checks the rate rather than a tolerance, so it is a test of the
   * expansion and not of one lucky value.
   */
  it.each(ORDINARY_THETAS)('gain two orders at second order at theta = %f', (theta) => {
    const errorAt = (alpha: number, order: Order) =>
      Math.abs(valueOr(rTruncated(theta, alpha, order), NaN) - valueOr(rExact(theta, alpha), NaN));

    // Rates are asymptotic, so they are measured where the next correction is
    // negligible: at alpha = 0.01 the second-order correction still moves the
    // first-order ratio by a percent or so.
    // First order: error proportional to alpha. Halving alpha halves it.
    expect(errorAt(0.001, 1) / errorAt(0.002, 1)).toBeCloseTo(0.5, 2);

    // Second order: error proportional to alpha^3. Halving alpha divides by 8.
    expect(errorAt(0.001, 2) / errorAt(0.002, 2)).toBeCloseTo(0.125, 2);

    // ...and second order is far better than first.
    expect(errorAt(0.001, 2)).toBeLessThan(errorAt(0.001, 1) / 1000);
  });

  it.each(ORDINARY_THETAS)(
    'straddle the exact value at second and third order at theta = %f',
    (theta) => {
      const alpha = 0.01;
      const exact = valueOr(rExact(theta, alpha), NaN);
      const second = valueOr(rTruncated(theta, alpha, 2), NaN) - exact;
      const third = valueOr(rTruncated(theta, alpha, 3), NaN) - exact;

      // Opposite sides, same distance: the pairing above, stated numerically.
      expect(Math.sign(second)).toBe(-Math.sign(third));
      expect(Math.abs(third / second)).toBeCloseTo(1, 3);
    },
  );

  it('is exactly -2/alpha at the degenerate point once second order is kept', () => {
    for (const alpha of WITNESS_ALPHAS) {
      expect(valueOr(rTruncated(DEGENERATE_THETA, alpha, 2), NaN)).toBeCloseTo(
        -2 / alpha,
        9,
      );
    }
  });

  it('is indeterminate at the degenerate point at first order', () => {
    for (const alpha of WITNESS_ALPHAS) {
      expect(rTruncated(DEGENERATE_THETA, alpha, 1)).toEqual({
        kind: 'indeterminate',
        reason: 'retained-denominator-vanishes',
      });
    }
  });

  /**
   * The float trap. Math.sin(Math.PI) is 1.2246e-16, not zero, so without the
   * angle tolerance a reader standing on pi would be shown -8.2e15: a huge
   * finite number in the one place the module needs to say "indeterminate".
   */
  it('is indeterminate at every multiple of pi at first order', () => {
    for (const theta of [0, Math.PI, 2 * Math.PI, -Math.PI, 3 * Math.PI]) {
      expect(rTruncated(theta, 0.1, 1)).toEqual({
        kind: 'indeterminate',
        reason: 'retained-denominator-vanishes',
      });
      expect(isDegenerate(theta)).toBe(true);
    }
  });

  it('leaves every point a reader can actually reach alone', () => {
    // The finest step the theta control offers, either side of every degenerate point.
    const step = Math.PI / 180;
    for (const k of [-1, 0, 1, 2]) {
      for (const offset of [step, -step]) {
        const theta = k * Math.PI + offset;
        expect(isDegenerate(theta)).toBe(false);
        expect(isValue(rTruncated(theta, 0.1, 1))).toBe(true);
      }
    }
  });

  it('snaps to the degenerate point nearest a given theta', () => {
    expect(nearestDegenerateTheta(0.2)).toBe(0);
    expect(nearestDegenerateTheta(Math.PI - 0.2)).toBeCloseTo(Math.PI, 12);
    expect(isDegenerate(nearestDegenerateTheta(Math.PI + 0.3))).toBe(true);
  });
});

/* -------------------------------------------------------------------------- *
 * The spec's tables
 * -------------------------------------------------------------------------- */

describe('break table: the hook', () => {
  // Spec §2 beat 3, at the precision each row is displayed to.
  const expected: readonly [n: number, decimals: number, shown: string][] = [
    [1, 6, '0.414214'],
    [10, 6, '0.498756'],
    [100, 6, '0.499988'],
    [1_000, 7, '0.4999999'],
    [1_000_000, 7, '0.5000000'],
  ];

  it.each(expected)('n = %i displays as %s', (n, decimals, shown) => {
    expect(formatFixed(hook.value(n), decimals)).toBe(shown);
  });

  it('uses every value of n the table shows', () => {
    expect(HOOK_TABLE_N).toEqual(expected.map(([n]) => n));
  });

  it('approaches one half, and the expansion says how fast', () => {
    expect(hook.value(1e9)).toBeCloseTo(hook.limit, 12);

    for (const n of [10, 100, 1000]) {
      // The first term is the limit itself: everything after it is the rate.
      expect(hook.expansion(n, 1)).toBe(hook.limit);

      // 1/2 - 1/(8n^2) + 1/(16n^4): each term takes the error down by n^2.
      const errors = [1, 2, 3].map((terms) =>
        Math.abs(hook.expansion(n, terms) - hook.value(n)),
      );
      expect(errors[1] as number).toBeLessThan((errors[0] as number) / (n * n));
      expect(errors[2] as number).toBeLessThan((errors[1] as number) / (n * n));
    }
  });

  it('is computed stably: the naive subtraction loses the answer at n = 10^6', () => {
    const n = 1_000_000;
    const naiveFloat = n * (Math.sqrt(n * n + 1) - n);
    expect(formatFixed(hook.value(n), 7)).toBe('0.5000000');
    // Not a criticism of the reader: the same term, dropped by the arithmetic.
    expect(Math.abs(naiveFloat - hook.limit)).toBeGreaterThan(1e-6);
  });
});

describe('witness table: theta = 0', () => {
  // Spec §2 beat 5c, second column. Every cell agrees with the closed form.
  const expected: readonly [alpha: number, decimals: number, shown: string][] = [
    [0.1, 2, '-19.98'],
    [0.01, 3, '-199.998'],
    [0.001, 4, '-1999.9998'],
    [0.0001, 5, '-19999.99998'],
  ];

  it.each(expected)('alpha = %f displays as %s', (alpha, decimals, shown) => {
    expect(formatEstimate(rExact(DEGENERATE_THETA, alpha), decimals)).toBe(shown);
  });

  it('is -2/alpha to leading order, which is where the dropped term went', () => {
    for (const alpha of WITNESS_ALPHAS) {
      const exact = valueOr(rExact(DEGENERATE_THETA, alpha), NaN);
      expect(Math.abs(exact - -2 / alpha)).toBeLessThan(alpha);
    }
  });
});

describe('witness table: theta = pi/3', () => {
  /**
   * REPORTED DISCREPANCY (spec §2 beat 5c, first column).
   *
   * The spec shows -0.51068 at alpha = 0.1 and -0.57068 at alpha = 0.01. The
   * closed form gives -0.51250 and -0.57070. The spec's four cells are instead
   * reproduced by the linearisation of the closed form, -[cot(theta) -
   * (alpha/2)csc^2(theta)] — see the test below, which pins that diagnosis.
   *
   * Neither side has been adjusted. These assertions are the oracle's values;
   * the discrepancy is with the author.
   */
  const expected: readonly [alpha: number, decimals: number, shown: string][] = [
    [0.1, 5, '-0.51250'],
    [0.01, 5, '-0.57070'],
    [0.001, 5, '-0.57668'],
    [0.0001, 5, '-0.57728'],
  ];

  it.each(expected)('alpha = %f displays as %s', (alpha, decimals, shown) => {
    expect(formatEstimate(rExact(SAFE_THETA, alpha), decimals)).toBe(shown);
  });

  it('settles on -cot(pi/3) as alpha shrinks', () => {
    const settled = valueOr(rExact(SAFE_THETA, 1e-9), NaN);
    expect(settled).toBeCloseTo(-cot(SAFE_THETA), 8);
    expect(formatFixed(settled, 4)).toBe('-0.5774');
  });

  it('the spec cells are the linearisation of the closed form', () => {
    const linearised = (theta: number, alpha: number) =>
      -(cot(theta) - (alpha / 2) / Math.sin(theta) ** 2);
    const specCells = ['-0.51068', '-0.57068', '-0.57668', '-0.57728'];
    WITNESS_ALPHAS.forEach((alpha, i) => {
      expect(formatFixed(linearised(SAFE_THETA, alpha), 5)).toBe(specCells[i]);
    });
  });
});

/* -------------------------------------------------------------------------- *
 * The decisive quantity
 * -------------------------------------------------------------------------- */

describe('rho', () => {
  it('diverges at theta = pi/3 as alpha shrinks', () => {
    const first = rho(SAFE_THETA, 0.1, 1).binding;
    const tenth = rho(SAFE_THETA, 0.01, 1).binding;
    const hundredth = rho(SAFE_THETA, 0.001, 1).binding;

    expect(first).toBeGreaterThan(0);
    // rho scales like 1/alpha: ten times smaller alpha, ten times larger rho.
    expect(tenth / first).toBeCloseTo(10, 6);
    expect(hundredth / tenth).toBeCloseTo(10, 6);
    expect(rho(SAFE_THETA, 1e-6, 1).verdict).toBe('safe');
  });

  it('is 2cot(theta)/alpha in the numerator, as the spec states', () => {
    for (const alpha of WITNESS_ALPHAS) {
      const report = rho(SAFE_THETA, alpha, 1);
      expect(report.numerator.rho).toBeCloseTo((2 * cot(SAFE_THETA)) / alpha, 6);
    }
  });

  it('collapses to zero at theta = 0, whatever alpha is', () => {
    for (const alpha of WITNESS_ALPHAS) {
      const report = rho(DEGENERATE_THETA, alpha, 1);
      expect(report.denominator.kept).toBe(0);
      expect(report.denominator.rho).toBe(0);
      expect(report.binding).toBe(0);
      expect(report.verdict).toBe('unsafe');
    }
  });

  it('recovers at theta = 0 once the second order is retained', () => {
    const report = rho(DEGENERATE_THETA, 0.01, 2);
    expect(report.denominator.kept).toBeGreaterThan(0);
    expect(report.verdict).toBe('safe');
  });

  it('is zero for the hook: everything kept cancels', () => {
    for (const n of HOOK_TABLE_N) {
      const report = hookRho(n);
      expect(report.kept).toBe(0);
      expect(report.dropped).toBeCloseTo(0.5, 12);
      expect(report.rho).toBe(0);
    }
  });
});

describe('driving theta through the degenerate point', () => {
  it('puts both degenerate points and both interesting angles on the grid', () => {
    for (const degrees of [0, 180, 60, 90]) {
      expect(Number.isInteger(degrees)).toBe(true);
      expect(degrees).toBeGreaterThanOrEqual(THETA_MIN_DEGREES);
      expect(degrees).toBeLessThanOrEqual(THETA_MAX_DEGREES);
    }
    expect(degreesToRadians(0)).toBe(0);
    expect(degreesToRadians(60)).toBeCloseTo(SAFE_THETA, 12);
    expect(radiansToDegrees(SAFE_THETA)).toBe(60);
  });

  it('is indeterminate at exactly the two degenerate points, and nowhere else', () => {
    const sweep = thetaSweep(1);
    const indeterminate = sweep.filter((s) => !isValue(s.value)).map((s) => s.degrees);
    expect(indeterminate).toEqual([0, 180]);
  });

  /**
   * The transition the module is built around: the value has to run away on the
   * approach and then stop being a value, rather than jumping from something
   * ordinary to nothing.
   */
  it('diverges on the approach from both sides', () => {
    const at = (degrees: number) =>
      Math.abs(valueOr(rTruncated(degreesToRadians(degrees), ALPHA, 1), NaN));

    for (const side of [1, -1]) {
      expect(at(side * 10)).toBeGreaterThan(at(side * 30));
      expect(at(side * 3)).toBeGreaterThan(at(side * 10));
      expect(at(side * 1)).toBeGreaterThan(at(side * 3));
      expect(at(side * 1)).toBeGreaterThan(50);
    }
  });

  it('recovers immediately either side of the point at second order', () => {
    const sweep = thetaSweep(2);
    expect(sweep.filter((s) => !isValue(s.value))).toHaveLength(0);
    // At the point itself, second order gives the -2/alpha the module promises.
    const atZero = sweep.find((s) => s.degrees === 0);
    expect(valueOr(atZero?.value ?? indeterminateOf('divergent'), NaN)).toBeCloseTo(-2 / ALPHA, 6);
  });

  it('retains nothing anywhere at O(1)', () => {
    expect(thetaSweep(0).every((s) => !isValue(s.value))).toBe(true);
  });
});

describe('beat 4: where the answer went', () => {
  it('throws away five ten-millionths at a million', () => {
    expect(hook.rawDroppedTerm(1_000_000)).toBeCloseTo(5e-7, 15);
    expect(formatSmall(hook.rawDroppedTerm(1_000_000))).toBe('5.0 × 10\u207b\u2077');
  });

  it('multiplies it back up to the answer, at every n', () => {
    for (const n of HOOK_TABLE_N) {
      expect(hook.droppedTerm(n)).toBeCloseTo(hook.limit, 12);
      expect(hook.rawDroppedTerm(n) * n).toBeCloseTo(hook.limit, 12);
    }
  });

  it('keeps nothing: what survived the cancellation is exactly zero', () => {
    for (const n of HOOK_TABLE_N) expect(hook.naiveValue(n)).toBe(0);
  });
});

describe('readouts', () => {
  it('says how big a runaway value is rather than printing meaningless digits', () => {
    expect(formatLarge(-0.5773)).toBe('-0.577');
    expect(formatLarge(-2000)).toBe('-2000');
    expect(formatLarge(-8.2e15)).toBe('-8.2 × 10\u00b9\u2075');
  });

  it('never renders a non-value as a number', () => {
    expect(formatReadout(rTruncated(DEGENERATE_THETA, ALPHA, 1))).toBe('indeterminate');
    expect(formatReadout(rTruncated(SAFE_THETA, ALPHA, 1))).toBe('-0.577');
  });

  it('reports an unbounded rho as unbounded', () => {
    expect(formatRho(Number.POSITIVE_INFINITY)).toBe('unbounded');
    expect(formatRho(0)).toBe('0');
  });

  it('shows the same value either side of the boundary at fixed order', () => {
    // The claim in section 5: at pi/3 the value stops moving once alpha is kept.
    const first = formatReadout(rTruncated(SAFE_THETA, ALPHA, 1));
    const second = formatReadout(rTruncated(SAFE_THETA, ALPHA, 2));
    const third = formatReadout(rTruncated(SAFE_THETA, ALPHA, 3));
    expect(second).toBe(first);
    expect(third).toBe(first);
  });
});

describe('estimates', () => {
  it('never reports a non-value as a number', () => {
    for (const order of ORDERS) {
      const result = rTruncated(DEGENERATE_THETA, 0.1, order);
      if (!isValue(result)) {
        expect(formatEstimate(result, 4)).toBe('indeterminate');
      } else {
        expect(Number.isFinite(result.value)).toBe(true);
      }
    }
  });

  it('is indeterminate rather than infinite where the exact form has a pole', () => {
    expect(rExact(0, 0)).toEqual({ kind: 'indeterminate', reason: 'divergent' });
  });
});
