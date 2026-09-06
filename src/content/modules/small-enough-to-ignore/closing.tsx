import { useState } from 'react';
import { MeasureItem } from '../../../components/measure/MeasureItem';
import { AMPLIFIER_NAMES } from '../../../lib/amplifiers';
import {
  CONFIDENCE_LABELS,
  commitFor,
  revealFor,
  type CommitEvent,
} from '../../../lib/events';
import {
  ALPHA,
  ORDER_ITEMS,
  BANK_LINK_NOTE,
  bankByAmplifier,
  degeneratePointsOf,
  formatLimit,
  hook,
  TRANSFER_CASES,
  hookErrorDirection,
  marksReciprocalPoints,
  marksTransferCases,
  parseOrderAnswer,
  transferPreservesLimit,
} from './compute';

/**
 * What follows the six beats: questions to work, and items that measure whether
 * the mechanism landed rather than whether the limit was remembered.
 *
 * Nothing here is timed. The module argues for pausing before you simplify, and
 * measuring speed would contradict the content.
 */

/* -------------------------------------------------------------------------- *
 * Beat 6, continued — the domain of the rule
 * -------------------------------------------------------------------------- */

function Domain() {
  const failures = degeneratePointsOf('r');

  return (
    <section className="beat-panel" aria-labelledby="domain-heading">
      <h3 id="domain-heading" className="panel-heading">
        Why the habit survives
      </h3>
      <div className="prose">
        <p>
          Two things have to hold, and almost always both do: the expression you are
          left with after substituting has to be defined where you are standing, and the
          effect of what you discarded has to still vanish after everything you do to it
          afterwards. For R the first fails only at θ ={' '}
          {failures.map((degrees) => `${degrees}°`).join(' and ')} and their repeats — a
          set of measure zero.
        </p>
        <p>
          Which is exactly why the habit survives. You will be right nearly every time
          you use it. The claim is not false; it is unguarded. It has a boundary, and
          examination questions are written to put you on that boundary, because that
          is where the reasoning is visible.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * Beat 7 — the bank
 * -------------------------------------------------------------------------- */

function Bank() {
  const groups = bankByAmplifier();

  return (
    <section className="beat-panel" aria-labelledby="bank-heading">
      <h3 id="bank-heading" className="panel-heading">
        Questions with the same mechanism
      </h3>
      <p className="panel-note">
        Sorted by what amplifies the discarded term, not by topic. Sorting by topic
        would teach you to recognise surds and trigonometry, which is the habit this
        module exists to break.
      </p>
      <p className="panel-note bank-warning">{BANK_LINK_NOTE}</p>

      {groups.map((group) => (
        <div
          className="table-scroll"
          key={group.amplifier}
          tabIndex={0}
          role="group"
          aria-label={`${AMPLIFIER_NAMES[group.amplifier]} questions`}
        >
          <table className="data-table">
            <caption>{AMPLIFIER_NAMES[group.amplifier]}</caption>
            <thead>
              <tr>
                <th scope="col">Question</th>
                <th scope="col">Why ρ collapses</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((entry) => (
                <tr key={`${group.amplifier}-${entry.id}`}>
                  <th scope="row">
                    <a href={entry.paper} rel="noopener" target="_blank">
                      {entry.question}
                    </a>
                    <span className="bank-slot">{entry.slot}</span>
                  </th>
                  <td>{entry.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * Measurement
 * -------------------------------------------------------------------------- */

/** M1 — order prediction, with no computation asked for. */
function OrderPrediction() {
  return (
    <>
      <h4 className="measure-heading">To what order must you expand?</h4>
      <p className="panel-note">
        Not what the limit is. How far you would have to go before anything survives.
      </p>
      <ol className="measure-list">
        {ORDER_ITEMS.map((item) => (
          <MeasureItem
            key={item.id}
            itemId={item.id}
            question={<p className="measure-expression">{item.text}</p>}
            input={{
              kind: 'number',
              label: 'Orders past the leading one',
              placeholder: '1, 2, 3…',
            }}
            mark={(response) => {
              const orders = parseOrderAnswer(response);
              return {
                correct: orders === item.ordersPastLeading,
                ordersPredicted: orders,
              };
            }}
            explanation={
              <p>
                {item.ordersPastLeading} past the leading term. {item.because} The limit
                is {formatLimit(item.limit())}.
              </p>
            }
          />
        ))}
      </ol>
    </>
  );
}

/** M2 — the transfer item: the same machinery, one step away from the taught case. */
function LocateThePoint() {
  const answer = degeneratePointsOf('reciprocal');
  const taught = degeneratePointsOf('r');
  const options = [0, 90, 180, 270].map((degrees) => ({
    id: String(degrees),
    label: `${degrees}°`,
  }));

  return (
    <>
      <h4 className="measure-heading">Where does first order fail here?</h4>
      <ol className="measure-list">
        <MeasureItem
          itemId="reciprocal-degenerate-points"
          question={
            <>
              <p className="measure-expression">
                lim (α → 0) of (cos(θ + α) − cos θ) / (sin(θ + α) − sin θ)
              </p>
              <p className="panel-note">
                Select every θ in [0°, 360°) at which first-order expansion fails to
                determine the limit.
              </p>
            </>
          }
          input={{ kind: 'multi', options }}
          mark={(response) => ({ correct: marksReciprocalPoints(response) })}
          explanation={
            <p>
              {answer.map((degrees) => `${degrees}°`).join(' and ')}. This is the same
              ratio the other way up, so it is the numerator's leading coefficient that
              has to survive now — cos θ rather than sin θ. The taught case,{' '}
              {taught.map((degrees) => `${degrees}°`).join(' and ')}, is where this one
              is perfectly well behaved.
            </p>
          }
        />
      </ol>
    </>
  );
}

/**
 * Cross-context transfer: four shortcuts of the same shape, in four different
 * settings, where only the discarded effect separates them. Nothing here is the
 * question the module worked through, so recall does not help.
 */
function PreservesTheLimit() {
  const options = TRANSFER_CASES.map((item) => ({ id: item.id, label: item.text }));
  const keep = TRANSFER_CASES.filter((item) => transferPreservesLimit(item));

  return (
    <>
      <h4 className="measure-heading">When does the shortcut preserve the limit?</h4>
      <p className="panel-note">
        Each one replaces the small quantity by zero. Select every case where that still
        gives the limit asked for.
      </p>
      <ol className="measure-list">
        <MeasureItem
          itemId="shortcut-preserves-limit"
          question={
            <ul className="transfer-list">
              {TRANSFER_CASES.map((item) => (
                <li key={item.id}>
                  <span className="measure-expression">{item.text}</span>
                  <span className="transfer-shortcut">{item.shortcutText}</span>
                </li>
              ))}
            </ul>
          }
          input={{ kind: 'multi', options }}
          mark={(response) => ({ correct: marksTransferCases(response) })}
          explanation={
            <>
              <p>
                {keep.map((item) => item.id).join(', ')} preserve the limit;{' '}
                {TRANSFER_CASES.filter((item) => !transferPreservesLimit(item))
                  .map((item) => item.id)
                  .join(', ')}{' '}
                does not.
              </p>
              <ul>
                {TRANSFER_CASES.map((item) => (
                  <li key={item.id}>
                    <strong>{item.id}.</strong> {item.because}
                  </li>
                ))}
              </ul>
            </>
          }
        />
      </ol>
    </>
  );
}

/** M4 — direction of the error, which separates the mechanism from the mantra. */
function DirectionOfError() {
  const direction = hookErrorDirection();

  return (
    <>
      <h4 className="measure-heading">Which way does the error go?</h4>
      <ol className="measure-list">
        <MeasureItem
          itemId="hook-error-direction"
          question={
            <p>Truncating too early in {hook.text} makes your answer:</p>
          }
          input={{
            kind: 'choice',
            options: [
              { id: 'too big', label: 'too big' },
              { id: 'too small', label: 'too small' },
              { id: 'undefined', label: 'undefined' },
            ],
          }}
          mark={(response) => ({ correct: response === direction })}
          explanation={
            <p>
              It comes out {direction}: keeping nothing gives {hook.naiveValue(1)} against
              a true value of {hook.limit}. It goes the other way just as often — a
              truncation can leave a confident number that is too big.
            </p>
          }
        />
      </ol>
    </>
  );
}

/** M3 — calibration. Their own commitments, read back. */
function Calibration() {
  // Read once, when the reader asks: the log fills up as they work down the page.
  const [shown, setShown] = useState<CommitEvent[] | null>(null);

  const read = () =>
    setShown(
      ['hook-limit', 'drop-alpha-squared']
        .map((promptId) => commitFor(promptId))
        .filter((event): event is CommitEvent => event !== undefined),
    );

  /**
   * The first commitment was marked when it was made, so the verdict is read
   * from the reveal event rather than marked a second time here. The second has
   * no single right answer to reveal at the time — but the module spends a beat
   * arguing that it depends, so that is the position it scores.
   */
  const verdictFor = (event: CommitEvent): 'right' | 'wrong' =>
    (event.prompt_id === 'drop-alpha-squared'
      ? event.response.startsWith('Depends')
      : (revealFor(event.prompt_id)?.correct ?? false))
      ? 'right'
      : 'wrong';

  return (
    <section className="beat-panel" aria-labelledby="calibration-heading">
      <h3 id="calibration-heading" className="panel-heading">
        What you said on the way here
      </h3>

      {shown === null ? (
        <div className="gate-actions">
          <button type="button" className="button button-quiet" onClick={read}>
            Show me what I committed to
          </button>
        </div>
      ) : shown.length === 0 ? (
        <p className="panel-note">Nothing committed yet — the page is still ahead of you.</p>
      ) : (
        <div className="table-scroll" tabIndex={0} role="group" aria-label="Your commitments">
          <table className="data-table">
            <caption>Your commitments, and how they turned out</caption>
            <thead>
              <tr>
                <th scope="col">You said</th>
                <th scope="col">How sure</th>
                <th scope="col">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((event) => (
                <tr key={event.prompt_id}>
                  <th scope="row">{event.response}</th>
                  <td>{event.confidence ? CONFIDENCE_LABELS[event.confidence] : '—'}</td>
                  <td className={verdictFor(event) === 'wrong' ? 'is-wrong' : undefined}>
                    {verdictFor(event)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="panel-note">
        The gap between how sure you were and how right you were is the thing worth
        tracking. It is also the only thing here that is not about this question.
      </p>
    </section>
  );
}

export default function SmallEnoughToIgnoreClosing() {
  return (
    <div className="closing">
      <Domain />
      <Bank />

      <section className="beat-panel" aria-labelledby="measure-heading">
        <h3 id="measure-heading" className="panel-heading">
          Check the mechanism, not the answer
        </h3>
        <OrderPrediction />
        <LocateThePoint />
        <PreservesTheLimit />
        <DirectionOfError />
      </section>

      <Calibration />

      <p className="takeaway">
        Look at what survives <em>before</em> you decide what to drop. If what survives
        is zero, you dropped too much.
      </p>
      <p className="panel-note">α was fixed at {ALPHA} throughout.</p>
    </div>
  );
}
