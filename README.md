# Failure modes

An interactive catalogue of specific false beliefs in mathematical reasoning.

Each module names one false belief, gives a concrete case where it produces a
wrong answer, and identifies the single quantity that decides when it fails. It
is a reference, not a course: it is complete at any size, and it grows slowly.

**Live site:** https://afinner.github.io/STEP_Maths_learning_tool/

## Working on it

```bash
nvm use          # Node version is pinned in .nvmrc
npm install
npm run dev      # dev server, fixtures and drafts included
npm test         # unit tests and the module contract
npm run build    # production build — validates every module
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server, including fixtures and draft modules. |
| `npm run build` | Production build to `dist/`. Fails on any schema violation. |
| `npm run build:preview` | Production build with fixtures and drafts emitted, for checking them in built form. |
| `npm run preview` | Serve `dist/` locally. |
| `npm test` | Vitest: compute functions plus the per-module contract. |
| `npm run check` | Astro/TypeScript diagnostics. |

**Adding a module: see [CONTRIBUTING.md](CONTRIBUTING.md).** That file is the
spec — one directory, four files, no other changes.

## How it fits together

| Path | What lives there |
| --- | --- |
| `src/schema.ts` | The module schema. One Zod object, used by every collection. |
| `src/content/modules/<id>/` | One module: `index.md`, `widget.tsx`, `compute.ts`, `compute.test.ts`. |
| `src/fixtures/<id>/` | The verification harness. Validated on every build, never published. |
| `src/lib/collections.ts` | Which modules are published, and in what order. Drafts are excluded here. |
| `src/layouts/ModuleLayout.astro` | The six beats, in fixed order, for every module. |
| `src/components/ModuleShell.tsx` | Commit gate, parameter state, hypothesis ledger. |
| `src/components/commit/` | The commit gate as a pure reducer, plus its UI. |
| `src/components/measure/` | Auto-marked measurement items. |
| `src/lib/events.ts` | Learner-event shapes and the in-memory log. No persistence. |
| `src/components/charts/` | Line chart, number line, running value. Built on d3-scale and d3-shape. |
| `src/styles/tokens.css` | Every colour, size and spacing value in the site. |

Astro with TypeScript in strict mode; React for the interactive islands; KaTeX
rendered at build time, so no maths typesetting runs in the browser. Deployed to
GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

Because the site is served from a subpath, internal links go through
`withBase()` in `src/lib/base.ts`. A bare `/foo` will work in dev and 404 in
production.

## Licence

Code is [MIT](LICENSE). Module content — the prose, frontmatter and derivations
under `src/content/modules/**/index.md` — is
[CC BY 4.0](LICENSE-CONTENT).
