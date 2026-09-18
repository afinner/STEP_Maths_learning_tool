import { formatFixed } from '../../../lib/numbers';

/**
 * Module 03 — the isosceles fallacy, and the quantity the figure fixed.
 *
 * The classical argument concludes that every triangle is isosceles. Every
 * congruence in it is genuinely true; the step that fails is an addition, and
 * it fails because of where a point sits on a line — a fact the figure asserted
 * and the argument never stated.
 *
 * Nothing here is drawn or written down twice: the feet, the betweenness
 * parameter, which step is false and the configuration where the construction
 * itself collapses are all computed from the position of A. The fallacy is old
 * enough to be nobody's property, and it is written here in this module's own
 * words either way.
 */

/* -------------------------------------------------------------------------- *
 * Points and lines
 * -------------------------------------------------------------------------- */

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** The base of the figure. B and C are fixed; A is the only thing that moves. */
export const B: Point = { x: 0, y: 0 };
export const C: Point = { x: 12, y: 0 };

/**
 * Floats have to land exactly on the symmetric configuration.
 *
 * A is positioned in integer tenths, so the midpoint of BC is reachable exactly
 * rather than approached: at x = 6 the two distances are the same expression in
 * the same rounding, and AB - AC is zero rather than 1e-16.
 */
export const A_X_TENTHS = { min: 10, max: 110, step: 1 } as const;
export const A_Y_TENTHS = { min: 30, max: 120, step: 1 } as const;

export function tenthsToUnits(tenths: number): number {
  return tenths / 10;
}

export function unitsToTenths(units: number): number {
  return Math.round(units * 10);
}

export interface Params {
  readonly xTenths: number;
  readonly yTenths: number;
}

export function apex(params: Params): Point {
  return { x: tenthsToUnits(params.xTenths), y: tenthsToUnits(params.yTenths) };
}

/** The one configuration in which AB and AC are equal: A above the midpoint. */
export const SYMMETRIC_X_TENTHS = unitsToTenths((B.x + C.x) / 2);

const subtract = (p: Point, q: Point): Point => ({ x: p.x - q.x, y: p.y - q.y });
const add = (p: Point, q: Point): Point => ({ x: p.x + q.x, y: p.y + q.y });
const scale = (p: Point, k: number): Point => ({ x: p.x * k, y: p.y * k });
const dot = (p: Point, q: Point): number => p.x * q.x + p.y * q.y;
const cross = (p: Point, q: Point): number => p.x * q.y - p.y * q.x;

export function distance(p: Point, q: Point): number {
  return Math.hypot(p.x - q.x, p.y - q.y);
}

export function midpoint(p: Point, q: Point): Point {
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
}

function unit(p: Point): Point {
  const length = Math.hypot(p.x, p.y);
  return length === 0 ? { x: 0, y: 0 } : { x: p.x / length, y: p.y / length };
}

/** Where two lines given by a point and a direction meet, or null if parallel. */
export function meet(p: Point, d: Point, q: Point, e: Point): Point | null {
  const denominator = cross(d, e);
  if (Math.abs(denominator) <= PARALLEL_TOLERANCE) return null;
  const s = cross(subtract(q, p), e) / denominator;
  return add(p, scale(d, s));
}

const PARALLEL_TOLERANCE = 1e-12;

/**
 * Equality for quantities that come out of square roots.
 *
 * Relative, because the figure is metres wide and the interesting differences
 * are tenths: an absolute tolerance would either miss a real gap or accept one.
 */
export function nearlyEqual(x: number, y: number): boolean {
  return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
}

/* -------------------------------------------------------------------------- *
 * The construction
 * -------------------------------------------------------------------------- */

export interface Sides {
  /** BC, the side A never touches. */
  readonly bc: number;
  /** CA. */
  readonly ca: number;
  /** AB. */
  readonly ab: number;
}

export function sides(a: Point): Sides {
  return { bc: distance(B, C), ca: distance(C, a), ab: distance(a, B) };
}

/**
 * A foot of a perpendicular, as a position along the side it lands on.
 *
 * `t` is the parameter in A + t(V - A), so t = 0 is A and t = 1 is the far
 * vertex. Everything the argument does with this foot is a statement about t.
 */
export interface Foot {
  readonly point: Point;
  readonly t: number;
  /** min(t, 1 - t): positive inside the side, zero at an end, negative past one. */
  readonly sigma: number;
  /** Distance from A to the foot. */
  readonly fromA: number;
  /** Distance from the foot to the far vertex. */
  readonly toVertex: number;
  readonly inside: boolean;
}

export function footOfPerpendicular(from: Point, a: Point, vertex: Point): Foot {
  const along = subtract(vertex, a);
  const length = Math.hypot(along.x, along.y);
  const t = dot(subtract(from, a), along) / (length * length);
  const point = add(a, scale(along, t));
  return {
    point,
    t,
    sigma: Math.min(t, 1 - t),
    fromA: Math.abs(t) * length,
    toVertex: Math.abs(1 - t) * length,
    inside: t >= 0 && t <= 1,
  };
}

export type Degeneracy =
  /** AB = AC: the two lines of the construction are one line. */
  | 'lines-coincide'
  /** A is on BC: there is no triangle to argue about. */
  | 'no-triangle';

export interface Figure {
  readonly kind: 'figure';
  readonly a: Point;
  /** Where the bisector of angle A meets the perpendicular bisector of BC. */
  readonly p: Point;
  readonly m: Point;
  /** The foot on AB. */
  readonly f: Foot;
  /** The foot on AC. */
  readonly g: Foot;
  readonly sides: Sides;
}

export interface DegenerateFigure {
  readonly kind: 'degenerate';
  readonly reason: Degeneracy;
}

export type FigureResult = Figure | DegenerateFigure;

export function isFigure(result: FigureResult): result is Figure {
  return result.kind === 'figure';
}

/**
 * The figure as it actually is.
 *
 * P is the meeting point the argument asks for, and it lands on the far side of
 * BC every time — it is the midpoint of the arc BC that does not contain A. The
 * construction determines nothing when AB = AC, because the bisector of angle A
 * is then the perpendicular bisector of BC and the two lines coincide.
 */
export function trueFigure(a: Point): FigureResult {
  const measured = sides(a);
  if (nearlyEqual(a.y, B.y) && nearlyEqual(B.y, C.y)) {
    return { kind: 'degenerate', reason: 'no-triangle' };
  }
  if (nearlyEqual(measured.ab, measured.ca)) {
    return { kind: 'degenerate', reason: 'lines-coincide' };
  }

  const bisector = add(unit(subtract(B, a)), unit(subtract(C, a)));
  const m = midpoint(B, C);
  const baseline = subtract(C, B);
  const perpendicular: Point = { x: -baseline.y, y: baseline.x };

  const p = meet(a, bisector, m, perpendicular);
  if (p === null) return { kind: 'degenerate', reason: 'lines-coincide' };

  return {
    kind: 'figure',
    a,
    p,
    m,
    f: footOfPerpendicular(p, a, B),
    g: footOfPerpendicular(p, a, C),
    sides: measured,
  };
}

/**
 * The figure as it gets drawn.
 *
 * Somebody drawing this puts P inside the triangle, because that is where two
 * lines through the inside of a triangle are expected to cross. Take them at
 * their word — P on the bisector of angle A, inside — and the incentre is the
 * point they have drawn. Both feet then land inside their sides, which is
 * exactly what makes the addition look like nothing worth checking.
 *
 * The drawing is not free, though. Its P is not equidistant from B and C, so
 * the line it calls the perpendicular bisector of BC does not meet BC at a
 * right angle. `drawnAngleAtM` is that angle, in degrees, and it is the price
 * of putting P where the picture puts it.
 */
export interface DrawnFigure {
  readonly a: Point;
  readonly p: Point;
  readonly m: Point;
  readonly f: Foot;
  readonly g: Foot;
  readonly sides: Sides;
}

export function drawnFigure(a: Point): DrawnFigure {
  const measured = sides(a);
  const weight = measured.bc + measured.ca + measured.ab;
  const p = scale(
    add(add(scale(a, measured.bc), scale(B, measured.ca)), scale(C, measured.ab)),
    1 / weight,
  );
  return {
    a,
    p,
    m: midpoint(B, C),
    f: footOfPerpendicular(p, a, B),
    g: footOfPerpendicular(p, a, C),
    sides: measured,
  };
}

/** The angle the drawn figure makes at M, where the argument needs a right angle. */
export function drawnAngleAtM(a: Point): number {
  const drawn = drawnFigure(a);
  const toP = subtract(drawn.p, drawn.m);
  const alongBase = subtract(C, drawn.m);
  const radians = Math.atan2(Math.abs(cross(toP, alongBase)), dot(toP, alongBase));
  return (radians * 180) / Math.PI;
}

/* -------------------------------------------------------------------------- *
 * The argument
 * -------------------------------------------------------------------------- */

export interface ArgumentStep {
  readonly n: number;
  /** What the step claims, in this module's words. */
  readonly claim: string;
  /** What the argument offers for it. */
  readonly because: string;
  /**
   * Whether the claim is true of the configuration — not whether it looks true
   * in the picture. Steps 1 and 2 are constructions: they hold whenever the
   * construction determines the points it names, which is why a degenerate
   * figure fails at step 1 rather than anywhere later.
   */
  readonly holdsIn: (figure: Figure) => boolean;
}

export const STEPS: readonly ArgumentStep[] = [
  {
    n: 1,
    claim: 'The bisector of angle A and the perpendicular bisector of BC meet at a point P.',
    because: 'Two lines that are not parallel meet at one point.',
    holdsIn: () => true,
  },
  {
    n: 2,
    claim:
      'F is the foot of the perpendicular from P to AB, G the foot of the perpendicular from P to AC, and M is the midpoint of BC.',
    because: 'Each is a construction on points already named.',
    holdsIn: () => true,
  },
  {
    n: 3,
    claim: 'AF = AG.',
    because:
      'Triangles AFP and AGP have a right angle each, equal angles at A because AP bisects it, and the side AP in common.',
    holdsIn: (figure) => nearlyEqual(figure.f.fromA, figure.g.fromA),
  },
  {
    n: 4,
    claim: 'PB = PC.',
    because: 'P is on the perpendicular bisector of BC, which is what that line is.',
    holdsIn: (figure) => nearlyEqual(distance(figure.p, B), distance(figure.p, C)),
  },
  {
    n: 5,
    claim: 'FB = GC.',
    because:
      'Triangles PFB and PGC have a right angle each, PF = PG from step 3, and PB = PC from step 4.',
    holdsIn: (figure) => nearlyEqual(figure.f.toVertex, figure.g.toVertex),
  },
  {
    n: 6,
    claim: 'AB = AF + FB.',
    because: 'The whole side is the sum of its two pieces.',
    holdsIn: (figure) => nearlyEqual(figure.sides.ab, figure.f.fromA + figure.f.toVertex),
  },
  {
    n: 7,
    claim: 'AC = AG + GC.',
    because: 'The whole side is the sum of its two pieces.',
    holdsIn: (figure) => nearlyEqual(figure.sides.ca, figure.g.fromA + figure.g.toVertex),
  },
];

/** The conclusion, which is not a step: it follows from 3, 5, 6 and 7. */
export const CONCLUSION = 'AB = AC, so the triangle is isosceles.';

/**
 * Which steps are false at this position of A.
 *
 * Never typed in, because which one it is depends on which side of the midpoint
 * A is standing: the foot that has passed its vertex is the one on the shorter
 * side, so the false step moves from 6 to 7 as A crosses over. On the crossing
 * itself the construction stops determining P, and the argument fails at its
 * first line instead.
 */
export function failingSteps(a: Point): number[] {
  const figure = trueFigure(a);
  if (!isFigure(figure)) return [1];
  return STEPS.filter((step) => !step.holdsIn(figure)).map((step) => step.n);
}

/** The single false step, or null if a configuration ever has more or fewer. */
export function theFalseStep(a: Point): number | null {
  const failing = failingSteps(a);
  return failing.length === 1 ? (failing[0] ?? null) : null;
}

/* -------------------------------------------------------------------------- *
 * Where the reader stands
 * -------------------------------------------------------------------------- */

/**
 * Mildly scalene, on purpose.
 *
 * The foot on AB passes B by less than half a unit on a side of nine and a
 * half, and the drawn figure is under ten degrees out at M. This is the
 * configuration in which the fallacy is most stable: everything about the
 * picture looks right, and drawing it more carefully does not help.
 */
export const INITIAL_PARAMS: Params = { xTenths: 52, yTenths: 80 };

/**
 * One configuration per hypothesis, each one the place that hypothesis dies.
 *
 * The ledger and the figure are the same control: choosing a condition moves A
 * to where it fails, rather than describing the failure in a sentence beside a
 * picture that still shows the safe case.
 */
export const CONFIGURATIONS: Readonly<Record<string, Params>> = {
  // Well off the line of symmetry: the foot on AB is a fifth of the side past B.
  'feet-lie-within-the-sides': { xTenths: 30, yTenths: 70 },
  // On it, where the bisector of A and the perpendicular bisector of BC are one line.
  'the-construction-meets-once': { xTenths: SYMMETRIC_X_TENTHS, yTenths: 80 },
  // A flat triangle, where P sits further below BC than A stands above it.
  'p-lies-where-it-is-drawn': { xTenths: 20, yTenths: 30 },
};

/* -------------------------------------------------------------------------- *
 * Reading it out
 * -------------------------------------------------------------------------- */

export function formatSigma(value: number): string {
  return formatFixed(value, 3);
}

export function formatLength(value: number): string {
  return formatFixed(value, 2);
}

export function formatDegrees(value: number): string {
  return `${formatFixed(value, 1)}°`;
}

/** How far the foot on the shorter side has passed its vertex: |AB - AC| / 2. */
export function overshoot(a: Point): number {
  const measured = sides(a);
  return Math.abs(measured.ca - measured.ab) / 2;
}

/* -------------------------------------------------------------------------- *
 * The circle P lies on
 * -------------------------------------------------------------------------- */

export interface Circle {
  readonly centre: Point;
  readonly radius: number;
}

/** The circle through A, B and C. P is the midpoint of the arc BC not containing A. */
export function circumcircle(a: Point): Circle | null {
  const d = 2 * (a.x * (B.y - C.y) + B.x * (C.y - a.y) + C.x * (a.y - B.y));
  if (Math.abs(d) < PARALLEL_TOLERANCE) return null;
  const square = (p: Point) => p.x * p.x + p.y * p.y;
  const centre: Point = {
    x: (square(a) * (B.y - C.y) + square(B) * (C.y - a.y) + square(C) * (a.y - B.y)) / d,
    y: (square(a) * (C.x - B.x) + square(B) * (a.x - C.x) + square(C) * (B.x - a.x)) / d,
  };
  return { centre, radius: distance(centre, a) };
}

/* -------------------------------------------------------------------------- *
 * Sweeping A across the figure
 * -------------------------------------------------------------------------- */

export interface SigmaSample {
  readonly x: number;
  /** null where the construction determines no P. */
  readonly sigmaF: number | null;
  readonly sigmaG: number | null;
}

/** sigma at both feet as A slides horizontally at a fixed height. */
export function sigmaSweep(yTenths: number): SigmaSample[] {
  const samples: SigmaSample[] = [];
  for (let xTenths = A_X_TENTHS.min; xTenths <= A_X_TENTHS.max; xTenths += A_X_TENTHS.step) {
    const a = apex({ xTenths, yTenths });
    const figure = trueFigure(a);
    samples.push({
      x: a.x,
      sigmaF: isFigure(figure) ? figure.f.sigma : null,
      sigmaG: isFigure(figure) ? figure.g.sigma : null,
    });
  }
  return samples;
}

/* -------------------------------------------------------------------------- *
 * The STEP question: AP = PQ = QB = x in a triangle of base 1
 * -------------------------------------------------------------------------- */

/**
 * The featured question, STEP II 2014 Q1 in this module's framing: the base AB
 * has length 1, the angles at A and B are alpha <= beta, and P on AC and Q on
 * BC satisfy AP = PQ = QB = x. Squaring the vector PQ gives
 *
 *   (1 + 2cos(alpha + beta)) x^2 - 2(cos alpha + cos beta) x + 1 = 0,     (*)
 *
 * and nothing in that derivation says where P and Q are. Every root of (*)
 * is a genuine configuration; the figure shows one of them.
 */
export const STEP_ANGLES = { min: 5, max: 100, maxSum: 170 } as const;

export interface StepPlacement {
  readonly x: number;
  readonly p: Point;
  readonly q: Point;
  /** Position of P along AC, as A + t(C - A). */
  readonly tP: number;
  readonly tQ: number;
  readonly sigmaP: number;
  readonly sigmaQ: number;
  /** The angle PQ makes with the base, in degrees. */
  readonly thetaDegrees: number;
  /** Both feet strictly inside their sides: the configuration the figure shows. */
  readonly asDrawn: boolean;
}

export interface StepTriangle {
  readonly a: Point;
  readonly b: Point;
  readonly c: Point;
  readonly ac: number;
  readonly bc: number;
  /** The coefficients of (*): quadratic, linear, constant. */
  readonly coefficients: readonly [number, number, number];
  readonly linear: boolean;
  /** Roots of (*), ascending. */
  readonly roots: readonly number[];
  readonly placements: readonly StepPlacement[];
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Keep alpha <= beta and the triangle open, whichever slider moved. */
export function clampStepAngles(alpha: number, beta: number, moved: 'alpha' | 'beta'): [number, number] {
  let a = Math.max(STEP_ANGLES.min, Math.min(STEP_ANGLES.max, alpha));
  let b = Math.max(STEP_ANGLES.min, Math.min(STEP_ANGLES.max, beta));
  if (moved === 'alpha') {
    if (b < a) b = a;
    if (a + b > STEP_ANGLES.maxSum) b = STEP_ANGLES.maxSum - a;
  } else {
    if (a > b) a = b;
    if (a + b > STEP_ANGLES.maxSum) a = STEP_ANGLES.maxSum - b;
  }
  return [a, b];
}

export function stepTriangle(alphaDegrees: number, betaDegrees: number): StepTriangle {
  const alpha = toRadians(alphaDegrees);
  const beta = toRadians(betaDegrees);
  const a: Point = { x: 0, y: 0 };
  const b: Point = { x: 1, y: 0 };
  // Sine rule with AB = 1.
  const ac = Math.sin(beta) / Math.sin(alpha + beta);
  const bc = Math.sin(alpha) / Math.sin(alpha + beta);
  const c: Point = { x: ac * Math.cos(alpha), y: ac * Math.sin(alpha) };

  const quadratic = 1 + 2 * Math.cos(alpha + beta);
  const linearCoefficient = -2 * (Math.cos(alpha) + Math.cos(beta));
  const constant = 1;
  const linear = Math.abs(quadratic) < 1e-9;

  let roots: number[];
  if (linear) {
    roots = [-constant / linearCoefficient];
  } else {
    const discriminant = linearCoefficient * linearCoefficient - 4 * quadratic * constant;
    if (discriminant < 0) roots = [];
    else {
      const s = Math.sqrt(discriminant);
      roots = [(-linearCoefficient - s) / (2 * quadratic), (-linearCoefficient + s) / (2 * quadratic)];
    }
  }
  roots.sort((u, v) => u - v);

  const placements = roots.map((x): StepPlacement => {
    const p: Point = { x: x * Math.cos(alpha), y: x * Math.sin(alpha) };
    const q: Point = { x: 1 - x * Math.cos(beta), y: x * Math.sin(beta) };
    const tP = x / ac;
    const tQ = x / bc;
    const sigmaP = Math.min(tP, 1 - tP);
    const sigmaQ = Math.min(tQ, 1 - tQ);
    const thetaDegrees = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    return { x, p, q, tP, tQ, sigmaP, sigmaQ, thetaDegrees, asDrawn: sigmaP > 0 && sigmaQ > 0 };
  });

  return {
    a,
    b,
    c,
    ac,
    bc,
    coefficients: [quadratic, linearCoefficient, constant],
    linear,
    roots,
    placements,
  };
}

/** The left-hand side of (*) at x: zero at every root, by construction. */
export function stepResidual(triangle: StepTriangle, x: number): number {
  const [q2, q1, q0] = triangle.coefficients;
  return q2 * x * x + q1 * x + q0;
}

/** How the reader describes where a point landed, from its sigma. */
export function describeSigma(sigma: number): string {
  if (nearlyEqual(sigma, 0)) return 'exactly at a vertex';
  return sigma > 0 ? 'strictly inside the side' : 'past the vertex, on the side produced';
}

/* -------------------------------------------------------------------------- *
 * Panel state
 * -------------------------------------------------------------------------- */

export type View = 'true' | 'drawn';

export interface PanelParams extends Params {
  readonly view: View;
  readonly alphaDegrees: number;
  readonly betaDegrees: number;
  /** Which root of (*) the third panel draws. */
  readonly root: number;
}

export const INITIAL_PANEL_PARAMS: PanelParams = {
  ...INITIAL_PARAMS,
  view: 'true',
  alphaDegrees: 45,
  betaDegrees: 45,
  root: 0,
};

/** The ledger configurations, carried into the full panel state. */
export const PANEL_CONFIGURATIONS: Readonly<Record<string, PanelParams>> = Object.fromEntries(
  Object.entries(CONFIGURATIONS).map(([id, params]) => [
    id,
    { ...INITIAL_PANEL_PARAMS, ...params, view: 'true' as View },
  ]),
);
