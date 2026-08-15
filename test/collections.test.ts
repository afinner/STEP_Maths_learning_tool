import { describe, expect, it } from 'vitest';
import { publishedModules } from '../src/lib/collections';
import { moduleSchema } from '../src/schema';

/**
 * Drafts must not reach the live site. A module can take several sessions to
 * build, and a half-finished one on the index is the single thing the catalogue
 * cannot afford to look like.
 */

const entry = (id: string, added: string, draft = false) => ({
  id,
  data: { draft, added: new Date(added) },
});

describe('publishedModules', () => {
  const entries = [
    entry('older', '2026-01-01'),
    entry('newest', '2026-08-01'),
    entry('in-progress', '2026-06-01', true),
  ];

  it('drops drafts from the published site', () => {
    const published = publishedModules(entries, { includeDrafts: false });
    expect(published.map((e) => e.id)).toEqual(['newest', 'older']);
  });

  it('keeps drafts when they are asked for, still newest first', () => {
    const published = publishedModules(entries, { includeDrafts: true });
    expect(published.map((e) => e.id)).toEqual(['newest', 'in-progress', 'older']);
  });

  it('does not mutate what it was given', () => {
    const original = [...entries];
    publishedModules(entries, { includeDrafts: true });
    expect(entries).toEqual(original);
  });
});

describe('the draft field', () => {
  const base = {
    id: 'x',
    title: 'X',
    claim: 'c',
    context: 'general',
    hypotheses: [{ id: 'h', statement: 's', violatedBy: 'v' }],
    predictionPrompt: 'p',
    decisiveQuantity: { symbol: 's', name: 'n', description: 'd' },
    repairedIntuition: 'r',
    boundary: 'b',
    provenance: 'p',
    added: '2026-01-01',
  };

  it('defaults to published when omitted', () => {
    const parsed = moduleSchema.parse(base);
    expect(parsed.draft).toBe(false);
  });

  it('is the only optional field in the schema', () => {
    const optional = Object.entries(moduleSchema.shape)
      .filter(([, field]) => field.isOptional())
      .map(([name]) => name);
    expect(optional).toEqual(['draft']);
  });
});
