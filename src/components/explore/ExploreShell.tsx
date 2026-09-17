import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Hypothesis } from '../../schema';

/**
 * Props the page template hands to every module widget. A widget takes these
 * and passes them straight through to ExploreShell — it never has to know where
 * they came from.
 */
export interface WidgetHostProps {
  hypotheses: readonly Hypothesis[];
}

interface BreakState {
  hypotheses: readonly Hypothesis[];
  /** Ids the widget has a preset for. Others are shown, but inert. */
  wired: readonly string[];
  activeId: string | null;
  select: (id: string) => void;
  reset: () => void;
}

const BreakContext = createContext<BreakState | null>(null);

export function useBreak(): BreakState {
  const state = useContext(BreakContext);
  if (!state) throw new Error('BreakChips must be rendered inside an ExploreShell.');
  return state;
}

export interface ExploreShellProps<P extends object> extends WidgetHostProps {
  /** The well-behaved case: parameters for which the claim looks true. */
  initial: P;
  /**
   * Hypothesis id → parameters that violate it. Keys must cover every
   * hypothesis id in the frontmatter; a test enforces that, so a hypothesis can
   * never quietly become a chip that does nothing.
   */
  presets: Readonly<Record<string, P>>;
  children: (params: P, setParams: (patch: Partial<P>) => void) => ReactNode;
}

/**
 * The state behind every interactive panel on a module page.
 *
 * One parameter object for the whole widget, so that a "break it" chip in any
 * panel can move any control: the hypotheses are conditions on the whole
 * situation, not on one chart. Hand-editing a control leaves the canned
 * violation, which is why `setParams` clears the active chip.
 */
export function ExploreShell<P extends object>({
  hypotheses,
  initial,
  presets,
  children,
}: ExploreShellProps<P>) {
  const [params, setParamsState] = useState<P>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  const setParams = (patch: Partial<P>) => {
    setParamsState((current) => ({ ...current, ...patch }));
    setActiveId(null);
  };

  const select = (id: string) => {
    const preset = presets[id];
    if (!preset) return;
    setParamsState(preset);
    setActiveId(id);
  };

  const reset = () => {
    setParamsState(initial);
    setActiveId(null);
  };

  const wired = hypotheses.filter((h) => h.id in presets).map((h) => h.id);

  return (
    <BreakContext.Provider value={{ hypotheses, wired, activeId, select, reset }}>
      <div className="explore">{children(params, setParams)}</div>
    </BreakContext.Provider>
  );
}
