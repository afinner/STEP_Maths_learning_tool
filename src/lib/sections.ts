import type { MarkdownInstance } from 'astro';

/**
 * The four markdown sections a module carries beside index.md.
 *
 * index.md is the collection entry — frontmatter plus the hook — and the rest of
 * the page is prose too heavy in maths to live anywhere but markdown, where
 * KaTeX runs at build time. Each file is one section, rendered by the template
 * in fixed order; a module cannot reorder them and does not have to wire them.
 *
 * Every file is optional here so that a draft can be built up one section at a
 * time in `npm run dev`. The contract test requires all four before a module
 * can leave draft.
 */
export const SECTION_NAMES = ['explain', 'question', 'solution', 'bank'] as const;
export type SectionName = (typeof SECTION_NAMES)[number];

type MarkdownSection = MarkdownInstance<Record<string, unknown>>;

export type Sections = Partial<Record<SectionName, MarkdownSection['Content']>>;

const moduleFiles = import.meta.glob<MarkdownSection>(
  '/src/content/modules/*/{explain,question,solution,bank}.md',
  { eager: true },
);

const fixtureFiles = import.meta.glob<MarkdownSection>(
  '/src/fixtures/*/{explain,question,solution,bank}.md',
  { eager: true },
);

function collect(files: Record<string, MarkdownSection>, dir: string): Sections {
  const found: Sections = {};
  for (const name of SECTION_NAMES) {
    const file = files[`${dir}/${name}.md`];
    if (file) found[name] = file.Content;
  }
  return found;
}

export function moduleSections(id: string): Sections {
  return collect(moduleFiles, `/src/content/modules/${id}`);
}

export function fixtureSections(id: string): Sections {
  return collect(fixtureFiles, `/src/fixtures/${id}`);
}
