import type { ReactNode } from 'react';

export interface PanelProps {
  id: string;
  title: string;
  /** One line under the title saying what to do with the controls. */
  lead?: string;
  children: ReactNode;
}

/**
 * One interactive idea: a heading, the picture, the controls, the readout.
 *
 * Panels are the unit of the Explore section. Each one carries a small badge
 * saying it is interactive, because a static-looking chart is easy to scroll
 * past and the whole point of the section is that these move.
 */
export function Panel({ id, title, lead, children }: PanelProps) {
  return (
    <section className="panel" aria-labelledby={`${id}-heading`}>
      <header className="panel-head">
        <div>
          <h3 id={`${id}-heading`} className="panel-title">
            {title}
          </h3>
          {lead ? <p className="panel-lead">{lead}</p> : null}
        </div>
        <span className="panel-badge" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
            <path d="M1 5h14M1 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="5" r="2" fill="currentColor" />
            <circle cx="5" cy="11" r="2" fill="currentColor" />
          </svg>
          interactive
        </span>
      </header>
      {children}
    </section>
  );
}

/** Two figures side by side on a wide screen, stacked on a narrow one. */
export function Figures({ children }: { children: ReactNode }) {
  return <div className="figures">{children}</div>;
}
