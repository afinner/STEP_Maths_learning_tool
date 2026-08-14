import type { ReactNode } from 'react';

interface PredictionGateProps {
  prompt: string;
  revealed: boolean;
  onReveal: () => void;
  children: ReactNode;
}

/**
 * The reader commits before they look. Nothing is stored anywhere — the point
 * is the half-second of commitment, not the record of it, and a reload starting
 * fresh is the correct behaviour for a page someone returns to.
 */
export function PredictionGate({ prompt, revealed, onReveal, children }: PredictionGateProps) {
  if (revealed) {
    return <>{children}</>;
  }

  return (
    <div className="gate">
      <p>{prompt}</p>
      <p className="gate-hint">
        Decide before you look. Getting it wrong here is the part that teaches — a
        prediction you never made cannot be corrected.
      </p>
      <div className="gate-actions">
        <button type="button" className="button" onClick={onReveal}>
          I have committed — show me
        </button>
      </div>
    </div>
  );
}
