/**
 * Fixture computation. Deliberately trivial: this exists to prove the pipeline
 * end to end, not to teach anything.
 *
 * The shape is the shape every module's compute.ts should have — pure functions,
 * no DOM, no randomness, everything derived from an explicit parameter object.
 */

export interface FixtureParams {
  /** How many terms of the sequence to take. */
  n: number;
  /** Index (1-based) of the single non-zero term. */
  spikeAt: number;
  /** Size of that term. */
  spikeSize: number;
}

/** The sequence itself: zero everywhere except one spike. */
export function terms({ n, spikeAt, spikeSize }: FixtureParams): number[] {
  return Array.from({ length: n }, (_, i) => (i + 1 === spikeAt ? spikeSize : 0));
}

/** Running mean of the first k terms, for k = 1..n. */
export function runningMeans(params: FixtureParams): number[] {
  const xs = terms(params);
  const out: number[] = [];
  let total = 0;
  for (let k = 0; k < xs.length; k += 1) {
    total += xs[k] as number;
    out.push(total / (k + 1));
  }
  return out;
}

/**
 * The decisive quantity: the spike's share of the final mean, spikeSize / n.
 * Below 1 the mean looks like it is settling to zero; above 1 it plainly is not.
 * Everything the fixture widget claims is read off this one number.
 */
export function decisiveQuantity(params: FixtureParams): number {
  if (params.n <= 0) return 0;
  if (params.spikeAt > params.n) return 0;
  return params.spikeSize / params.n;
}

/** Does the final running mean stay under the tolerance the claim assumes? */
export function looksConvergent(params: FixtureParams, tolerance = 1): boolean {
  return decisiveQuantity(params) < tolerance;
}
