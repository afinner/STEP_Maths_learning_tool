import { estimate, indeterminate, type Estimate } from './compute';

/**
 * The same degeneracy, made visible.
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
 */

/** Four gives three cusps: enough to see the pattern, few enough to point at. */
export const EPICYCLOID_N = 4;
export const EPICYCLOID_A = 1;
/** The values of n the panel offers. Every cusp lands on a whole degree for each of them. */
export const EPICYCLOID_N_OPTIONS: readonly number[] = [3, 4, 5, 6];

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

/** The centre of the rolling circle: distance na from the origin, in the direction theta. */
export function rollingCentre(
  theta: number,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): PlanePoint {
  return { x: n * a * Math.cos(theta), y: n * a * Math.sin(theta) };
}

/** Where the two circles touch. */
export function contactPoint(
  theta: number,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): PlanePoint {
  return { x: (n - 1) * a * Math.cos(theta), y: (n - 1) * a * Math.sin(theta) };
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

/** |velocity|: how fast the tracing point is moving. Exactly zero at a cusp. */
export function epicycloidSpeed(
  theta: number,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
): number {
  const v = epicycloidVelocity(theta, n, a);
  return Math.hypot(v.x, v.y);
}

/**
 * Cusps sit where cos((n-1)theta) = -1, that is (n-1)theta = (2k+1)pi. There
 * are n-1 of them.
 */
export function epicycloidCusps(n: number = EPICYCLOID_N): number[] {
  const cusps: number[] = [];
  for (let k = 0; k < n - 1; k += 1) {
    cusps.push(((2 * k + 1) * Math.PI) / (n - 1));
  }
  return cusps;
}

/** The cusps in whole degrees, which they are for every n the panel offers. */
export function cuspDegrees(n: number = EPICYCLOID_N): number[] {
  return epicycloidCusps(n).map((theta) => Math.round((theta * 180) / Math.PI));
}

/** The cusp nearest a given angle, in degrees. */
export function nearestCuspDegrees(degrees: number, n: number = EPICYCLOID_N): number {
  let best = cuspDegrees(n)[0] ?? 0;
  let distance = Number.POSITIVE_INFINITY;
  for (const cusp of cuspDegrees(n)) {
    const gap = Math.min(Math.abs(cusp - degrees), 360 - Math.abs(cusp - degrees));
    if (gap < distance) {
      distance = gap;
      best = cusp;
    }
  }
  return best;
}

const CUSP_TOLERANCE = 1e-9;

/**
 * Measured in the phase rather than by testing whether the velocity is small:
 * pi is not representable, so "the coefficients vanish here" has to be decided
 * from where the reader is standing, not from a float comparison against zero.
 */
export function isAtCusp(theta: number, n: number = EPICYCLOID_N): boolean {
  const offset = (n - 1) * theta - Math.PI;
  const wrapped = offset - 2 * Math.PI * Math.round(offset / (2 * Math.PI));
  return Math.abs(wrapped) < CUSP_TOLERANCE;
}

/**
 * The gradient from first order alone: dy/dx = ydot/xdot. At a cusp that is
 * 0/0 — exactly the 0/0 the ratio R produced at theta = 0.
 */
export function epicycloidGradient(theta: number, n: number = EPICYCLOID_N): Estimate {
  if (isAtCusp(theta, n)) return indeterminate('nothing-retained');
  const velocity = epicycloidVelocity(theta, n);
  if (Math.abs(velocity.x) < 1e-12) return indeterminate('divergent');
  return estimate(velocity.y / velocity.x);
}

/**
 * The gradient a cusp actually has, from the second-order terms. It comes out as
 * the gradient of OP: the tangent at a cusp points along the radius.
 *
 * Defined at a cusp and nowhere else. Away from one the ratio of the two second
 * derivatives is still a number, but it is not the gradient of anything.
 */
export function epicycloidCuspGradient(theta: number, n: number = EPICYCLOID_N): Estimate {
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

/** The curve from theta = 0 up to `until`, for drawing. */
export function epicycloidPath(
  samples = 720,
  n: number = EPICYCLOID_N,
  a: number = EPICYCLOID_A,
  until: number = 2 * Math.PI,
): EpicycloidSample[] {
  const path: EpicycloidSample[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const theta = (until * i) / samples;
    path.push({ theta, ...epicycloidPoint(theta, n, a) });
  }
  return path;
}

/** How far the curve reaches, for a frame that fits it exactly. */
export function epicycloidRadius(n: number = EPICYCLOID_N, a: number = EPICYCLOID_A): number {
  return a * (n + 1);
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Speed against theta over a full turn, one sample per degree. */
export function speedSweep(n: number = EPICYCLOID_N): readonly [degrees: number, speed: number][] {
  const points: [number, number][] = [];
  for (let degrees = 0; degrees <= 360; degrees += 1) {
    points.push([degrees, epicycloidSpeed(degreesToRadians(degrees), n)]);
  }
  return points;
}
