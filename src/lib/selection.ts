/**
 * One canonical form for a set of selected option ids.
 *
 * A multiple-choice answer and the key it is marked against are built in two
 * different files, and they only agree if they are ordered the same way. They
 * were not: the widget joined ids with a default lexicographic sort while a
 * module built its key with a numeric one, so selecting 90 and 270 produced
 * "270,90" against a key of "90,270" and the item could not be answered
 * correctly. Both sides now call this.
 */
export function canonicalSelection(ids: readonly string[]): string {
  return [...ids].sort().join(',');
}
