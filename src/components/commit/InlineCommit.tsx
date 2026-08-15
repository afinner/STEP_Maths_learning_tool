import { useState, type ReactNode } from 'react';
import { emit } from '../../lib/events';
import { CommitGate } from './CommitGate';
import type { CommitMode, CommitRecord } from './commitFlow';

export interface InlineCommitProps {
  beat: number;
  promptId: string;
  mode: CommitMode;
  prompt: string;
  hint?: string;
  options?: readonly string[];
  children: (record: CommitRecord) => ReactNode;
}

/**
 * A commit gate part-way down a module, for the second and later commitments.
 *
 * The module-level gate lives in ModuleShell; this is the same object further
 * in. It emits the event so that no module has to remember to, which is what
 * makes the calibration read-back at the end possible without every beat
 * wiring itself up.
 */
export function InlineCommit({
  beat,
  promptId,
  mode,
  prompt,
  hint,
  options,
  children,
}: InlineCommitProps) {
  const [record, setRecord] = useState<CommitRecord | null>(null);

  if (record) return <>{children(record)}</>;

  return (
    <CommitGate
      mode={mode}
      prompt={prompt}
      {...(hint !== undefined ? { hint } : {})}
      {...(options !== undefined ? { options } : {})}
      onCommit={(committed) => {
        setRecord(committed);
        emit({
          type: 'commit',
          beat,
          prompt_id: promptId,
          response: committed.response,
          confidence: committed.confidence,
          t: committed.t,
        });
      }}
    >
      {children}
    </CommitGate>
  );
}
