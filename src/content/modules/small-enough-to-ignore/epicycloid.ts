import { estimate, indeterminate, type Estimate } from './compute';

/**
 * Beat 5f — the same degeneracy, made visible.
 *
 * A circle of radius a rolls without slipping around the outside of a fixed
 * circle of radius (n-1)a. A point on the rolling circle traces
 *
 *   x(theta) = a(n cos theta + cos n theta)
 *   y(theta) = a(n sin theta + sin n theta)
 *
 * an epicycloid with n-1 cusps. At a cusp both first-order coefficients vanish
 * at once, so the first-order calculation of the gradient returns nothing — and
 * the place where that happens is a corner you can see. The abstract statement
 * "the leading coefficient vanishes" and the visible statement "the curve is not
 * smooth here" are the same statement.
 *
 * This file, its tests and Epicycloid.tsx are the whole of beat 5f. Deleting the
 * three of them and one element in widget.tsx removes it without a trace.
 */

/** Four gives three cusps: enough to see the pattern, few enough to point at. */
export const EPICYCLOID_N = 4;
export const EPICYCLOID_A = 1;

export interface PlanePoint {
  x: number;
  y: number;
}

export function epicycloidPoint(
  theta: number,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): PlanePoint {
  return {
    x: a * (n * Math.cos(theta) + Math.cos(n * theta)),
    y: a * (n * Math.sin(theta) + Math.sin(n * theta)),
  };
}

/** The first-order coefficients: both vanish together at a cusp. */
export function epicycloidVelocity(
  theta: number,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): PlanePoint {
  return {
    x: -a * n * (Math.sin(theta) + Math.sin(n * theta)),
    y: a * n * (Math.cos(theta) + Math.cos(n * theta)),
  };
}

/** The second-order coefficients, which are what survive there. */
export function epicycloidAcceleration(
  theta: number,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): PlanePoint {
  return {
    x: -a * n * (Math.cos(theta) + n * Math.cos(n * theta)),
    y: -a * n * (Math.sin(theta) + n * Math.sin(n * theta)),
  };
}

/**
 * Cusps sit where e^{i(n-1)theta} = -1, that is (n-1)theta = (2k+1)pi. There are
 * n-1 of them, and for n = 4 they land on whole degrees, so the shared theta
 * control can stand exactly on one.
 */
export function epicycloidCusps(n: number = EPICYCLOID_N): number[] {
  const cusps: number[] = [];
  for (let k = 0; k < n - 1; k += 1) {
    cusps.push(((2 * k + 1) * Math.PI) / (n - 1));
  }
  return cusps;
}

const CUSP_TOLERANCE = 1e-9;

/**
 * Measured in the phase rather than by testing whether the velocity is small.
 * The same reasoning as the angle tolerance in compute.ts: pi is not
 * representable, so "the coefficients vanish here" has to be decided from where
 * the reader is standing, not from a float comparison against zero.
 */
export function isAtCusp(theta: number, n: number = EPICYCLOID_N): boolean {
  const offset = (n - 1) * theta - Math.PI;
  const wrapped = offset - 2 * Math.PI * Math.round(offset / (2 * Math.PI));
  return Math.abs(wrapped) < CUSP_TOLERANCE;
}

/**
 * The gradient from first order alone: dy/dx = ydot/xdot. At a cusp that is
 * 0/0, which is exactly the 0/0 the earlier part of the module produced — and
 * the examiner's report on this question notes candidates who reached it and
 * asserted the answer from the earlier part anyway.
 */
export function epicycloidGradient(
  theta: number,
  n: number = EPICYCLOID_N,
): Estimate {
  if (isAtCusp(theta, n)) return indeterminate('nothing-retained');
  const velocity = epicycloidVelocity(theta, n);
  if (Math.abs(velocity.x) < 1e-12) return indeterminate('divergent');
  return estimate(velocity.y / velocity.x);
}

/**
 * The gradient a cusp actually has, from the second-order terms. It comes out as
 * the gradient of OP: the tangent at a cusp points along the radius, which is
 * what a cusp looks like.
 *
 * Defined at a cusp and nowhere else. Away from one the ratio of the two second
 * derivatives is still a number, but it is not the gradient of anything — at
 * theta = 30 degrees it reads -3.50 against a true gradient of -0.27 — so
 * showing it beside the first-order value would have the picture arguing against
 * the prose it sits under. Off a cusp there is nothing to say: first order
 * already settled it.
 */
export function epicycloidCuspGradient(
  theta: number,
  n: number = EPICYCLOID_N,
): Estimate {
  if (!isAtCusp(theta, n)) return indeterminate('not-degenerate');
  const acceleration = epicycloidAcceleration(theta, n);
  if (Math.abs(acceleration.x) < 1e-12) return indeterminate('divergent');
  return estimate(acceleration.y / acceleration.x);
}

/** The raw ratio of second-order coefficients, for tests that pin why it is not shown. */
export function secondOrderRatio(theta: number, n: number = EPICYCLOID_N): number {
  const acceleration = epicycloidAcceleration(theta, n);
  return acceleration.y / acceleration.x;
}

export interface EpicycloidSample extends PlanePoint {
  theta: number;
}

/** The closed curve, for drawing. */
export function epicycloidPath(
  samples = 720,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): EpicycloidSample[] {
  const path: EpicycloidSample[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const theta = (2 * Math.PI * i) / samples;
    path.push({ theta, ...epicycloidPoint(theta, n, a) });
  }
  return path;
}

/** How far the curve reaches, for a frame that fits it exactly. */
export function epicycloidRadius(
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): number {
  return a * (n + 1);
}
