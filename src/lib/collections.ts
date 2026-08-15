/**
 * Which modules are part of the site, and in what order.
 *
 * Drafts are modules under construction: validated by the schema and rendered in
 * `npm run dev`, but never emitted by a production build and never listed in the
 * index. A module being built over several sessions therefore cannot appear
 * half-finished on the live site, which is the one thing the catalogue must not
 * do — a small site is fine, a site that looks unfinished is not.
 */

export interface PublishableEntry {
  data: { draft: boolean; added: Date };
}

/** Drafts are shown by `npm run dev` and `npm run build:preview`, nowhere else. */
export function includeDrafts(): boolean {
  return process.env.INCLUDE_DRAFTS === '1';
}

/**
 * Newest first: the catalogue is a record of what has been worked out, in order.
 * Pure, so the rule is testable without building the site.
 */
export function publishedModules<T extends PublishableEntry>(
  entries: readonly T[],
  options: { includeDrafts: boolean },
): T[] {
  return entries
    .filter((entry) => options.includeDrafts || !entry.data.draft)
    .sort((a, b) => b.data.added.getTime() - a.data.added.getTime());
}
