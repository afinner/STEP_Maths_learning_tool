import { useEffect, useState } from 'react';
import { ModuleShell, type WidgetHostProps } from '../../../components/ModuleShell';
import type { CommitRecord } from '../../../components/commit/commitFlow';
import { CONFIDENCE_LABELS } from '../../../lib/events';
import {
  DEGENERATE_THETA,
  SAFE_THETA,
  formatFixed,
  hook,
  hookTable,
  type Order,
} from './compute';

/**
 * Module 01 — beats 1 to 3.
 *
 * Beat 1 asks. Beat 2 takes the commitment. Beat 3 shows the numbers, and only
 * then the reader's own answer beside them. The gate is ModuleShell's, so the
 * ordering is enforced by a reducer rather than by the arrangement of this file.
 *
 * Beat 4 and the truncation-order slider arrive in the next stage; the
 * parameters they will need are already here, since the hypothesis ledger sets
 * them.
 */

export interface Params {
  theta: number;
  order: Order;
  n: number;
}

const initial: Params = {
  theta: SAFE_THETA,
  order: 1,
  n: 1_000_000,
};

export const presets: Record<string, Params> = {
  // The denominator's first-order term is absent, not small.
  'leading-term-survives': { ...initial, theta: DEGENERATE_THETA },
  // Keep only O(1) and both series retain nothing at all.
  'kept-terms-do-not-cancel': { ...initial, order: 0 },
  // As far out as the table goes, the dropped term is still exactly one half.
  'dropped-term-is-not-amplified': { ...initial, n: 1_000_000 },
};

/**
 * Let the numbers stand alone for a moment before the reader is told what they
 * mean. Scrolling or a keypress brings the line forward — a reader who has
 * already seen it should not have to wait for prose.
 */
function useAfterABeat(delayMs = 2200): boolean {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (arrived) return;
    const show = () => setArrived(true);
    const timer = window.setTimeout(show, delayMs);
    window.addEventListener('scroll', show, { once: true, passive: true });
    window.addEventListener('keydown', show, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', show);
      window.removeEventListener('keydown', show);
    };
  }, [arrived, delayMs]);

  return arrived;
}

function HookTable() {
  return (
    <table className="data-table">
      <caption>What it actually does</caption>
      <thead>
        <tr>
          <th scope="col">n</th>
          <th scope="col">n(√(n² + 1) − n)</th>
        </tr>
      </thead>
      <tbody>
        {hookTable().map(({ n, value }) => (
          <tr key={n}>
            <th scope="row">{n.toLocaleString('en-GB')}</th>
            <td className="numeric">{formatFixed(value, 7)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Beat 3. The reader's answer, then the value — never the other way round. */
function Reveal({ record }: { record: CommitRecord }) {
  const gotIt = record.value !== null && Math.abs(record.value - hook.limit) < 1e-6;
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
          It is {formatFixed(hook.limit, 1)}, and you said so. Now the harder version:
          why does it not go to zero? What did the people who said zero actually do?
        </p>
      ) : (
        <p className="reveal-verdict">
          It is <strong>{formatFixed(hook.limit, 1)}</strong>.
        </p>
      )}
    </div>
  );
}

export default function SmallEnoughToIgnoreWidget(props: WidgetHostProps) {
  return (
    <ModuleShell
      {...props}
      initial={initial}
      presets={presets}
      commit={{
        mode: 'numeric-with-confidence',
        beat: 2,
        promptId: 'hook-limit',
        hint: 'No working, no calculator, no looking anything up. The first answer that feels right.',
        target: hook.limit,
      }}
    >
      {(_params, _setParams, record) => <BeatsOneToThree record={record} />}
    </ModuleShell>
  );
}

function BeatsOneToThree({ record }: { record: CommitRecord }) {
  const readbackArrived = useAfterABeat();

  return (
    <>
      <HookTable />
      {readbackArrived ? <Reveal record={record} /> : null}
      <p className="visually-hidden" aria-live="polite">
        {readbackArrived ? `The limit is ${formatFixed(hook.limit, 1)}.` : ''}
      </p>
    </>
  );
}
