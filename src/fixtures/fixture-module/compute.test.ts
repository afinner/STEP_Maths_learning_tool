import { describe, expect, it } from 'vitest';
import { decisiveQuantity, looksConvergent, runningMeans, terms } from './compute';

/**
 * What a module's tests are for: pin the decisive quantity, and pin the cases
 * where the claim fails. If the widget ever disagrees with these numbers, the
 * widget is wrong.
 */

const wellBehaved = { n: 40, spikeAt: 5, spikeSize: 4 };

describe('terms', () => {
  it('is zero everywhere except the spike', () => {
    expect(terms({ n: 5, spikeAt: 3, spikeSize: 9 })).toEqual([0, 0, 9, 0, 0]);
  });

  it('has no spike when the spike falls beyond n', () => {
    expect(terms({ n: 3, spikeAt: 7, spikeSize: 9 })).toEqual([0, 0, 0]);
  });
});

describe('runningMeans', () => {
  it('has one mean per term', () => {
    expect(runningMeans(wellBehaved)).toHaveLength(wellBehaved.n);
  });

  it('jumps at the spike and decays afterwards', () => {
    const means = runningMeans({ n: 4, spikeAt: 2, spikeSize: 8 });
    expect(means).toEqual([0, 4, 8 / 3, 2]);
  });
});

describe('decisiveQuantity', () => {
  it('is the spike divided by the number of terms', () => {
    expect(decisiveQuantity({ n: 50, spikeAt: 5, spikeSize: 100 })).toBe(2);
  });

  it('equals the final running mean', () => {
    const params = { n: 20, spikeAt: 4, spikeSize: 60 };
    const means = runningMeans(params);
    expect(means.at(-1)).toBeCloseTo(decisiveQuantity(params), 12);
  });

  it('is zero when the spike never arrives', () => {
    expect(decisiveQuantity({ n: 10, spikeAt: 99, spikeSize: 1000 })).toBe(0);
  });

  it('does not divide by zero', () => {
    expect(decisiveQuantity({ n: 0, spikeAt: 1, spikeSize: 1 })).toBe(0);
  });
});

describe('looksConvergent', () => {
  it('holds in the well-behaved case', () => {
    expect(looksConvergent(wellBehaved)).toBe(true);
  });

  it('fails once the spike grows with n', () => {
    expect(looksConvergent({ n: 40, spikeAt: 5, spikeSize: 400 })).toBe(false);
  });
});
