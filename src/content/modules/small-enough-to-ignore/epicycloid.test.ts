import { describe, expect, it } from 'vitest';
import { isValue, valueOr } from './compute';
import {
  EPICYCLOID_A,
  EPICYCLOID_N,
  epicycloidAcceleration,
  epicycloidCuspGradient,
  epicycloidCusps,
  epicycloidGradient,
  epicycloidPath,
  epicycloidPoint,
  epicycloidRadius,
  epicycloidVelocity,
  isAtCusp,
  secondOrderRatio,
} from './epicycloid';

/**
 * The claim beat 5f makes is that the point where first order dies is the point
 * where the curve has a corner. These tests are that claim: the velocity
 * vanishes exactly at the cusps, the first-order gradient is indeterminate there
 * and nowhere else, and the gradient the second-order terms give is the gradient
 * of the radius.
 */

const n = EPICYCLOID_N;

describe('the curve', () => {
  it('has n - 1 cusps, evenly spaced', () => {
    const cusps = epicycloidCusps(n);
    expect(cusps).toHaveLength(n - 1);
    cusps.forEach((theta, k) => {
      expect(theta).toBeCloseTo(((2 * k + 1) * Math.PI) / (n - 1), 12);
    });
  });

  it('closes on itself', () => {
    const start = epicycloidPoint(0, n);
    const end = epicycloidPoint(2 * Math.PI, n);
    expect(end.x).toBeCloseTo(start.x, 12);
    expect(end.y).toBeCloseTo(start.y, 12);
  });

  it('stays inside the frame drawn for it', () => {
    const radius = epicycloidRadius(n, EPICYCLOID_A);
    for (const { x, y } of epicycloidPath(360, n)) {
      expect(Math.hypot(x, y)).toBeLessThanOrEqual(radius + 1e-9);
    }
  });
});

describe('the cusps', () => {
  it('are where both first-order coefficients vanish at once', () => {
    for (const theta of epicycloidCusps(n)) {
      const velocity = epicycloidVelocity(theta, n);
      expect(Math.abs(velocity.x)).toBeLessThan(1e-12);
      expect(Math.abs(velocity.y)).toBeLessThan(1e-12);
      expect(isAtCusp(theta, n)).toBe(true);
    }
  });

  it('are the only places the velocity dies', () => {
    // Every whole degree the shared control can reach.
    const dead = [];
    for (let degrees = 0; degrees < 360; degrees += 1) {
      const theta = (degrees * Math.PI) / 180;
      if (isAtCusp(theta, n)) dead.push(degrees);
    }
    expect(dead).toEqual([60, 180, 300]);
  });

  it('leave every reachable neighbour alone', () => {
    for (const degrees of [59, 61, 179, 181, 299, 301]) {
      const theta = (degrees * Math.PI) / 180;
      expect(isAtCusp(theta, n)).toBe(false);
      expect(isValue(epicycloidGradient(theta, n))).toBe(true);
    }
  });

  it('sit at the inner radius, on the ray through the origin', () => {
    for (const theta of epicycloidCusps(n)) {
      const point = epicycloidPoint(theta, n, EPICYCLOID_A);
      expect(Math.hypot(point.x, point.y)).toBeCloseTo(EPICYCLOID_A * (n - 1), 9);
      expect(Math.atan2(point.y, point.x)).toBeCloseTo(Math.atan2(Math.sin(theta), Math.cos(theta)), 9);
    }
  });
});

describe('the gradient', () => {
  it('is indeterminate at a cusp: first order retains nothing', () => {
    for (const theta of epicycloidCusps(n)) {
      expect(epicycloidGradient(theta, n)).toEqual({
        kind: 'indeterminate',
        reason: 'nothing-retained',
      });
    }
  });

  it('comes out along the radius once second order is kept', () => {
    for (const theta of epicycloidCusps(n)) {
      const second = epicycloidCuspGradient(theta, n);
      expect(isValue(second)).toBe(true);
      // tan(theta): the gradient of OP, which is what a cusp looks like.
      expect(valueOr(second, NaN)).toBeCloseTo(Math.tan(theta), 8);

      // And it agrees with the position of the point itself.
      const point = epicycloidPoint(theta, n);
      expect(valueOr(second, NaN)).toBeCloseTo(point.y / point.x, 8);
    }
  });

  it('is the ratio of the second-order coefficients, not a formula of its own', () => {
    for (const theta of epicycloidCusps(n)) {
      const acceleration = epicycloidAcceleration(theta, n);
      expect(valueOr(epicycloidCuspGradient(theta, n), NaN)).toBeCloseTo(
        acceleration.y / acceleration.x,
        12,
      );
    }
  });

  /**
   * Away from a cusp the ratio of the second-order coefficients is still a
   * number, and it is not the gradient. The component must not show it there:
   * two contradicting figures under one heading would argue against the prose
   * beside them, which says that away from the degeneracy first order settles it.
   */
  it('has no second-order gradient to offer away from a cusp', () => {
    for (const degrees of [30, 45, 90, 200]) {
      const theta = (degrees * Math.PI) / 180;
      expect(epicycloidCuspGradient(theta, n)).toEqual({
        kind: 'indeterminate',
        reason: 'not-degenerate',
      });

      // ...and this is why: the raw ratio disagrees with the real gradient.
      const truth = valueOr(epicycloidGradient(theta, n), NaN);
      expect(Math.abs(secondOrderRatio(theta, n) - truth)).toBeGreaterThan(0.1);
    }
  });

  it('is an ordinary number away from the cusps', () => {
    for (const degrees of [10, 45, 100, 200, 330]) {
      const theta = (degrees * Math.PI) / 180;
      const gradient = epicycloidGradient(theta, n);
      expect(isValue(gradient)).toBe(true);
      const velocity = epicycloidVelocity(theta, n);
      expect(valueOr(gradient, NaN)).toBeCloseTo(velocity.y / velocity.x, 12);
    }
  });
});
