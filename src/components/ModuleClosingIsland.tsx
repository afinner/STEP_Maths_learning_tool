import { createWidgetIsland, type WidgetModule } from './createWidgetIsland';

/**
 * The optional second island: whatever a module wants to say after the Bank
 * beat — a bank of questions to work, or items that measure whether the
 * mechanism landed. Modules without a closing.tsx render nothing here.
 */
const closings = import.meta.glob<WidgetModule>('/src/content/modules/*/closing.tsx', {
  eager: true,
});

export default createWidgetIsland(closings, { optional: true });
