import { useId } from 'react';
import { RunningValue } from '../../components/charts';
import { ModuleShell, type WidgetHostProps } from '../../components/ModuleShell';
import { decisiveQuantity, looksConvergent, runningMeans, type FixtureParams } from './compute';

/**
 * Fixture widget — and the template for every module widget.
 *
 * Three things are required of this file:
 *   1. a default export taking WidgetHostProps and rendering a ModuleShell,
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
  const nId = useId();
  const spikeId = useId();

  return (
    <ModuleShell {...props} initial={initial} presets={presets}>
      {(params, setParams) => {
        const means = runningMeans(params);
        const decisive = decisiveQuantity(params);
        const converging = looksConvergent(params);

        return (
          <>
            <RunningValue
              values={means}
              target={{ at: 0, label: 'the limit the claim assumes' }}
              yLabel="running mean"
              xLabel="terms taken (n)"
              ariaLabel={`Running mean of the first ${params.n} terms, with a spike of ${params.spikeSize} at term ${params.spikeAt}. The final mean is ${decisive.toFixed(2)}.`}
              caption="One non-zero term, averaged against everything before and after it."
            />

            <div className="controls">
              <label className="control" htmlFor={nId}>
                <span className="control-row">
                  <span>Terms taken</span>
                  <span className="control-value">n = {params.n}</span>
                </span>
                <input
                  id={nId}
                  type="range"
                  min={4}
                  max={120}
                  step={1}
                  value={params.n}
                  onChange={(e) => setParams({ n: Number(e.target.value) })}
                />
              </label>

              <label className="control" htmlFor={spikeId}>
                <span className="control-row">
                  <span>Size of the single spike</span>
                  <span className="control-value">{params.spikeSize}</span>
                </span>
                <input
                  id={spikeId}
                  type="range"
                  min={0}
                  max={600}
                  step={4}
                  value={params.spikeSize}
                  onChange={(e) => setParams({ spikeSize: Number(e.target.value) })}
                />
              </label>
            </div>

            <div className="widget-readout">
              <div>
                <span className="term">Decisive quantity</span>
                <span
                  className={`value ${converging ? 'value-decisive' : 'value-broken'}`}
                >
                  {decisive.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="term">Reads as</span>
                <span className="value">
                  {converging ? 'settling to zero' : 'not settling at all'}
                </span>
              </div>
            </div>
          </>
        );
      }}
    </ModuleShell>
  );
}
