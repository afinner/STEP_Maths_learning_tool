import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LineChart, NumberLine, RunningValue } from '../src/components/charts';
import FixtureWidget, { presets } from '../src/fixtures/fixture-module/widget';

/**
 * Smoke tests: the shared infrastructure actually renders.
 *
 * These catch the class of failure that unit tests on compute.ts cannot — a
 * chart that throws on an empty series, a scale that produces NaN in a path, a
 * widget that crashes before the reader ever sees it. Rendering to static markup
 * is enough: if it produces the right shapes on the server, Astro can put it in
 * the page.
 */

describe('charts', () => {
  it('draws a line chart with a path per series', () => {
    const html = renderToStaticMarkup(
      <LineChart
        series={[
          { id: 'a', label: 'a', points: [[1, 1], [2, 4], [3, 9]] },
          { id: 'b', label: 'b', points: [[1, 2], [2, 3]], tone: 'break', dashed: true },
        ]}
        ariaLabel="test"
      />,
    );
    expect(html).toContain('<svg');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="test"');
    expect((html.match(/class="series"/g) ?? []).length).toBe(2);
    expect(html).not.toContain('NaN');
  });

  it('survives a log axis and a degenerate domain', () => {
    const html = renderToStaticMarkup(
      <LineChart
        series={[{ id: 'a', label: 'a', points: [[1, 5], [2, 5]] }]}
        yScale="log"
        ariaLabel="log"
      />,
    );
    expect(html).toContain('<svg');
    expect(html).not.toContain('NaN');
  });

  it('draws a number line with shaded intervals', () => {
    const html = renderToStaticMarkup(
      <NumberLine
        domain={[-1, 1]}
        intervals={[{ from: -0.5, to: 0.5, label: 'converges', tone: 'primary' }]}
        marks={[{ at: 1, label: 'here', tone: 'break', open: true }]}
        ariaLabel="number line"
      />,
    );
    expect(html).toContain('<rect');
    expect(html).toContain('converges');
    expect(html).not.toContain('NaN');
  });

  it('draws a running value with its target rule', () => {
    const html = renderToStaticMarkup(
      <RunningValue
        values={[1, 0.5, 0.33, 0.25]}
        target={{ at: 0, label: 'limit' }}
        ariaLabel="running value"
      />,
    );
    expect(html).toContain('limit');
    expect(html).not.toContain('NaN');
  });
});

describe('module shell', () => {
  const hypotheses = [
    { id: 'terms-stay-bounded', statement: 'bounded', violatedBy: 'unbounded' },
    { id: 'spike-does-not-dominate', statement: 'small', violatedBy: 'large' },
  ];

  const html = renderToStaticMarkup(
    <FixtureWidget hypotheses={hypotheses} predictionPrompt="Does it go to zero?" />,
  );

  it('gates the widget behind the prediction prompt', () => {
    expect(html).toContain('Does it go to zero?');
    // The result is not in the initial markup: the reader commits first.
    expect(html).not.toContain('<svg');
  });

  it('renders the hypothesis ledger without JavaScript', () => {
    // The ledger is content, so it has to survive in the static HTML.
    expect((html.match(/ledger-item/g) ?? []).length).toBe(hypotheses.length);
    expect(html).toContain('unbounded');
  });

  it('has an enabled button for every hypothesis with a preset', () => {
    expect(html).not.toContain('disabled');
    expect(Object.keys(presets).sort()).toEqual(hypotheses.map((h) => h.id).sort());
  });
});
