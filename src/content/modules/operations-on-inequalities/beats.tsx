import { useId } from 'react';
import { NumberLine } from '../../../components/charts';
import { AMPLIFIER_DESCRIPTIONS, AMPLIFIER_NAMES } from '../../../lib/amplifiers';
import { emit } from '../../../lib/events';
import {
  PRIMARY_WITNESS,
  VERDICT_LABELS,
  WITNESSES,
  X_STEP_TENTHS,
  disagreementSet,
  errorDirection,
  formatFixed,
  formatIntervals,
  readingAt,
  solutionSet,
  tenthsToX,
  witnessById,
  xToTenths,
  type Witness,
} from './compute';

/**
 * Beats 3 to 5 of module 02.
 *
 * Every interval and every verdict below is evaluated from the inequalities in
 * compute.ts. The maths that is set as display type lives in index.md, where
 * KaTeX runs at build time; what appears here is plain Unicode, which reads
 * correctly aloud and costs the reader no download.
 */

/* -------------------------------------------------------------------------- *
 * Beat 3 — the break: two solution sets, side by side
 * -------------------------------------------------------------------------- */

export function Break() {
  const witness = PRIMARY_WITNESS;
  const truth = solutionSet(witness.original, witness.domain);
  const afterStep = solutionSet(witness.transformed, witness.domain);

  return (
    <div className="columns">
      <div className="witness-column witness-break">
        <div className="table-scroll" tabIndex={0} role="group" aria-label="What the step gives">
          <table className="data-table">
            <caption>What the step gives</caption>
            <tbody>
              <tr>
                <th scope="row">{witness.transformed.text}</th>
                <td className="numeric">{formatIntervals(afterStep)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="witness-verdict">One range.</p>
      </div>

      <div className="witness-column witness-primary">
        <div className="table-scroll" tabIndex={0} role="group" aria-label="What is actually true">
          <table className="data-table">
            <caption>What is actually true</caption>
            <tbody>
              <tr>
                <th scope="row">{witness.original.text}</th>
                <td className="numeric">{formatIntervals(truth)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="witness-verdict">Two.</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Beat 4 — the essence
 * -------------------------------------------------------------------------- */

export function Essence() {
  const witness = PRIMARY_WITNESS;
  const lost = disagreementSet(witness);
  const sample = readingAt(witness, 0);

  return (
    <section className="beat-panel" aria-labelledby="essence-heading">
      <h3 id="essence-heading" className="panel-heading">
        Where the solutions went
      </h3>

      <div className="prose">
        <p>
          Take one value from the range the step dropped. At x = {formatFixed(sample.x, 0)} the
          original reads ({formatFixed(sample.x, 0)} + 1)/({formatFixed(sample.x, 0)} − 2) ={' '}
          {formatFixed((sample.x + 1) / (sample.x - 2), 2)}, which is under 3, so the statement{' '}
          {VERDICT_LABELS[sample.original]}. Put the same value into what the step produced and it{' '}
          {VERDICT_LABELS[sample.transformed]}.
        </p>
        <p className="statement">
          The two statements disagree on {formatIntervals(lost)} — and that set is the whole cost
          of the step.
        </p>
        <p>
          Nothing was miscalculated. x − 2 is positive above 2 and negative below it, so
          multiplying by it is one step above 2 and the opposite step below it. Applied to both
          sides at once, it keeps the order where the factor is positive and turns it round where
          the factor is negative.
        </p>
        <p className="statement">
          Before you do the same thing to both sides, ask what that thing does to order across the
          values still in play.
        </p>
      </div>

      <dl className="amplifiers">
        {(['sign-reversal', 'domain-loss'] as const).map((amplifier) => (
          <div key={amplifier}>
            <dt>{AMPLIFIER_NAMES[amplifier]}</dt>
            <dd>{AMPLIFIER_DESCRIPTIONS[amplifier]}</dd>
          </div>
        ))}
      </dl>
      <p className="panel-note">
        Both are at work here: the order turns round below 2, and at x = 2 itself the original
        statement is not defined while the one the step produced is.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * Beat 5 — the control
 * -------------------------------------------------------------------------- */

export interface ExplorerProps {
  witnessId: string;
  xTenths: number;
  onChange: (patch: { witnessId?: string; xTenths?: number }) => void;
}

function verdictClass(verdict: string): string {
  if (verdict === 'true') return 'value-decisive';
  if (verdict === 'undefined') return 'value-indeterminate';
  return 'value-broken';
}

/**
 * The centre of the module.
 *
 * Two controls: which step was taken, and where you are standing. Walking x
 * across the line and watching the two verdicts come apart is the whole
 * argument — the disagreement set stops being a set and becomes a stretch of
 * the line you can stand in.
 *
 * x moves in tenths, carried as an integer, so it can land exactly on 2, where
 * the original statement is not defined at all.
 */
export function Explorer({ witnessId, xTenths, onChange }: ExplorerProps) {
  const witnessSelectId = useId();
  const xId = useId();

  const witness: Witness = witnessById(witnessId);
  const x = tenthsToX(xTenths);
  const reading = readingAt(witness, x);
  const truth = solutionSet(witness.original, witness.domain);
  const lost = disagreementSet(witness);

  const move = (patch: { witnessId?: string; xTenths?: number }) => {
    onChange(patch);
    const next = witnessById(patch.witnessId ?? witnessId);
    const nextX = tenthsToX(patch.xTenths ?? xTenths);
    emit({
      type: 'slider_move',
      question_id: next.id,
      order_kept: 0,
      value_shown: `${formatFixed(nextX, 1)}: ${readingAt(next, nextX).original} vs ${
        readingAt(next, nextX).transformed
      }`,
      t: Date.now(),
    });
  };

  return (
    <section className="beat-panel explorer" aria-labelledby="explorer-heading">
      <h3 id="explorer-heading" className="panel-heading">
        Stand somewhere and ask both statements
      </h3>

      <NumberLine
        domain={witness.domain}
        intervals={[
          // Labelled once per group: the two sets can cover the same stretch,
          // and a label on every interval would stack up on the same spot.
          ...truth.map((interval, index) => ({
            from: interval.from,
            to: interval.to,
            ...(index === 0 ? { label: 'true solutions' } : {}),
            tone: 'primary' as const,
          })),
          ...lost.map((interval, index) => ({
            from: interval.from,
            to: interval.to,
            ...(index === 0 ? { label: 'where the step disagrees' } : {}),
            tone: 'break' as const,
          })),
        ]}
        marks={[
          {
            // Unlabelled: the control beneath already reads x, and a label here
            // sits inside the band it is standing in.
            at: x,
            tone: reading.agree ? ('primary' as const) : ('break' as const),
            open: reading.original === 'undefined',
          },
        ]}
        ariaLabel={`A number line for ${witness.original.text}. The true solutions are ${formatIntervals(
          truth,
        )}. The step disagrees on ${formatIntervals(lost)}. x is at ${formatFixed(x, 1)}, where the original ${
          VERDICT_LABELS[reading.original]
        } and the transformed statement ${VERDICT_LABELS[reading.transformed]}.`}
        caption="Lower band: where the statement is true. Upper band: where the step disagrees with it."
        xLabel="x"
      />

      <div className="controls">
        <label className="control" htmlFor={witnessSelectId}>
          <span className="control-row">
            <span>The step</span>
          </span>
          <select
            id={witnessSelectId}
            value={witness.id}
            onChange={(e) => {
              const next = witnessById(e.target.value);
              move({ witnessId: next.id, xTenths: xToTenths(next.start) });
            }}
          >
            {WITNESSES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.original.text} — {option.step}
              </option>
            ))}
          </select>
        </label>

        <label className="control" htmlFor={xId}>
          <span className="control-row">
            <span>Where you are standing</span>
            <span className="control-value">x = {formatFixed(x, 1)}</span>
          </span>
          <input
            id={xId}
            type="range"
            min={xToTenths(witness.domain[0])}
            max={xToTenths(witness.domain[1])}
            step={X_STEP_TENTHS}
            value={xTenths}
            onChange={(e) => move({ xTenths: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="widget-readout">
        <div>
          <span className="term">{witness.original.text}</span>
          <span className={`value value-text ${verdictClass(reading.original)}`}>
            {VERDICT_LABELS[reading.original]}
          </span>
        </div>
        <div>
          <span className="term">{witness.transformed.text}</span>
          <span className={`value value-text ${verdictClass(reading.transformed)}`}>
            {VERDICT_LABELS[reading.transformed]}
          </span>
        </div>
        <div>
          <span className="term">the two statements</span>
          <span className={`value value-text ${reading.agree ? '' : 'value-broken'}`}>
            {reading.agree ? 'agree here' : 'disagree here'}
          </span>
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {`At x = ${formatFixed(x, 1)} the original ${VERDICT_LABELS[reading.original]} and the transformed statement ${
          VERDICT_LABELS[reading.transformed]
        }.`}
      </p>

      <p className="panel-note">
        The disagreement set is {formatIntervals(lost)}. Walk x into it and the two statements come
        apart; walk out and they agree again. This step {errorDirection(witness)}.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * The reframe
 * -------------------------------------------------------------------------- */

export function Reframe() {
  return (
    <section className="beat-panel" aria-labelledby="reframe-heading">
      <h3 id="reframe-heading" className="panel-heading">
        Nothing was done to one side that was not done to the other
      </h3>
      <div className="prose">
        <p>
          That is the part worth sitting with. The step was symmetric, the arithmetic was right,
          and the answer was still wrong — because doing the same thing to both sides only
          preserves an inequality when that thing preserves order, and whether it does depends on
          the values in play rather than on the shape of the expression.
        </p>
        <p className="statement">
          An equation asks what is equal. An inequality asks what is bigger. Only the second one
          can be turned round by a step that treats both sides identically.
        </p>
      </div>
    </section>
  );
}
