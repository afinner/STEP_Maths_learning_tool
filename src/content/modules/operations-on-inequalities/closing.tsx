import { MeasureItem } from '../../../components/measure/MeasureItem';
import { AMPLIFIER_NAMES } from '../../../lib/amplifiers';
import {
  BANK_CITATION_NOTE,
  FURTHER_QUESTIONS,
  LENGTH_ITEM,
  MULTIPLIER_ITEMS,
  PRIMARY_WITNESS,
  STEP_CASES,
  bankByAmplifier,
  casePreservesSolutions,
  errorDirection,
  formatFixed,
  marksErrorDirection,
  marksSignChange,
  marksStepCases,
  marksTotalLength,
  principleQuestions,
  signChanges,
  solutionLength,
} from './compute';

/**
 * What follows the six beats: items that measure whether the mechanism landed
 * rather than whether the worked example was remembered.
 *
 * The bank is in two halves, because order preservation appears in the papers
 * in two roles: as the trap, and as the tool. A reader who has only met it as a
 * hazard has half of it.
 *
 * Nothing here is timed.
 */

function Domain() {
  return (
    <section className="beat-panel" aria-labelledby="domain-heading">
      <h3 id="domain-heading" className="panel-heading">
        Why the habit survives
      </h3>
      <div className="prose">
        <p>
          Almost every step you have ever taken on an inequality was sound, and for a reason:
          adding, subtracting, and multiplying or dividing by a positive number are all increasing
          across every value, so they cannot turn an order round. For most of school algebra the
          multiplier is a number you can see the sign of, and the habit is never tested.
        </p>
        <p>
          It fails when the multiplier contains the unknown, because then its sign is not a fact
          you can check once — it is a question with a different answer in different places. That
          is a small target, and examination questions are written to put you on it.
        </p>
        <p>
          They are also written to make you use it deliberately. Integration preserves order;
          squaring preserves it between non-negatives; taking reciprocals reverses it between
          quantities of the same sign. Each of those is a licence rather than a warning, and the
          second half of the bank below is questions that ask you to state one and then lean on
          it. Knowing where the rule holds is the same knowledge as knowing where it breaks.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * The bank
 * -------------------------------------------------------------------------- */

function Bank() {
  const groups = bankByAmplifier();
  const principles = principleQuestions();

  return (
    <section className="beat-panel" aria-labelledby="bank-heading">
      <h3 id="bank-heading" className="panel-heading">
        Questions with the same mechanism
      </h3>
      <p className="panel-note">
        Sorted by how the step goes wrong, not by topic. Sorting by topic would teach you to
        recognise fractions and moduli, which is the habit this module exists to break.
      </p>
      <p className="panel-note bank-warning">{BANK_CITATION_NOTE}</p>

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
                <th scope="col">What it asks</th>
                <th scope="col">Where the step turns round</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((entry) => (
                <tr key={`${group.amplifier}-${entry.id}`}>
                  <th scope="row">
                    <a href={entry.link} rel="noopener" target="_blank">
                      {entry.question}
                    </a>
                  </th>
                  <td>{entry.situation}</td>
                  <td>{entry.why[group.amplifier]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <h4 className="measure-heading">Where the same rule is the tool</h4>
      <p className="panel-note">
        Not traps. In each of these the question asks you to establish an order-preserving step,
        or to use one on purpose — which is the other half of having the idea.
      </p>
      <div className="table-scroll" tabIndex={0} role="group" aria-label="Order preservation used deliberately">
        <table className="data-table">
          <caption>Order preservation as the tool</caption>
          <thead>
            <tr>
              <th scope="col">Question</th>
              <th scope="col">What it asks</th>
              <th scope="col">What it turns on</th>
            </tr>
          </thead>
          <tbody>
            {principles.map((entry) => (
              <tr key={entry.id}>
                <th scope="row">
                  <a href={entry.link} rel="noopener" target="_blank">
                    {entry.question}
                  </a>
                </th>
                <td>{entry.situation}</td>
                <td>{entry.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="measure-heading">Further questions in the same family</h4>
      <p className="panel-note">
        Listed and nothing more: this module has not worked these through, and the database
        entries carry topic keywords rather than the questions themselves, so what follows is
        how the database files each one and not a claim about what it does with order.
      </p>
      <ul className="further-list">
        {FURTHER_QUESTIONS.map((entry) => (
          <li key={entry.id}>
            <a href={entry.link} rel="noopener" target="_blank">
              {entry.question}
            </a>
            <span className="further-topics">{entry.topics}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Isolates the mechanism: name where a step turns round, without solving anything. */
function WhereItTurns() {
  return (
    <>
      <h4 className="measure-heading">Where does the step turn round?</h4>
      <p className="panel-note">
        You are about to multiply both sides by each factor below. Give the value of x at which
        that step changes from order-preserving to order-reversing. No solving required.
      </p>
      <ol className="measure-list">
        {MULTIPLIER_ITEMS.map((item) => (
          <MeasureItem
            key={item.id}
            itemId={`sign-change-${item.id}`}
            question={<p className="measure-expression">multiply both sides by ({item.text})</p>}
            input={{ kind: 'number', label: 'x =', placeholder: 'a value' }}
            mark={(response) => ({ correct: marksSignChange(item, response) })}
            explanation={
              <p>
                {item.text} is zero at x ={' '}
                {signChanges(item)
                  .map((point) => formatFixed(point, 1))
                  .join(' and ')}
                , and changes sign there. Above it the step keeps the inequality the way round it
                was; below it the step turns it round.
              </p>
            }
          />
        ))}
      </ol>
    </>
  );
}

/**
 * Cross-context transfer: four steps in four settings the module never worked
 * through, where only whether the operation preserves order separates them.
 */
function WhichStepsAreSound() {
  const options = STEP_CASES.map((item) => ({
    id: item.id,
    label: `${item.text} — ${item.stepText}`,
  }));
  const sound = STEP_CASES.filter((item) => casePreservesSolutions(item));

  return (
    <>
      <h4 className="measure-heading">Which of these steps keep the solution set?</h4>
      <p className="panel-note">
        Select every step that leaves the set of x satisfying the statement exactly as it was.
      </p>
      <ol className="measure-list">
        <MeasureItem
          itemId="which-steps-are-sound"
          question={
            <ul className="transfer-list">
              {STEP_CASES.map((item) => (
                <li key={item.id}>
                  <span className="measure-expression">
                    {item.id}. {item.text}
                  </span>
                  <span className="transfer-shortcut">{item.stepText}</span>
                </li>
              ))}
            </ul>
          }
          input={{ kind: 'multi', options }}
          mark={(response) => ({ correct: marksStepCases(response) })}
          explanation={
            <>
              <p>
                {sound.map((item) => item.id).join(' and ')} keep the solution set;{' '}
                {STEP_CASES.filter((item) => !casePreservesSolutions(item))
                  .map((item) => item.id)
                  .join(' and ')}{' '}
                do not.
              </p>
              <ul>
                {STEP_CASES.map((item) => (
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

/**
 * Total length: the property worth stealing from the bank's self-marking
 * question. Drop a branch and the number is visibly short by exactly what was
 * lost, so the arithmetic reports the omission rather than hiding it.
 */
function TotalLength() {
  const truth = solutionLength(LENGTH_ITEM.original, LENGTH_ITEM.domain);
  const dropped = solutionLength(LENGTH_ITEM.naive, LENGTH_ITEM.domain);

  return (
    <>
      <h4 className="measure-heading">What is the total length of the solution set?</h4>
      <p className="panel-note">
        Solve it, then add up the lengths of the ranges you found. One number.
      </p>
      <ol className="measure-list">
        <MeasureItem
          itemId="total-length"
          question={<p className="measure-expression">{LENGTH_ITEM.text}</p>}
          input={{ kind: 'number', label: 'Total length', placeholder: 'a length' }}
          mark={(response) => ({ correct: marksTotalLength(LENGTH_ITEM, response) })}
          explanation={
            <p>
              {formatFixed(truth ?? 0, 0)}. The modulus splits the statement at zero into two
              ranges of equal length, one either side. {LENGTH_ITEM.naiveText.charAt(0).toUpperCase()}
              {LENGTH_ITEM.naiveText.slice(1)} keeps only the right-hand one and gives{' '}
              {formatFixed(dropped ?? 0, 0)} — short by exactly the branch that went missing.
              That is what makes a question worth asking this way: the number tells you something
              is gone without anyone having to mark it.
            </p>
          }
        />
      </ol>
    </>
  );
}

/** Which way the error went: separates the mechanism from "watch out for negatives". */
function DirectionOfError() {
  const witness = PRIMARY_WITNESS;
  const direction = errorDirection(witness);

  return (
    <>
      <h4 className="measure-heading">Which way did the error go?</h4>
      <ol className="measure-list">
        <MeasureItem
          itemId="inequality-error-direction"
          question={
            <p>
              Multiplying {witness.original.text} through by (x − 2) gives an answer that:
            </p>
          }
          input={{
            kind: 'choice',
            options: [
              { id: 'loses solutions', label: 'loses solutions' },
              { id: 'gains solutions', label: 'gains solutions' },
              { id: 'both', label: 'does both' },
            ],
          }}
          mark={(response) => ({ correct: marksErrorDirection(witness.id, response) })}
          explanation={
            <p>
              It {direction}: every x the step reports is genuinely a solution, and a whole branch
              of genuine solutions is missing. A step that reverses the order outright — dividing
              by a negative constant without turning the sign round — does both at once, which is
              a different failure with the same cause.
            </p>
          }
        />
      </ol>
    </>
  );
}

export default function OperationsOnInequalitiesClosing() {
  return (
    <div className="closing">
      <Domain />
      <Bank />

      <section className="beat-panel" aria-labelledby="measure-heading">
        <h3 id="measure-heading" className="panel-heading">
          Check the mechanism, not the answer
        </h3>
        <WhereItTurns />
        <WhichStepsAreSound />
        <TotalLength />
        <DirectionOfError />
      </section>

      <p className="takeaway">
        Before you do the same thing to both sides, ask what that thing does to order across the
        values still in play.
      </p>
    </div>
  );
}
