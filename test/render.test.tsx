import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LineChart, NumberLine, RunningValue } from '../src/components/charts';
import FixtureWidget, { presets } from '../src/fixtures/fixture-module/widget';
import SmallEnoughToIgnoreWidget, {
  presets as moduleOnePresets,
} from '../src/content/modules/small-enough-to-ignore/widget';
import InequalitiesWidget, {
  presets as inequalityPresets,
} from '../src/content/modules/operations-on-inequalities/widget';
import FigureWidget from '../src/content/modules/arguing-from-the-figure/widget';

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
  it('draws a line chart with a path per series, and marks points', () => {
    const html = renderToStaticMarkup(
      <LineChart
        series={[
          { id: 'a', label: 'a', points: [[1, 1], [2, 4], [3, 9]] },
          { id: 'b', label: 'b', points: [[1, 2], [2, 3]], tone: 'break', dashed: true },
        ]}
        points={[{ x: 2, y: 4, label: 'here' }]}
        bands={[{ from: 1, to: 2, tone: 'break', label: 'band' }]}
        ariaLabel="test"
      />,
    );
    expect(html).toContain('<svg');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="test"');
    expect((html.match(/class="series"/g) ?? []).length).toBe(2);
    expect(html).toContain('here');
    expect(html).toContain('band');
    expect(html).not.toContain('NaN');
  });

  it('survives a log axis, a degenerate domain, and a broken line', () => {
    const html = renderToStaticMarkup(
      <LineChart
        series={[{ id: 'a', label: 'a', points: [[1, 5], [2, NaN], [3, 5]] }]}
        yScale="log"
        ariaLabel="log"
      />,
    );
    expect(html).toContain('<svg');
    expect(html).not.toContain('NaN');
  });

  it('draws a number line with a row per set, arrowheads at clipped ends, and an empty row', () => {
    const html = renderToStaticMarkup(
      <NumberLine
        domain={[-1, 1]}
        rows={[
          { id: 'a', label: 'holds', intervals: [{ from: -1, to: 0.5, clipFrom: true }], tone: 'primary' },
          { id: 'b', label: 'disagree', intervals: [], tone: 'break' },
        ]}
        marks={[{ at: 1, label: 'here', tone: 'break', open: true }]}
        ariaLabel="number line"
      />,
    );
    expect(html).toContain('<rect');
    expect(html).toContain('holds');
    expect(html).toContain('empty');
    expect(html).toContain('here');
    expect(html).not.toContain('NaN');
  });

  it('draws a running value with its target rule', () => {
    const html = renderToStaticMarkup(
      <RunningValue values={[1, 0.5, 0.33, 0.25]} target={{ at: 0, label: 'limit' }} ariaLabel="running value" />,
    );
    expect(html).toContain('limit');
    expect(html).not.toContain('NaN');
  });
});

describe('explore shell', () => {
  const hypotheses = [
    { id: 'terms-stay-bounded', label: 'Grow the spike', statement: 'bounded', violatedBy: 'unbounded' },
    { id: 'spike-does-not-dominate', label: 'Few terms', statement: 'small', violatedBy: 'large' },
  ];

  const html = renderToStaticMarkup(<FixtureWidget hypotheses={hypotheses} />);

  it('renders the panel, the chart and the controls without JavaScript', () => {
    expect(html).toContain('class="panel"');
    expect(html).toContain('<svg');
    expect(html).toContain('type="range"');
    expect(html).toContain('interactive');
    // The question being measured is stated at the top of every panel.
    expect((html.match(/class="panel-question"/g) ?? []).length).toBe(1);
    expect(html).toContain('Does the mean of the first n terms tend to zero?');
  });

  it('renders one chip per hypothesis, none of them pressed, and nothing about committing', () => {
    expect(Object.keys(presets).sort()).toEqual(hypotheses.map((h) => h.id).sort());
    expect((html.match(/class="chip"/g) ?? []).length).toBe(hypotheses.length);
    expect(html).toContain('Grow the spike');
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toMatch(/lock it in|confident|commit/i);
  });
});

describe('Module 01', () => {
  const hypotheses = [
    {
      id: 'discarded-effect-vanishes',
      label: 'Push n to a million',
      statement: 'the discarded effect vanishes',
      violatedBy: 'a large factor restores the remainder',
    },
    {
      id: 'substitution-remains-defined',
      label: 'Stand at θ = 0',
      statement: 'the substituted expression remains defined',
      violatedBy: 'the leading coefficient vanishes',
    },
  ];

  const html = renderToStaticMarkup(<SmallEnoughToIgnoreWidget hypotheses={hypotheses} />);

  it('renders three panels, each with its own chip, and no NaN anywhere', () => {
    expect(Object.keys(moduleOnePresets).sort()).toEqual(hypotheses.map((h) => h.id).sort());
    expect((html.match(/class="panel"/g) ?? []).length).toBe(3);
    expect((html.match(/class="panel-question"/g) ?? []).length).toBe(3);
    expect((html.match(/class="chip"/g) ?? []).length).toBe(2);
    expect(html).toContain('Push n to a million');
    expect(html).toContain('Stand at θ = 0');
    expect(html).not.toContain('NaN');
  });

  it('shows the decisive quantity in each of the first two panels', () => {
    expect((html.match(/E, the discarded effect/g) ?? []).length).toBe(2);
    expect(html).toContain('Snap to the nearest cusp');
  });
});

describe('Module 02', () => {
  const hypotheses = [
    {
      id: 'multiplier-keeps-one-sign',
      label: 'Stand at x = 0',
      statement: 'the multiplier keeps one sign',
      violatedBy: 'x - 2 changes sign at 2',
    },
    {
      id: 'operation-preserves-order',
      label: 'Square with a negative side',
      statement: 'the operation preserves order',
      violatedBy: 'squaring reverses order between negatives',
    },
  ];

  const html = renderToStaticMarkup(<InequalitiesWidget hypotheses={hypotheses} />);

  it('renders both panels with the five steps on offer', () => {
    expect(Object.keys(inequalityPresets).sort()).toEqual(hypotheses.map((h) => h.id).sort());
    expect((html.match(/class="panel"/g) ?? []).length).toBe(2);
    expect((html.match(/class="panel-question"/g) ?? []).length).toBe(2);
    expect(html).toContain('What does it cost to multiply both sides by (x − 2)?');
    expect((html.match(/<option/g) ?? []).length).toBe(5);
    expect(html).toContain('STEP I 2001 Q2(i)');
    expect(html).toContain('D, the disagreement set');
    expect(html).not.toContain('NaN');
  });

  it('starts where the two statements agree', () => {
    expect(html).toContain('agree here');
    expect(html).toContain('order preserved');
  });
});

describe('Module 03', () => {
  it('renders the figure, the sweep and the featured question as three panels', () => {
    const html = renderToStaticMarkup(
      <FigureWidget
        hypotheses={[
          { id: 'feet-lie-within-the-sides', label: 'Move A', statement: 's', violatedBy: 'v' },
          { id: 'the-construction-meets-once', label: 'Make AB = AC', statement: 's', violatedBy: 'v' },
          { id: 'p-lies-where-it-is-drawn', label: 'Flatten', statement: 's', violatedBy: 'v' },
        ]}
      />,
    );
    expect((html.match(/class="panel"/g) ?? []).length).toBe(3);
    expect((html.match(/class="panel-question"/g) ?? []).length).toBe(3);
    expect((html.match(/class="chip"/g) ?? []).length).toBe(3);
    expect(html).toContain('the false step');
    expect(html).toContain('as it really is');
    expect(html).toContain('x = 0.414');
    expect(html).not.toContain('NaN');
  });
});
