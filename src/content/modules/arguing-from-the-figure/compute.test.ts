import { describe, expect, it } from 'vitest';
import {
  A_X_TENTHS,
  A_Y_TENTHS,
  B,
  C,
  CONFIGURATIONS,
  INITIAL_PARAMS,
  STEPS,
  SYMMETRIC_X_TENTHS,
  apex,
  distance,
  drawnAngleAtM,
  drawnFigure,
  failingSteps,
  footOfPerpendicular,
  formatSigma,
  isFigure,
  overshoot,
  sides,
  theFalseStep,
  trueFigure,
  type Figure,
  type Params,
  type Point,
} from './compute';

/**
 * The claim this module makes is that the figure fixed something the argument
 * never stated. That is a statement about a whole space of configurations, so
 * these tests are mostly sweeps: not "here is a case where it fails" but "here
 * is what happens everywhere the reader can stand".
 */

const RIGHT_ANGLE = 90;

/** Every position of A the controls can reach, coarsely sampled. */
function reachable(step = 7): Point[] {
  const points: Point[] = [];
  for (let x = A_X_TENTHS.min; x <= A_X_TENTHS.max; x += step) {
    for (let y = A_Y_TENTHS.min; y <= A_Y_TENTHS.max; y += step) {
      points.push(apex({ xTenths: x, yTenths: y }));
    }
  }
  return points;
}

function figureAt(params: Params): Figure {
  const figure = trueFigure(apex(params));
  if (!isFigure(figure)) throw new Error('expected a figure');
  return figure;
}

/** The centre of the circle through the three vertices, for checking where P is. */
function circumcentre(a: Point): Point {
  const d = 2 * (a.x * (B.y - C.y) + B.x * (C.y - a.y) + C.x * (a.y - B.y));
  const square = (p: Point) => p.x * p.x + p.y * p.y;
  return {
    x:
      (square(a) * (B.y - C.y) + square(B) * (C.y - a.y) + square(C) * (a.y - B.y)) / d,
    y:
      (square(a) * (C.x - B.x) + square(B) * (a.x - C.x) + square(C) * (B.x - a.x)) / d,
  };
}

describe('the point the construction actually produces', () => {
  it('is equidistant from B and C, wherever A is', () => {
    for (const a of reachable()) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      expect(distance(figure.p, B)).toBeCloseTo(distance(figure.p, C), 9);
    }
  });

  it('is the midpoint of the arc BC: on the circle, on the far side of BC', () => {
    for (const a of reachable()) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      const centre = circumcentre(a);
      const radius = distance(centre, a);
      expect(distance(centre, figure.p)).toBeCloseTo(radius, 8);
      // A is above BC, so P is below it — never inside the triangle, at any A.
      expect(figure.p.y).toBeLessThan(0);
      expect(a.y).toBeGreaterThan(0);
    }
  });

  it('puts both feet the same distance from A, and that distance is (AB + AC)/2', () => {
    for (const a of reachable()) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      const measured = sides(a);
      expect(figure.f.fromA).toBeCloseTo(figure.g.fromA, 9);
      expect(figure.f.fromA).toBeCloseTo((measured.ab + measured.ca) / 2, 9);
    }
  });
});

describe('sigma', () => {
  it('is (AB - AC)/2AB on one side and (AC - AB)/2AC on the other', () => {
    for (const a of reachable()) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      const { ab, ca } = sides(a);
      expect(figure.f.sigma).toBeCloseTo((ab - ca) / (2 * ab), 9);
      expect(figure.g.sigma).toBeCloseTo((ca - ab) / (2 * ca), 9);
    }
  });

  it('carries opposite signs at the two feet, everywhere a figure exists', () => {
    // This is the module in one line: the addition needs sigma >= 0 at both
    // feet, and no triangle offers that. There is nowhere to stand.
    for (const a of reachable()) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      expect(figure.f.sigma * figure.g.sigma).toBeLessThan(0);
    }
  });

  it('is zero at an endpoint, where adding the pieces is still sound', () => {
    // sigma = 0 means the foot is the vertex itself: AB = AF + 0 holds.
    const foot = footOfPerpendicular(B, { x: 0, y: 5 }, B);
    expect(foot.t).toBeCloseTo(1, 12);
    expect(foot.sigma).toBeCloseTo(0, 12);
    expect(foot.toVertex).toBeCloseTo(0, 12);
  });

  it('never shows a signed zero', () => {
    expect(formatSigma(-1e-15)).toBe('0.000');
    expect(formatSigma(-0.2486)).toBe('-0.249');
  });
});

describe('the argument', () => {
  it('has exactly one false step at every position of A', () => {
    for (const a of reachable(3)) {
      expect(failingSteps(a)).toHaveLength(1);
    }
  });

  it('fails at the addition on whichever side is shorter', () => {
    for (const a of reachable(3)) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      const { ab, ca } = sides(a);
      // The foot that has passed its vertex is the one on the shorter side.
      expect(theFalseStep(a)).toBe(ab < ca ? 6 : 7);
    }
  });

  it('keeps every congruence true, which is why checking them finds nothing', () => {
    const congruences = STEPS.filter((step) => [3, 4, 5].includes(step.n));
    expect(congruences).toHaveLength(3);
    for (const a of reachable(3)) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      for (const step of congruences) expect(step.holdsIn(figure)).toBe(true);
    }
  });

  it('fails at its first line where AB = AC, so no configuration is sound', () => {
    for (let y = A_Y_TENTHS.min; y <= A_Y_TENTHS.max; y += 5) {
      const a = apex({ xTenths: SYMMETRIC_X_TENTHS, yTenths: y });
      const figure = trueFigure(a);
      expect(isFigure(figure)).toBe(false);
      if (!isFigure(figure)) expect(figure.reason).toBe('lines-coincide');
      expect(theFalseStep(a)).toBe(1);
    }
  });

  it('has no triangle to argue about when A is on BC', () => {
    const figure = trueFigure({ x: 4, y: 0 });
    expect(isFigure(figure)).toBe(false);
    if (!isFigure(figure)) expect(figure.reason).toBe('no-triangle');
  });

  it('numbers its steps once each, ending with the two additions', () => {
    expect(STEPS.map((step) => step.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('why drawing it more carefully does not help', () => {
  it('overshoots the vertex by half the difference of the two sides', () => {
    for (const a of reachable()) {
      const figure = trueFigure(a);
      if (!isFigure(figure)) continue;
      const past = figure.f.t > 1 ? figure.f : figure.g;
      expect(past.toVertex).toBeCloseTo(overshoot(a), 9);
    }
  });

  it('shrinks to nothing as the triangle approaches isosceles', () => {
    const near = apex({ xTenths: SYMMETRIC_X_TENTHS - 1, yTenths: 80 });
    const far = apex({ xTenths: SYMMETRIC_X_TENTHS - 30, yTenths: 80 });
    expect(overshoot(near)).toBeLessThan(overshoot(far));
    expect(overshoot(near)).toBeLessThan(0.1);
  });
});

describe('the figure as it gets drawn', () => {
  it('puts both feet inside their sides, which is what makes the addition look free', () => {
    for (const a of reachable()) {
      const drawn = drawnFigure(a);
      expect(drawn.f.inside).toBe(true);
      expect(drawn.g.inside).toBe(true);
      expect(drawn.f.sigma).toBeGreaterThan(0);
      expect(drawn.g.sigma).toBeGreaterThan(0);
    }
  });

  it('pays for it at M, where the angle stops being a right angle', () => {
    for (const a of reachable()) {
      const angle = drawnAngleAtM(a);
      const symmetric = Math.abs(a.x - (B.x + C.x) / 2) < 1e-12;
      if (symmetric) expect(angle).toBeCloseTo(RIGHT_ANGLE, 9);
      else expect(Math.abs(angle - RIGHT_ANGLE)).toBeGreaterThan(1e-6);
    }
  });

  it('is barely out of true where the fallacy is most convincing', () => {
    // Near-isosceles: under ten degrees at M, and a foot less than half a unit
    // past its vertex. Nothing in the picture asks to be checked.
    const a = apex(INITIAL_PARAMS);
    expect(Math.abs(drawnAngleAtM(a) - RIGHT_ANGLE)).toBeLessThan(10);
    expect(overshoot(a)).toBeLessThan(0.5);
    expect(theFalseStep(a)).toBe(6);
  });
});

describe('the ledger configurations', () => {
  it('has one for every hypothesis, and each one kills its own condition', () => {
    expect(Object.keys(CONFIGURATIONS).sort()).toEqual([
      'feet-lie-within-the-sides',
      'p-lies-where-it-is-drawn',
      'the-construction-meets-once',
    ]);

    const feet = figureAt(CONFIGURATIONS['feet-lie-within-the-sides'] as Params);
    expect(Math.min(feet.f.sigma, feet.g.sigma)).toBeLessThan(-0.2);

    const coincide = trueFigure(apex(CONFIGURATIONS['the-construction-meets-once'] as Params));
    expect(isFigure(coincide)).toBe(false);

    // P further below BC than A stands above it: nowhere near the inside.
    const outside = figureAt(CONFIGURATIONS['p-lies-where-it-is-drawn'] as Params);
    expect(outside.p.y).toBeLessThan(-outside.a.y);
  });

  it('starts the reader somewhere the picture looks fine', () => {
    const figure = figureAt(INITIAL_PARAMS);
    expect(Math.min(figure.f.sigma, figure.g.sigma)).toBeGreaterThan(-0.1);
    expect(distance(figure.a, B)).toBeLessThan(distance(figure.a, C));
  });
});

/* -------------------------------------------------------------------------- *
 * The redesign: the circle, the sweep, and the featured question
 * -------------------------------------------------------------------------- */

import {
  PANEL_CONFIGURATIONS,
  STEP_ANGLES,
  circumcircle,
  clampStepAngles,
  describeSigma,
  drawnFailingSteps,
  sigmaSweep,
  stepResidual,
  stepTriangle,
} from './compute';

describe('the figure as it gets drawn, judged by the argument', () => {
  it('fails the perpendicular-bisector steps and nothing else, off the line of symmetry', () => {
    for (const a of reachable()) {
      const symmetric = Math.abs(a.x - (B.x + C.x) / 2) < 1e-12;
      if (symmetric) continue;
      expect(drawnFailingSteps(a)).toEqual([4, 5]);
    }
  });

  it('has every step true on the line of symmetry, where AB = AC really holds', () => {
    for (let y = A_Y_TENTHS.min; y <= A_Y_TENTHS.max; y += 10) {
      expect(drawnFailingSteps(apex({ xTenths: SYMMETRIC_X_TENTHS, yTenths: y }))).toEqual([]);
    }
  });
});

describe('the circle P lies on', () => {
  it('passes through A, B, C and P, wherever A is', () => {
    for (const a of reachable()) {
      const figure = trueFigure(a);
      const circle = circumcircle(a);
      if (!isFigure(figure) || !circle) continue;
      for (const point of [a, B, C, figure.p]) {
        expect(distance(circle.centre, point)).toBeCloseTo(circle.radius, 8);
      }
    }
  });
});

describe('sliding A across the figure', () => {
  it('never lets both feet inside their sides, and has no figure exactly at AB = AC', () => {
    for (const yTenths of [30, 80, 120]) {
      const sweep = sigmaSweep(yTenths);
      expect(sweep).toHaveLength(A_X_TENTHS.max - A_X_TENTHS.min + 1);
      const gaps = sweep.filter((s) => s.sigmaF === null);
      expect(gaps.map((s) => s.x)).toEqual([6]);
      for (const s of sweep) {
        if (s.sigmaF === null || s.sigmaG === null) continue;
        expect(s.sigmaF * s.sigmaG).toBeLessThan(0);
      }
    }
  });
});

describe('the featured question', () => {
  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  it('has roots root two plus or minus one in case (a), and only one of them is the picture', () => {
    const t = stepTriangle(45, 45);
    expect(t.linear).toBe(false);
    expect(t.roots).toHaveLength(2);
    expect(t.roots[0]).toBeCloseTo(Math.SQRT2 - 1, 9);
    expect(t.roots[1]).toBeCloseTo(Math.SQRT2 + 1, 9);
    expect(t.ac).toBeCloseTo(Math.SQRT1_2, 9);
    const [inside, beyond] = t.placements as [StepPlacementLike, StepPlacementLike];
    expect(inside.asDrawn).toBe(true);
    expect(inside.thetaDegrees).toBeCloseTo(0, 6);
    expect(beyond.asDrawn).toBe(false);
    expect(beyond.sigmaP).toBeLessThan(0);
    expect(beyond.sigmaQ).toBeLessThan(0);
    expect(Math.abs(beyond.thetaDegrees)).toBeCloseTo(180, 6);
  });

  it('turns linear in case (b), with its one root putting Q at the vertex C', () => {
    const t = stepTriangle(30, 90);
    expect(t.linear).toBe(true);
    expect(t.roots).toHaveLength(1);
    expect(t.roots[0]).toBeCloseTo(1 / Math.sqrt(3), 9);
    const [only] = t.placements as [StepPlacementLike];
    expect(dist(only.q, t.c)).toBeLessThan(1e-9);
    expect(only.sigmaQ).toBeCloseTo(0, 9);
    expect(only.tP).toBeCloseTo(0.5, 9);
    expect(only.asDrawn).toBe(false);
  });

  it('keeps a negative root as algebra and never draws it', () => {
    // alpha + beta > 120 degrees makes the leading coefficient negative, so the
    // two roots have opposite signs. Only the positive one is a length.
    const t = stepTriangle(60, 61);
    expect(t.roots).toHaveLength(2);
    expect(t.roots[0]).toBeLessThan(0);
    expect(t.roots[1]).toBeGreaterThan(0);
    expect(t.rootsNotLengths).toBe(1);
    expect(t.placements).toHaveLength(1);
    expect(t.placements[0]?.x).toBe(t.roots[1]);
    for (const each of t.placements) {
      expect(each.tP).toBeGreaterThan(0);
      expect(each.tQ).toBeGreaterThan(0);
    }
  });

  it('places P and Q so that AP = PQ = QB = x for every positive root, whatever the angles', () => {
    for (let alpha = STEP_ANGLES.min; alpha <= STEP_ANGLES.alphaMax; alpha += 10) {
      for (let beta = alpha; alpha + beta <= STEP_ANGLES.maxSum && beta <= STEP_ANGLES.max; beta += 10) {
        const t = stepTriangle(alpha, beta);
        expect(t.placements.length + t.rootsNotLengths).toBe(t.roots.length);
        for (const each of t.placements) {
          expect(each.x).toBeGreaterThan(0);
          expect(dist(t.a, each.p)).toBeCloseTo(each.x, 9);
          expect(dist(each.p, each.q)).toBeCloseTo(each.x, 9);
          expect(dist(each.q, t.b)).toBeCloseTo(each.x, 9);
          expect(Math.abs(stepResidual(t, each.x))).toBeLessThan(1e-9);
        }
        // Two distinct real roots unless the equation is linear: part (ii).
        if (!t.linear) {
          expect(t.roots).toHaveLength(2);
          expect(Math.abs((t.roots[1] as number) - (t.roots[0] as number))).toBeGreaterThan(1e-6);
        }
      }
    }
  });

  it('keeps alpha at most beta and the triangle open, whichever slider moved', () => {
    expect(clampStepAngles(60, 45, 'alpha')).toEqual([60, 60]);
    expect(clampStepAngles(60, 45, 'beta')).toEqual([45, 45]);
    expect(clampStepAngles(85, 85, 'alpha')).toEqual([85, 85]);
    // The case that used to come out as [100, 70]: alpha is capped so beta can follow it.
    expect(clampStepAngles(100, 45, 'alpha')).toEqual([85, 85]);
    expect(clampStepAngles(80, 100, 'beta')).toEqual([70, 100]);
    expect(clampStepAngles(-5, 200, 'alpha')[0]).toBe(STEP_ANGLES.min);

    for (let alpha = -10; alpha <= 120; alpha += 5) {
      for (let beta = -10; beta <= 120; beta += 5) {
        for (const moved of ['alpha', 'beta'] as const) {
          const [a, b] = clampStepAngles(alpha, beta, moved);
          expect(a).toBeGreaterThanOrEqual(STEP_ANGLES.min);
          expect(a).toBeLessThanOrEqual(b);
          expect(b).toBeLessThanOrEqual(STEP_ANGLES.max);
          expect(a + b).toBeLessThanOrEqual(STEP_ANGLES.maxSum);
        }
      }
    }
  });

  it('describes where a point landed from its sigma alone', () => {
    expect(describeSigma(0.2)).toMatch(/inside/);
    expect(describeSigma(0)).toMatch(/vertex/);
    expect(describeSigma(-0.3)).toMatch(/produced/);
  });

  it('carries the ledger configurations into the panel state', () => {
    expect(Object.keys(PANEL_CONFIGURATIONS).sort()).toEqual(Object.keys(CONFIGURATIONS).sort());
    for (const [id, params] of Object.entries(CONFIGURATIONS)) {
      expect(PANEL_CONFIGURATIONS[id]).toMatchObject(params);
      expect(PANEL_CONFIGURATIONS[id]?.view).toBe('true');
    }
  });
});

type StepPlacementLike = ReturnType<typeof stepTriangle>['placements'][number];
