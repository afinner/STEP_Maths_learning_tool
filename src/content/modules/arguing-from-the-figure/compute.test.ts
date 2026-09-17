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
