import { createWidgetIsland, type WidgetModule } from './createWidgetIsland';

/**
 * Fixture widgets, kept in a separate island from the real ones. The fixtures
 * route emits no pages unless INCLUDE_FIXTURES=1, so in a production build this
 * module is never referenced and no fixture code reaches the client bundle.
 */
const widgets = import.meta.glob<WidgetModule>('/src/fixtures/*/widget.tsx', {
  eager: true,
});

export default createWidgetIsland(widgets);
