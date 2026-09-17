import { describe, expect, it } from 'vitest';
import {
  ALPHAS,
  DEGENERATE_THETA,
  HOOK_TABLE_N,
  N_SLIDER,
  ORDERS,
  SAFE_THETA,
  THETA_INDEX,
  WITNESS_ALPHAS,
  alphaAt,
  dominanceHalfWidth,
  formatEstimate,
  formatFixed,
  formatLarge,
  formatReadout,
  formatRho,
  formatSmall,
  formatWindowTheta,
  hook,
  hookError,
  hookSweep,
  isDegenerate,
  isValue,
  nFromSlider,
  rExact,
  rFromDefinition,
  rTruncated,
  rhoDenominator,
  seriesCoefficient,
  termSizes,
  thetaFromIndex,
  truncationError,
  valueOr,
  windowSweep,
  type Order,
} from './compute';

/**
 * The closed form -cot(theta + alpha/2) is the oracle. Every truncation, every
 * table and every readout is checked against it rather than against a number
 * someone typed in.
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

  it('has its pole at theta = -alpha/2, not at zero', () => {
    expect(rExact(-0.05, 0.1)).toEqual({ kind: 'indeterminate', reason: 'divergent' });
    expect(isValue(rExact(0, 0.1))).toBe(true);
    expect(valueOr(rExact(0, 0.1), NaN)).toBeCloseTo(-cot(0.05), 12);
  });
});

describe('truncated expansions', () => {
  it('retain nothing at O(1): both series start at first order', () => {
    for (const theta of ORDINARY_THETAS) {
      expect(seriesCoefficient('numerator', theta, 0)).toBe(0);
      expect(seriesCoefficient('denominator', theta, 0)).toBe(0);
      expect(rTruncated(theta, 0.1, 0)).toEqual({ kind: 'indeterminate', reason: 'nothing-retained' });
    }
  });

  it('reproduce the first two coefficients of the two series', () => {
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
   * accident of the arithmetic: the second order buys two powers of alpha, and
   * the third buys none. The test checks the rate rather than a tolerance.
   */
  it.each(ORDINARY_THETAS)('gain two orders at second order at theta = %f', (theta) => {
    const errorAt = (alpha: number, order: Order) =>
      Math.abs(valueOr(rTruncated(theta, alpha, order), NaN) - valueOr(rExact(theta, alpha), NaN));
    expect(errorAt(0.001, 1) / errorAt(0.002, 1)).toBeCloseTo(0.5, 2);
    expect(errorAt(0.001, 2) / errorAt(0.002, 2)).toBeCloseTo(0.125, 2);
    expect(errorAt(0.001, 2)).toBeLessThan(errorAt(0.001, 1) / 1000);
  });

  it('is exactly -2/alpha at the degenerate point once second order is kept', () => {
    for (const alpha of WITNESS_ALPHAS) {
      expect(valueOr(rTruncated(DEGENERATE_THETA, alpha, 2), NaN)).toBeCloseTo(-2 / alpha, 9);
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
   * angle tolerance a reader standing on pi would be shown -8.2e15.
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
});

describe('the hook', () => {
  // At the precision each row of the table in index.md is displayed to.
  const expected: readonly [n: number, shown: string][] = [
    [1, '0.4142136'],
    [10, '0.4987562'],
    [100, '0.4999875'],
    [1_000, '0.4999999'],
    [1_000_000, '0.5000000'],
  ];

  it.each(expected)('n = %i displays as %s', (n, shown) => {
    expect(formatFixed(hook.value(n), 7)).toBe(shown);
  });

  it('uses every value of n the table shows', () => {
    expect(HOOK_TABLE_N).toEqual(expected.map(([n]) => n));
  });

  it('is computed stably: the naive subtraction loses the answer at n = 10^6', () => {
    const n = 1_000_000;
    const naiveFloat = n * (Math.sqrt(n * n + 1) - n);
    expect(formatFixed(hook.value(n), 7)).toBe('0.5000000');
    expect(Math.abs(naiveFloat - hook.limit)).toBeGreaterThan(1e-6);
  });

  it('throws away five ten-millionths at a million, and multiplies it back to a half', () => {
    expect(hook.rawDroppedTerm(1_000_000)).toBeCloseTo(5e-7, 15);
    expect(formatSmall(hook.rawDroppedTerm(1_000_000))).toBe('5.0 × 10⁻⁷');
    for (const n of HOOK_TABLE_N) {
      expect(hook.droppedTerm(n)).toBeCloseTo(hook.limit, 12);
      expect(hook.small(n) * n).toBeCloseTo(hook.value(n), 12);
    }
  });

  it('keeps nothing with zero terms, the limit with one, and converges from below with two', () => {
    for (const n of HOOK_TABLE_N) {
      expect(hook.truncated(n, 0)).toBe(0);
      expect(hook.truncated(n, 1)).toBe(hook.limit);
      expect(hook.truncated(n, 2)).toBeLessThan(hook.limit);
      expect(hook.truncated(n, 2)).toBeCloseTo(hook.limit - 1 / (8 * n * n), 12);
    }
  });

  it('has a discarded effect that does not shrink with zero terms, and does with one', () => {
    expect(hookError(1_000_000, 0)).toBeCloseTo(0.5, 6);
    expect(hookError(1_000, 0)).toBeCloseTo(0.5, 5);
    expect(hookError(1_000, 1)).toBeLessThan(hookError(10, 1));
    expect(hookError(1_000, 1)).toBeLessThan(1e-6);
  });

  it('reaches 1, 10, 100 and a million exactly from the slider', () => {
    expect(nFromSlider(N_SLIDER.min)).toBe(1);
    expect(nFromSlider(10)).toBe(10);
    expect(nFromSlider(20)).toBe(100);
    expect(nFromSlider(N_SLIDER.max)).toBe(1_000_000);
    const sweep = hookSweep(0);
    expect(sweep).toHaveLength(N_SLIDER.max - N_SLIDER.min + 1);
    expect(sweep.every((s) => s.truncated === 0)).toBe(true);
    expect(sweep.at(-1)?.value).toBeCloseTo(0.5, 9);
  });
});

describe('the window around theta = 0', () => {
  it('puts theta = 0 and the true pole exactly on the grid', () => {
    for (const alpha of ALPHAS) {
      expect(thetaFromIndex(0, alpha)).toBe(0);
      expect(thetaFromIndex(-5, alpha)).toBeCloseTo(-alpha / 2, 15);
      expect(rExact(thetaFromIndex(-5, alpha), alpha)).toEqual({
        kind: 'indeterminate',
        reason: 'divergent',
      });
    }
  });

  it('has the dropped term larger than the kept one exactly inside |tan theta| < alpha/2', () => {
    for (const alpha of ALPHAS) {
      const half = dominanceHalfWidth(alpha);
      expect(half).toBeCloseTo(Math.atan(alpha / 2), 15);
      expect(rhoDenominator(half * 0.9, alpha)).toBeLessThan(1);
      expect(rhoDenominator(half * 1.1, alpha)).toBeGreaterThan(1);
      expect(rhoDenominator(0, alpha)).toBe(0);
      const at = termSizes(0, alpha);
      expect(at.kept).toBe(0);
      expect(at.dropped).toBeCloseTo((alpha * alpha) / 2, 15);
    }
  });

  it('never closes: the window shrinks with alpha but is never empty', () => {
    const widths = ALPHAS.map((alpha) => dominanceHalfWidth(alpha));
    for (let i = 1; i < widths.length; i += 1) {
      expect(widths[i] as number).toBeLessThan(widths[i - 1] as number);
      expect(widths[i] as number).toBeGreaterThan(0);
    }
  });

  it('is indeterminate at exactly theta = 0 at first order, and nowhere else in the window', () => {
    for (const alpha of ALPHAS) {
      const sweep = windowSweep(alpha, 1);
      expect(sweep).toHaveLength(THETA_INDEX.max - THETA_INDEX.min + 1);
      const dead = sweep.filter((s) => !isValue(s.truncated)).map((s) => s.theta);
      expect(dead).toEqual([0]);
    }
  });

  it('recovers everywhere at second order, and lands on -2/alpha at zero', () => {
    for (const alpha of ALPHAS) {
      const sweep = windowSweep(alpha, 2);
      expect(sweep.filter((s) => !isValue(s.truncated))).toHaveLength(0);
      const atZero = sweep.find((s) => s.theta === 0);
      expect(valueOr(atZero?.truncated ?? rTruncated(0, alpha, 0), NaN)).toBeCloseTo(-2 / alpha, 6);
    }
  });

  it('has no discarded effect to report when one side is not a value', () => {
    expect(truncationError(rExact(0, 0.05), rTruncated(0, 0.05, 1))).toBeNull();
    const fine = truncationError(rExact(0, 0.05), rTruncated(0, 0.05, 2));
    expect(fine).not.toBeNull();
    expect(fine as number).toBeLessThan(0.05);
  });

  it('offers alphas from 0.3 down to 0.001, clamped', () => {
    expect(alphaAt(0)).toBe(0.3);
    expect(alphaAt(ALPHAS.length - 1)).toBe(0.001);
    expect(alphaAt(-3)).toBe(0.3);
    expect(alphaAt(99)).toBe(0.001);
  });
});

describe('witness table: theta = pi/3 and theta = 0', () => {
  it('settles at -cot(pi/3) and runs away as -2/alpha', () => {
    for (const alpha of WITNESS_ALPHAS) {
      expect(Math.abs(valueOr(rExact(SAFE_THETA, alpha), NaN) + cot(SAFE_THETA))).toBeLessThan(alpha);
      expect(Math.abs(valueOr(rExact(DEGENERATE_THETA, alpha), NaN) - -2 / alpha)).toBeLessThan(alpha);
    }
    expect(formatEstimate(rExact(SAFE_THETA, 0.0001), 4)).toBe('-0.5773');
    expect(formatEstimate(rExact(DEGENERATE_THETA, 0.001), 4)).toBe('-1999.9998');
  });
});

describe('readouts', () => {
  it('says how big a runaway value is rather than printing meaningless digits', () => {
    expect(formatLarge(-0.5773)).toBe('-0.577');
    expect(formatLarge(-2000)).toBe('-2000');
    expect(formatLarge(-8.2e15)).toBe('-8.2 × 10¹⁵');
  });

  it('never renders a non-value as a number', () => {
    expect(formatReadout(rTruncated(DEGENERATE_THETA, 0.05, 1))).toBe('kept denominator is 0');
    expect(formatReadout(rExact(-0.025, 0.05))).toBe('no value: a pole');
    expect(formatReadout(rTruncated(SAFE_THETA, 0.001, 1))).toBe('-0.577');
    for (const order of ORDERS) {
      const result = rTruncated(DEGENERATE_THETA, 0.1, order);
      if (isValue(result)) expect(Number.isFinite(result.value)).toBe(true);
      else expect(formatEstimate(result, 4)).not.toMatch(/^-?\d+(\.\d+)?$/);
    }
  });

  it('never signs a zero', () => {
    expect(formatFixed(-1.2246e-16, 3)).toBe('0.000');
    expect(formatFixed(-0, 2)).toBe('0.00');
    expect(formatFixed(-0.0004, 3)).toBe('0.000');
    expect(formatFixed(-0.6, 1)).toBe('-0.6');
  });

  it('reports rho at its limits', () => {
    expect(formatRho(Number.POSITIVE_INFINITY)).toBe('unbounded');
    expect(formatRho(0)).toBe('0');
    expect(formatRho(2.5)).toBe('2.50');
  });

  it('writes the window theta as a multiple of alpha and in radians', () => {
    expect(formatWindowTheta(15, 0.05)).toBe('1.5α = 0.0750');
    expect(formatWindowTheta(-5, 0.1)).toBe('−0.5α = -0.0500');
    expect(formatWindowTheta(0, 0.3)).toBe('0.0α = 0.0000');
  });

  it('shows the same value either side of the boundary at fixed order', () => {
    const first = formatReadout(rTruncated(SAFE_THETA, 0.001, 1));
    const second = formatReadout(rTruncated(SAFE_THETA, 0.001, 2));
    expect(second).toBe(first);
  });
});
