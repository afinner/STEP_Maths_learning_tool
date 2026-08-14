import type { ComponentType } from 'react';
import type { WidgetHostProps } from './ModuleShell';

export type WidgetModule = { default: ComponentType<WidgetHostProps> };

export interface WidgetIslandProps extends WidgetHostProps {
  /** Absolute project path of the widget, e.g. '/src/content/modules/foo/widget.tsx'. */
  widgetPath: string;
}

/**
 * Why this indirection exists.
 *
 * Astro resolves a client island's script URL from the static imports of the
 * .astro file, so a component looked up at runtime and passed in as a prop
 * cannot be hydrated — the build fails with NoMatchingImport. The page template
 * therefore imports one island statically and passes the widget's *path*, which
 * is a plain serialisable string; the island does the lookup itself.
 *
 * The consequence to know about: the glob is eager, so every module's widget
 * ends up in one client chunk shared by all module pages. That is the price of
 * a single dynamic route, and it is the right trade at this size — widgets are
 * a few kB of pure functions each, and the alternative is a hand-written page
 * file per module. If the catalogue ever grows to where that chunk is felt,
 * the fix is to generate one route file per module and import its widget
 * directly; nothing in the module format has to change.
 */
export function createWidgetIsland(widgets: Record<string, WidgetModule>) {
  return function WidgetIsland({ widgetPath, ...host }: WidgetIslandProps) {
    const module = widgets[widgetPath];
    if (!module) {
      throw new Error(
        `No widget found at ${widgetPath}. Every module needs a widget.tsx next to its index.md — see CONTRIBUTING.md.`,
      );
    }
    const Widget = module.default;
    return <Widget {...host} />;
  };
}
