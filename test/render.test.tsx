import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LineChart, NumberLine, RunningValue } from '../src/components/charts';
import FixtureWidget, { presets } from '../src/fixtures/fixture-module/widget';
import SmallEnoughToIgnoreClosing from '../src/content/modules/small-enough-to-ignore/closing';
import { Essence } from '../src/content/modules/small-enough-to-ignore/beats';
import { hook } from '../src/content/modules/small-enough-to-ignore/compute';
import SmallEnoughToIgnoreWidget, {
  presets as moduleOnePresets,
} from '../src/content/modules/small-enough-to-ignore/widget';
import InequalitiesClosing from '../src/content/modules/operations-on-inequalities/closing';
import InequalitiesWidget, {
  presets as inequalityPresets,
} from '../src/content/modules/operations-on-inequalities/widget';

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

  it('has a preset for every hypothesis, and waits for the commit to offer them', () => {
    expect(Object.keys(presets).sort()).toEqual(hypotheses.map((h) => h.id).sort());

    // Driving the widget from the ledger would be a way around the commit, so
    // the conditions are readable but not yet clickable.
    expect((html.match(/disabled/g) ?? []).length).toBe(hypotheses.length);
    expect(html).toContain('Answer the question above');
  });
});

describe('Module 02', () => {
  const hypotheses = [
    {
      id: 'multiplier-keeps-one-sign',
      statement: 'the multiplier keeps one sign',
      violatedBy: 'x - 2 changes sign at 2',
    },
    {
      id: 'operation-preserves-order',
      statement: 'the operation preserves order',
      violatedBy: 'squaring reverses order between negatives',
    },
  ];

  it('gates the count behind the commitment', () => {
    const html = renderToStaticMarkup(
      <InequalitiesWidget
        hypotheses={hypotheses}
        predictionPrompt="How many separate ranges?"
      />,
    );

    expect(html).toContain('How many separate ranges?');
    expect(Object.keys(inequalityPresets).sort()).toEqual(hypotheses.map((h) => h.id).sort());
    // Neither solution set, nor the count, nor the read-back is served before the commit.
    expect(html).not.toContain('3.50');
    expect(html).not.toContain('You said');
    expect(html).not.toContain('number line');
  });

  it('renders its measurement and both halves of the bank', () => {
    const html = renderToStaticMarkup(<InequalitiesClosing />);

    expect(html).toContain('Where does the step turn round?');
    expect(html).toContain('Which of these steps keep the solution set?');
    expect(html).toContain('Which way did the error go?');

    // Traps sorted by mechanism, and the questions where the same rule is the
    // tool rather than the hazard.
    expect(html).toContain('Questions with the same mechanism');
    expect(html).toContain('Where the same rule is the tool');
    expect(html).toContain('STEP I 2001, Q2');
    expect(html).toContain('STEP I 2011, Q8(a)');
  });
});

describe('Module 01', () => {
  const hypotheses = [
    {
      id: 'substitution-remains-defined',
      statement: 'the substituted expression remains defined',
      violatedBy: 'the leading coefficient vanishes',
    },
    {
      id: 'discarded-effect-vanishes',
      statement: 'the discarded effect vanishes',
      violatedBy: 'a large factor restores the remainder',
    },
  ];

  it('renders its real prediction gate and every diagnostic hypothesis', () => {
    const html = renderToStaticMarkup(
      <SmallEnoughToIgnoreWidget
        hypotheses={hypotheses}
        predictionPrompt="What does the expression approach?"
      />,
    );

    expect(html).toContain('What does the expression approach?');
    expect(html).toContain('Your answer');
    expect(Object.keys(moduleOnePresets).sort()).toEqual(hypotheses.map((h) => h.id).sort());
    expect((html.match(/ledger-item/g) ?? []).length).toBe(hypotheses.length);
  });

  /**
   * Section 7.1 keeps the choice of hook open, so swapping it has to stay a
   * one-line change. Every string that names the expression comes from the
   * active hook; if one is ever hardcoded again, this fails.
   */
  it('names whichever hook is active, rather than a hardcoded expression', () => {
    const html = renderToStaticMarkup(<Essence n={100} />);

    expect(html).toContain(hook.shortcutText);
    expect(html).toContain(hook.cancellationText);
    expect(html).not.toContain('√(n² + 1) − n');
  });

  it('renders the question bank, near transfer, and cross-context transfer checks', () => {
    const html = renderToStaticMarkup(<SmallEnoughToIgnoreClosing />);

    expect(html).toContain('Questions with the same mechanism');
    expect(html).toContain('Where does first order fail here?');
    expect(html).toContain('When does the shortcut preserve the limit?');
    expect(html).not.toContain('Where truncating early is safe');
  });
});
