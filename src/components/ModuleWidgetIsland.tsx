import { createWidgetIsland, type WidgetModule } from './createWidgetIsland';

/** Every real module's widget. Adding a module directory is enough to register it. */
const widgets = import.meta.glob<WidgetModule>('/src/content/modules/*/widget.tsx', {
  eager: true,
});

export default createWidgetIsland(widgets);
