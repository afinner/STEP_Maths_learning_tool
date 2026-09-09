/**
 * What a figure fixed that the argument then relied on.
 *
 * A second shared vocabulary beside `amplifiers.ts`, on a different axis. That
 * one names how a discarded term comes back; this one names which fact a
 * drawing quietly settled — a betweenness, an existence, a shape — so that a
 * bank can sort by the thing the reader has to learn to notice rather than by
 * the topic the question happens to be about.
 *
 * A module's bank sorts by one of the two vocabularies, not both: they answer
 * different questions, and a question filed under a mechanism and a figure fact
 * at once is really two entries.
 */

export type FigureFact =
  /** Which side of a point another point falls on. */
  | 'betweenness'
  /** Something the method needs to exist, or to be finite, and might not be. */
  | 'existence'
  /** A general object drawn in a special position. */
  | 'shape'
  /** A case the drawing cannot show at all, because it collapses the picture. */
  | 'degeneracy'
  /** One value of a parameter, standing in for a range of them. */
  | 'exemplar'
  /** A property read off the picture and then used as if it had been proved. */
  | 'imported-property';

export const FIGURE_FACTS: readonly FigureFact[] = [
  'betweenness',
  'existence',
  'shape',
  'degeneracy',
  'exemplar',
  'imported-property',
];

export const FIGURE_FACT_NAMES: Readonly<Record<FigureFact, string>> = {
  betweenness: 'Betweenness',
  existence: 'Existence',
  shape: 'Shape',
  degeneracy: 'Degeneracy',
  exemplar: 'Exemplar',
  'imported-property': 'Imported property',
};

export const FIGURE_FACT_DESCRIPTIONS: Readonly<Record<FigureFact, string>> = {
  betweenness:
    'The drawing settled which side of a point another point falls on, and the argument then added or subtracted as though that were given.',
  existence:
    'The method needs a quantity to exist, or to be finite, and the figure is drawn in the position where it is.',
  shape:
    'A general object was drawn in a special position — convex, symmetric, acute — and the proof used the position.',
  degeneracy:
    'A case that collapses the picture cannot be drawn alongside it, so it is left out of the reasoning as well.',
  exemplar:
    'One value of a parameter was drawn, and the conclusion read off it was taken to hold across the range.',
  'imported-property':
    'A property visible in the picture was used in the proof without ever being derived from the definitions given.',
};
