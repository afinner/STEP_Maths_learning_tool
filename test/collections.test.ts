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
    expect(published.map((e) => e.id)).toEqual(['older', 'newest']);
  });

  it('keeps drafts when they are asked for, still oldest first', () => {
    const published = publishedModules(entries, { includeDrafts: true });
    expect(published.map((e) => e.id)).toEqual(['older', 'in-progress', 'newest']);
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
    summary: 'one line',
    hypotheses: [{ id: 'h', label: 'l', statement: 's', violatedBy: 'v' }],
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

  it('is optional, alongside the featured question a draft may not have yet', () => {
    const optional = Object.entries(moduleSchema.shape)
      .filter(([, field]) => field.isOptional())
      .map(([name]) => name);
    expect(optional.sort()).toEqual(['draft', 'question']);
  });
});
