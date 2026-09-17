import { describe, expect, it } from 'vitest';
import { isValue, valueOr } from './compute';
import {
  EPICYCLOID_A,
  EPICYCLOID_N,
  EPICYCLOID_N_OPTIONS,
  contactPoint,
  cuspDegrees,
  degreesToRadians,
  epicycloidAcceleration,
  epicycloidCuspGradient,
  epicycloidCusps,
  epicycloidGradient,
  epicycloidPath,
  epicycloidPoint,
  epicycloidRadius,
  epicycloidSpeed,
  epicycloidVelocity,
  isAtCusp,
  nearestCuspDegrees,
  rollingCentre,
  secondOrderRatio,
  speedSweep,
} from './epicycloid';

/**
 * The claim the third panel makes is that the point where first order dies is
 * the point where the curve has a corner. These tests are that claim: the
 * velocity vanishes exactly at the cusps, the first-order gradient is
 * indeterminate there and nowhere else, and the gradient the second-order terms
 * give is the gradient of the radius.
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

  it('closes on itself and stays inside the frame drawn for it', () => {
    const start = epicycloidPoint(0, n);
    const end = epicycloidPoint(2 * Math.PI, n);
    expect(end.x).toBeCloseTo(start.x, 12);
    expect(end.y).toBeCloseTo(start.y, 12);
    const radius = epicycloidRadius(n, EPICYCLOID_A);
    for (const { x, y } of epicycloidPath(360, n)) {
      expect(Math.hypot(x, y)).toBeLessThanOrEqual(radius + 1e-9);
    }
  });

  it('is traced by a point one rolling radius from the rolling centre', () => {
    for (const degrees of [0, 33, 90, 200, 300]) {
      const theta = degreesToRadians(degrees);
      const p = epicycloidPoint(theta, n);
      const c = rollingCentre(theta, n);
      expect(Math.hypot(p.x - c.x, p.y - c.y)).toBeCloseTo(EPICYCLOID_A, 12);
      expect(Math.hypot(c.x, c.y)).toBeCloseTo(n * EPICYCLOID_A, 12);
      const q = contactPoint(theta, n);
      expect(Math.hypot(q.x, q.y)).toBeCloseTo((n - 1) * EPICYCLOID_A, 12);
    }
  });

  it('can be drawn up to a given theta, for the traced-so-far path', () => {
    const partial = epicycloidPath(100, n, EPICYCLOID_A, Math.PI);
    expect(partial).toHaveLength(101);
    expect(partial.at(-1)?.theta).toBeCloseTo(Math.PI, 12);
  });
});

describe('the cusps', () => {
  it('are where both first-order coefficients vanish at once, and the speed is exactly zero', () => {
    for (const theta of epicycloidCusps(n)) {
      const velocity = epicycloidVelocity(theta, n);
      expect(Math.abs(velocity.x)).toBeLessThan(1e-12);
      expect(Math.abs(velocity.y)).toBeLessThan(1e-12);
      expect(epicycloidSpeed(theta, n)).toBeLessThan(1e-12);
      expect(isAtCusp(theta, n)).toBe(true);
    }
  });

  it('are the only places the velocity dies, on the degree grid', () => {
    const dead = [];
    for (let degrees = 0; degrees < 360; degrees += 1) {
      if (isAtCusp(degreesToRadians(degrees), n)) dead.push(degrees);
    }
    expect(dead).toEqual([60, 180, 300]);
    expect(cuspDegrees(n)).toEqual([60, 180, 300]);
  });

  it('land on whole degrees for every n the panel offers', () => {
    for (const option of EPICYCLOID_N_OPTIONS) {
      const degrees = cuspDegrees(option);
      expect(degrees).toHaveLength(option - 1);
      for (const d of degrees) expect(isAtCusp(degreesToRadians(d), option)).toBe(true);
    }
  });

  it('leave every reachable neighbour alone', () => {
    for (const degrees of [59, 61, 179, 181, 299, 301]) {
      const theta = degreesToRadians(degrees);
      expect(isAtCusp(theta, n)).toBe(false);
      expect(isValue(epicycloidGradient(theta, n))).toBe(true);
    }
  });

  it('are where P is the point of contact: at the inner radius, on the ray through O', () => {
    for (const theta of epicycloidCusps(n)) {
      const point = epicycloidPoint(theta, n, EPICYCLOID_A);
      const contact = contactPoint(theta, n, EPICYCLOID_A);
      expect(point.x).toBeCloseTo(contact.x, 9);
      expect(point.y).toBeCloseTo(contact.y, 9);
    }
  });

  it('can be snapped to from anywhere, going the short way round', () => {
    expect(nearestCuspDegrees(70, n)).toBe(60);
    expect(nearestCuspDegrees(130, n)).toBe(180);
    expect(nearestCuspDegrees(350, n)).toBe(300);
    expect(nearestCuspDegrees(5, n)).toBe(60);
    expect(nearestCuspDegrees(359, 6)).toBe(324);
  });
});

describe('the gradient', () => {
  it('is indeterminate at a cusp: first order retains nothing', () => {
    for (const theta of epicycloidCusps(n)) {
      expect(epicycloidGradient(theta, n)).toEqual({ kind: 'indeterminate', reason: 'nothing-retained' });
    }
  });

  it('comes out along the radius once second order is kept', () => {
    for (const theta of epicycloidCusps(n)) {
      const second = epicycloidCuspGradient(theta, n);
      expect(isValue(second)).toBe(true);
      expect(valueOr(second, NaN)).toBeCloseTo(Math.tan(theta), 8);
      const point = epicycloidPoint(theta, n);
      expect(valueOr(second, NaN)).toBeCloseTo(point.y / point.x, 8);
      const acceleration = epicycloidAcceleration(theta, n);
      expect(valueOr(second, NaN)).toBeCloseTo(acceleration.y / acceleration.x, 12);
    }
  });

  /**
   * Away from a cusp the ratio of the second-order coefficients is still a
   * number, and it is not the gradient. The panel must not show it there.
   */
  it('has no second-order gradient to offer away from a cusp', () => {
    for (const degrees of [30, 45, 90, 200]) {
      const theta = degreesToRadians(degrees);
      expect(epicycloidCuspGradient(theta, n)).toEqual({ kind: 'indeterminate', reason: 'not-degenerate' });
      const truth = valueOr(epicycloidGradient(theta, n), NaN);
      expect(Math.abs(secondOrderRatio(theta, n) - truth)).toBeGreaterThan(0.1);
    }
  });

  it('is an ordinary number away from the cusps', () => {
    for (const degrees of [10, 45, 100, 200, 330]) {
      const theta = degreesToRadians(degrees);
      const gradient = epicycloidGradient(theta, n);
      expect(isValue(gradient)).toBe(true);
      const velocity = epicycloidVelocity(theta, n);
      expect(valueOr(gradient, NaN)).toBeCloseTo(velocity.y / velocity.x, 12);
    }
  });
});

describe('the speed chart', () => {
  it('samples a full turn and touches zero only at the cusps', () => {
    const sweep = speedSweep(n);
    expect(sweep).toHaveLength(361);
    const zeros = sweep.filter(([, speed]) => speed < 1e-9).map(([degrees]) => degrees);
    expect(zeros).toEqual([60, 180, 300]);
    // Fastest at the outer points, where the rolling and the turning add.
    const fastest = sweep.reduce((best, s) => (s[1] > best[1] ? s : best));
    expect([0, 120, 240, 360]).toContain(fastest[0]);
  });
});
