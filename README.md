# Failure modes

Interactive modules built from the maths concepts I found I had only half
understood while working STEP questions.

Each one names a single belief — the kind that is close enough to right to
survive every question until one is built on the place it fails — and then
lets you measure exactly where it fails. Every module has the same five parts,
in the same order:

| | Section | What it is |
| --- | --- | --- |
| 01 | **Hook** | A short example where the belief gives a wrong answer, ending where the belief is stated. |
| 02 | **Explore** | Sliders, plots and constructions that measure the quantity that decides it. |
| 03 | **Why** | The mathematics, argued properly, with a repaired picture and the boundary of the move. |
| 04 | **STEP** | The question it was learned from, paraphrased, with a solution that uses the ideas above. |
| 05 | **Bank** | More questions with the same mechanism, and a few problems to do in your head. |

It is a reference, not a course: nothing is marked, scored or timed. It is
complete at any size, and it grows slowly.

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
spec — one directory, eight files, no other changes.

## How it fits together

| Path | What lives there |
| --- | --- |
| `src/schema.ts` | The module schema. One Zod object, used by every collection. |
| `src/content/modules/<id>/` | One module: frontmatter and hook, four markdown sections, a widget, its maths and its tests. |
| `src/fixtures/<id>/` | The verification harness. Validated on every build, never published. |
| `src/lib/collections.ts` | Which modules are published, and in what order. Drafts are excluded here. |
| `src/lib/sections.ts` | Loads a module's markdown sections beside its index.md. |
| `src/layouts/ModuleLayout.astro` | The five sections, in fixed order, for every module. |
| `src/components/explore/` | The interactive shell: parameter state, panels, controls, readouts and the "break it" chips. |
| `src/components/charts/` | Line chart, number line, running value. Built on d3-scale and d3-shape. |
| `src/lib/numbers.ts` | Number formatting shared by modules, free of KaTeX so islands can import it. |
| `src/styles/tokens.css` | Every colour, size and spacing value in the site. |

Astro with TypeScript in strict mode; React for the interactive islands; KaTeX
rendered at build time, so no maths typesetting runs in the browser. Deployed to
GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

Because the site is served from a subpath, internal links go through
`withBase()` in `src/lib/base.ts`. A bare `/foo` will work in dev and 404 in
production.

## Licence

Code is [MIT](LICENSE). Module content — the prose, frontmatter and derivations
under `src/content/modules/**/*.md` — is [CC BY 4.0](LICENSE-CONTENT). STEP
questions are the copyright of their examining board and are paraphrased, never
reproduced.
