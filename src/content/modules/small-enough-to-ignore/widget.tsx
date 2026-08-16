import { ModuleShell, type WidgetHostProps } from '../../../components/ModuleShell';
import { InlineCommit } from '../../../components/commit/InlineCommit';
import type { CommitRecord } from '../../../components/commit/commitFlow';
import { CONFIDENCE_LABELS } from '../../../lib/events';
import {
  Confirmation,
  Essence,
  Reframe,
  TruncationExplorer,
  TwoColumns,
  WitnessSetup,
} from './beats';
import {
  DEGENERATE_THETA,
  SAFE_THETA,
  formatFixed,
  hook,
  hookTable,
  type Params,
} from './compute';

/**
 * Module 01 — beats 1 to 5.
 *
 * Beat 1 asks, beat 2 takes the commitment, beat 3 shows the numbers. Beat 4
 * names the mechanism on the simplest case there is, and beat 5 runs the same
 * move against a witness where it is right in one place and useless in another.
 *
 * The gates preserve both commitments before their corresponding evidence is
 * revealed; the learner cannot short-circuit the sequence by using a control.
 */

const initial: Params = {
  theta: SAFE_THETA,
  order: 1,
  n: 100,
};

export const presets: Record<string, Params> = {
  // The denominator's first-order term is absent, not small.
  'substitution-remains-defined': { ...initial, theta: DEGENERATE_THETA },
  // Push n out to a million: the dropped term shrinks, the product does not.
  'discarded-effect-vanishes': { ...initial, n: 1_000_000 },
};

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
      {(params, setParams, record) => (
        <Beats
          record={record}
          params={params}
          onChange={(patch) => setParams(patch as Partial<Params>)}
        />
      )}
    </ModuleShell>
  );
}

function Beats({
  record,
  params,
  onChange,
}: {
  record: CommitRecord;
  params: Params;
  onChange: (patch: Partial<Params>) => void;
}) {
  return (
    <>
      <HookTable />
      <Reveal record={record} />
      <Essence n={params.n} />

      <WitnessSetup />

      <InlineCommit
        beat={5}
        promptId="drop-alpha-squared"
        mode="choice"
        prompt="The α² terms are much smaller than the α terms. Can we drop them?"
        options={['Yes, always', 'No, never', 'Depends — on what?']}
      >
        {() => (
          <>
            <TwoColumns />
            <TruncationExplorer
              theta={params.theta}
              order={params.order}
              onChange={onChange}
            />
            <Reframe />
            <Confirmation />
          </>
        )}
      </InlineCommit>
    </>
  );
}
