import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { moduleSchema } from './schema';

/**
 * Two collections, one schema.
 *
 * `modules` is the site. `fixtures` is the verification harness: it is loaded
 * and validated on every build, but its pages are only emitted when
 * INCLUDE_FIXTURES=1 and it never appears in the index. Validating it always
 * means a schema regression is caught by a plain `npm run build`.
 */
const modules = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/modules' }),
  schema: moduleSchema,
});

const fixtures = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/fixtures' }),
  schema: moduleSchema,
});

export const collections = { modules, fixtures };
