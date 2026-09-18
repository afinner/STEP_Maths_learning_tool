import { RunningValue } from '../../components/charts';
import {
  BreakChips,
  Controls,
  ExploreShell,
  Panel,
  Readout,
  Slider,
  type WidgetHostProps,
} from '../../components/explore';
import { decisiveQuantity, looksConvergent, runningMeans, type FixtureParams } from './compute';

/**
 * Fixture widget — and the template for every module widget.
 *
 * Three things are required of this file:
 *   1. a default export taking WidgetHostProps and rendering an ExploreShell,
 *   2. an exported `presets` map covering every hypothesis id in the frontmatter,
 *   3. no maths of its own — numbers come from compute.ts, which is what the
 *      tests hold to account.
 */

/** The well-behaved case: the claim looks true here. */
const initial: FixtureParams = { n: 40, spikeAt: 5, spikeSize: 4 };

/** One entry per hypothesis id. The test in test/modules.test.ts enforces this. */
export const presets: Record<string, FixtureParams> = {
  'terms-stay-bounded': { n: 40, spikeAt: 5, spikeSize: 400 },
  'spike-does-not-dominate': { n: 12, spikeAt: 3, spikeSize: 60 },
};

export default function FixtureWidget(props: WidgetHostProps) {
  return (
    <ExploreShell {...props} initial={initial} presets={presets}>
      {(params, setParams) => {
        const means = runningMeans(params);
        const decisive = decisiveQuantity(params);
        const converging = looksConvergent(params);

        return (
          <Panel
            id="fixture-panel"
            title="The running mean"
            question="Does the mean of the first n terms tend to zero?"
            lead="One non-zero term, averaged against everything before and after it."
          >
            <RunningValue
              values={means}
              target={{ at: 0, label: 'the limit the claim assumes' }}
              yLabel="running mean"
              xLabel="terms taken (n)"
              ariaLabel={`Running mean of the first ${params.n} terms, with a spike of ${params.spikeSize} at term ${params.spikeAt}. The final mean is ${decisive.toFixed(2)}.`}
            />

            <Controls>
              <Slider
                label="Terms taken"
                display={`n = ${params.n}`}
                value={params.n}
                min={4}
                max={120}
                onChange={(n) => setParams({ n })}
              />
              <Slider
                label="Size of the single spike"
                display={String(params.spikeSize)}
                value={params.spikeSize}
                min={0}
                max={600}
                step={4}
                onChange={(spikeSize) => setParams({ spikeSize })}
              />
            </Controls>

            <Readout
              items={[
                { term: 's / n', value: decisive.toFixed(2), tone: 'decisive' },
                {
                  term: 'reads as',
                  value: converging ? 'settling to zero' : 'not settling at all',
                  tone: converging ? 'ok' : 'broken',
                  text: true,
                },
              ]}
            />
            <BreakChips />
          </Panel>
        );
      }}
    </ExploreShell>
  );
}
