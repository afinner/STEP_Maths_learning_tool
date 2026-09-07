import { ModuleShell, type WidgetHostProps } from '../../../components/ModuleShell';
import { isCorrect, type CommitRecord } from '../../../components/commit/commitFlow';
import { CONFIDENCE_LABELS } from '../../../lib/events';
import { Break, Essence, Explorer, Reframe } from './beats';
import {
  PRIMARY_WITNESS,
  solutionSet,
  witnessById,
  xToTenths,
} from './compute';

/**
 * Module 02 — Operations on inequalities.
 *
 * The reader is asked how many ranges of x satisfy the inequality, commits to a
 * number, and is then shown both solution sets. The naive route gives one range
 * and the truth is two, so the commitment and the break are the same object.
 *
 * The gates are reducers in shared infrastructure, so the order cannot be
 * short-circuited by rearranging this file.
 */

export interface Params {
  witnessId: string;
  xTenths: number;
}

const initial: Params = {
  witnessId: PRIMARY_WITNESS.id,
  xTenths: xToTenths(PRIMARY_WITNESS.start),
};

export const presets: Record<string, Params> = {
  // Stand at x = 0, inside the branch the multiplication threw away: the factor
  // x - 2 is negative there, so the step ran the other way.
  'multiplier-keeps-one-sign': { witnessId: 'multiply-by-unknown-sign', xTenths: 0 },
  // Squaring, at a value where the right-hand side is negative and the
  // operation stops being increasing.
  'operation-preserves-order': { witnessId: 'square-both-sides', xTenths: -15 },
};

/** How many separate ranges the truth actually has: the answer to the hook. */
const trueRangeCount = solutionSet(
  PRIMARY_WITNESS.original,
  PRIMARY_WITNESS.domain,
).length;

/** Beat 3. The reader's answer, then the count — never the other way round. */
function Reveal({ record }: { record: CommitRecord }) {
  const gotIt = isCorrect(record, trueRangeCount);
  const confidence = record.confidence ? CONFIDENCE_LABELS[record.confidence] : null;

  return (
    <div className="reveal" aria-live="polite">
      <p className="reveal-readback">
        You said <strong>{record.response}</strong>.
        {confidence ? (
          <>
            {' '}
            You were <strong>{confidence.toLowerCase()}</strong>.
          </>
        ) : null}
      </p>

      {gotIt ? (
        <p className="reveal-verdict">
          There are {trueRangeCount}, and you said so. Now the harder version: the step above is
          symmetric and every line of the arithmetic is right, so where did the second range go?
        </p>
      ) : (
        <p className="reveal-verdict">
          There are <strong>{trueRangeCount}</strong>.
        </p>
      )}
    </div>
  );
}

export default function OperationsOnInequalitiesWidget(props: WidgetHostProps) {
  return (
    <ModuleShell
      {...props}
      initial={initial}
      presets={presets}
      commit={{
        mode: 'numeric-with-confidence',
        beat: 2,
        promptId: 'range-count',
        target: trueRangeCount,
      }}
    >
      {(params, setParams, record) => (
        <>
          <Break />
          <Reveal record={record} />
          <Essence />
          <Explorer
            witnessId={params.witnessId}
            xTenths={params.xTenths}
            onChange={(patch) => setParams(patch as Partial<Params>)}
          />
          <Reframe />
        </>
      )}
    </ModuleShell>
  );
}

/** Exported for the tests: the witness the ledger presets point at. */
export { witnessById };
