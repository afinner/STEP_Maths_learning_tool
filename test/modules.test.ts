import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { moduleSchema } from '../src/schema';

/**
 * The contract every module must satisfy, checked for real modules and the
 * fixture alike.
 *
 * The build enforces most of this too — a schema violation fails `npm run build`
 * — but the build only tells you about the first module it chokes on, and it
 * cannot see inside widget.tsx. These tests can, and they are what stops a
 * hypothesis quietly becoming a button that does nothing.
 */

const ROOTS = ['src/content/modules', 'src/fixtures'] as const;

/** Widget modules, loaded lazily so a broken one fails its own test only. */
const widgetModules = import.meta.glob<{
  default: unknown;
  presets?: Record<string, unknown>;
}>('/src/**/widget.tsx');

interface ModuleDir {
  root: string;
  id: string;
  dir: string;
}

function moduleDirs(): ModuleDir[] {
  const found: ModuleDir[] = [];
  for (const root of ROOTS) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      found.push({ root, id: entry.name, dir: join(root, entry.name) });
    }
  }
  return found;
}

function frontmatterOf(dir: string): unknown {
  const raw = readFileSync(join(dir, 'index.md'), 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) throw new Error(`${dir}/index.md has no frontmatter block`);
  return parseYaml(match[1] as string);
}

const dirs = moduleDirs();

describe('module directories', () => {
  it('finds at least the fixture', () => {
    expect(dirs.length).toBeGreaterThan(0);
  });
});

describe.each(dirs)('$dir', ({ id, dir }) => {
  const parsed = moduleSchema.safeParse(frontmatterOf(dir));

  it('has frontmatter satisfying the module schema', () => {
    expect(parsed.error?.issues ?? []).toEqual([]);
    expect(parsed.success).toBe(true);
  });

  it('declares an id matching its directory name', () => {
    expect(parsed.success && parsed.data.id).toBe(id);
  });

  it('has the four required files', () => {
    for (const file of ['index.md', 'widget.tsx', 'compute.ts', 'compute.test.ts']) {
      expect(existsSync(join(dir, file)), `${dir}/${file} is missing`).toBe(true);
    }
  });

  it('has a widget preset for every hypothesis', async () => {
    if (!parsed.success) throw new Error('frontmatter did not parse');
    const loader = widgetModules[`/${dir}/widget.tsx`];
    expect(loader, `no widget module found at /${dir}/widget.tsx`).toBeDefined();

    const widget = await loader!();
    expect(typeof widget.default).toBe('function');

    const presetIds = Object.keys(widget.presets ?? {});
    const hypothesisIds = parsed.data.hypotheses.map((h) => h.id);

    // Every hypothesis is clickable...
    expect(presetIds.sort()).toEqual(hypothesisIds.sort());
  });
});

describe('schema strictness', () => {
  // The fixture is the reference instance: whatever it does, a real module may do.
  const valid = moduleSchema.parse(frontmatterOf('src/fixtures/fixture-module'));
  // Everything except the fields that carry a default — `draft` is the only one.
  const requiredFields = Object.entries(moduleSchema.shape)
    .filter(([, field]) => !field.isOptional())
    .map(([name]) => name);

  it.each(requiredFields)('rejects a module missing %s', (field) => {
    const broken: Record<string, unknown> = structuredClone({
      ...valid,
      added: valid.added.toISOString(),
    });
    delete broken[field];
    expect(moduleSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects an unknown context', () => {
    expect(moduleSchema.safeParse({ ...valid, context: 'STEP 3' }).success).toBe(false);
  });

  it('rejects a module with no hypotheses', () => {
    expect(moduleSchema.safeParse({ ...valid, hypotheses: [] }).success).toBe(false);
  });

  it('rejects a hypothesis missing its violatedBy', () => {
    const broken = {
      ...valid,
      hypotheses: [{ id: 'x', statement: 'something' }],
    };
    expect(moduleSchema.safeParse(broken).success).toBe(false);
  });
});
