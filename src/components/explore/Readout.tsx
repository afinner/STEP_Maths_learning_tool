import type { ReactNode } from 'react';

export type ReadoutTone =
  /** An ordinary number. */
  | 'plain'
  /** The decisive quantity: the one the section head promised. */
  | 'decisive'
  /** Where the claim is failing. */
  | 'broken'
  /** Where the claim is fine. */
  | 'ok'
  /** Not a number at all — a different kind of state, and the only red on the page. */
  | 'indeterminate';

export interface ReadoutItem {
  term: ReactNode;
  value: ReactNode;
  tone?: ReadoutTone;
  /** A few words under the value, when the number needs one. */
  note?: ReactNode;
  /** Words rather than a number: set in the UI face, not monospace. */
  text?: boolean;
}

/**
 * The numbers under a panel, laid out so they can be compared.
 *
 * Every value here comes from compute.ts; the readout only formats. The
 * decisive item is set larger and in the accent, because it is the answer to
 * the question the section head asks.
 */
export function Readout({ items, live = true }: { items: readonly ReadoutItem[]; live?: boolean }) {
  return (
    <dl className="readout" aria-live={live ? 'polite' : undefined}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`readout-item readout-${item.tone ?? 'plain'}${item.text ? ' readout-text' : ''}`}
        >
          <dt className="readout-term">{item.term}</dt>
          <dd className="readout-value">{item.value}</dd>
          {item.note ? <dd className="readout-note">{item.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
