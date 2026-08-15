# Adding a module

A module is one false belief. Adding one means creating one directory with four
files in it and running the build. Nothing else in the repository has to change:
no route, no registry, no navigation entry, no index update.

```
src/content/modules/<module-id>/
  index.md         frontmatter + the Run prose
  widget.tsx       the interactive island
  compute.ts       pure functions — no DOM, no randomness without a seed
  compute.test.ts  tests for the decisive quantity
```

`<module-id>` is kebab-case and must equal the `id` in the frontmatter. It
becomes the URL: `/modules/<module-id>/`.

Copy `src/fixtures/fixture-module/` as a starting point. It is a working module
in miniature and is kept working by the same tests.

---

## Standing rule: examination copyright

**No examination question text appears verbatim anywhere in this repository.**
STEP papers are the copyright of UCLES/OCR, and this applies without exception
to:

- module prose and frontmatter,
- code comments,
- test fixtures, test names and assertion messages,
- commit messages.

Every question a module draws on is **paraphrased into that module's own
framing** and cited by reference. Put the citation in `provenance` — paper, year
and question number, with a link to the official paper where one exists — and
name the mathematical situation rather than quoting the setup.

The rule is about the words, not the mathematics: results, standard identities
and the reasoning are not anyone's copyright, and a module is free to work
through them in its own voice. If a paraphrase is drifting close enough to the
original that the wording matters, that is the signal to change the framing, not
to shorten the quote.

The same applies to any other examination board's material.

---

## 1. `index.md`

### Frontmatter

Every field is required. A missing or malformed field fails `npm run build` —
this is deliberate, and it is checked by a test, so it will not quietly stop
being true. The schema is `src/schema.ts`, which is the authority if this
document and the code ever disagree.

| Field | Type | What goes in it |
| --- | --- | --- |
| `id` | kebab-case string | Must equal the directory name. |
| `title` | string | Short descriptive title. Names the situation, not the belief. |
| `claim` | string | **The false belief, in the learner's own voice.** First person, unhedged, no scare quotes. If it does not sound like something you would actually think, it is not the claim. |
| `context` | `STEP` \| `first-year analysis` \| `general` | Where the belief bites. Add a value to the enum in `src/schema.ts` only when a module genuinely does not fit. |
| `hypotheses` | array of `{ id, statement, violatedBy }` | The conditions the claim silently assumes. See below. |
| `predictionPrompt` | string | What the reader commits to before seeing the result. A question with a small number of possible answers, answerable in five seconds. |
| `decisiveQuantity` | `{ symbol, name, description }` | The one number that settles it. `symbol` is KaTeX (rendered at build time), `name` is human, `description` says which way it has to go for the claim to survive. |
| `repairedIntuition` | string | The corrected mental model — still a picture, not a theorem statement. |
| `boundary` | string | One sentence: when the original move **is** valid. |
| `provenance` | string | What prompted this: the specific paper, question, or lesson. |
| `added` | date `YYYY-MM-DD` | Sorts the index. |

### Hypotheses

Each hypothesis is one condition that can be violated **on its own**:

```yaml
hypotheses:
  - id: terms-stay-bounded          # kebab-case; joins to the widget
    statement: The terms are bounded by a constant independent of n.
    violatedBy: Let the single non-zero term grow with n and the bound is gone.
```

- `statement` is positive — what has to be true, not what goes wrong.
- `violatedBy` is the shape of the counterexample in one sentence.
- `id` must have a matching entry in the widget's exported `presets`. A test
  fails if it does not, so a hypothesis can never become a button that does
  nothing.

### Body

The body supplies the **Run** beat and nothing else: the derivation the reader
follows, in order, up to the point where the claim gets made. Do not write
headings for the six beats — the template owns those, and the other five beats
come from frontmatter and from the widget.

Maths is KaTeX, rendered at build time: `$x^2$` inline, `$$ ... $$` display. No
KaTeX runs in the browser.

---

## 2. `compute.ts`

Pure functions. No DOM, no `Math.random()` without an explicit seed, no imports
from the widget. Export a `Params` interface and a function computing the
decisive quantity from it. Everything the widget displays should be derived
here, so that the tests hold the widget to account and not just the maths.

## 3. `compute.test.ts`

Pin the decisive quantity, and pin the cases where the claim fails. At minimum:

- the decisive quantity is what you say it is in the frontmatter;
- the well-behaved case passes;
- each hypothesis violation shows up in the number.

## 4. `widget.tsx`

Three requirements, all enforced by tests:

1. A default export taking `WidgetHostProps` and rendering a `ModuleShell`.
2. An exported `presets` map with **exactly one entry per hypothesis id**.
3. No maths of its own — numbers come from `compute.ts`.

```tsx
import { RunningValue } from '../../components/charts';
import { ModuleShell, type WidgetHostProps } from '../../components/ModuleShell';
import { decisiveQuantity, type Params } from './compute';

/** The well-behaved case: the claim looks true here. */
const initial: Params = { n: 40, spikeSize: 4 };

/** One entry per hypothesis id, each violating that hypothesis. */
export const presets: Record<string, Params> = {
  'terms-stay-bounded': { n: 40, spikeSize: 400 },
};

export default function Widget(props: WidgetHostProps) {
  return (
    <ModuleShell {...props} initial={initial} presets={presets}>
      {(params, setParams) => (
        <>
          {/* charts and controls */}
        </>
      )}
    </ModuleShell>
  );
}
```

`ModuleShell` owns the prediction gate, the parameter state, and the hypothesis
ledger. It renders the **Break** beat itself, because clicking a hypothesis has
to move the widget above it — that shared state is why the widget and the ledger
are one island.

### Charts

Import from `src/components/charts`. They take data and tokens, never colours:

- `LineChart` — series, optional log axes, shaded `bands`, horizontal `rules`.
- `NumberLine` — shaded `intervals` and `marks` on a line.
- `RunningValue` — a sequence against its index with the value it is supposedly
  approaching. Most modules want this one.

All three take a required `ariaLabel` describing what the chart shows, including
the current numbers. Controls are native `<input>` elements, so they are
keyboard-accessible without effort; keep it that way.

### Styling

Use the existing class names — `.controls`, `.control`, `.widget-readout`,
`.button` — from `src/styles/global.css`. If you need a new colour or spacing
value, add a token to `src/styles/tokens.css`. No literal colours or pixel
values in components: replacing that one file must be enough to restyle the
site.

---

## The six beats

The template renders them in this fixed order for every module:

| Beat | Comes from |
| --- | --- |
| Claim | `claim` |
| Run | body markdown, then the widget |
| Break | the hypothesis ledger, rendered by `ModuleShell` |
| Repair | `repairedIntuition` |
| Boundary | `boundary` |
| Bank | `decisiveQuantity`, `boundary`, `provenance`, `added` |

A module cannot reorder them, and should not try to reproduce a beat in the body
prose.

---

## Before you commit

```bash
npm test && npm run build
```

`npm run build` validates every module's frontmatter, including fixtures. `npm
test` checks the file set, that `id` matches the directory, and that presets
cover the hypotheses.

To look at it:

```bash
npm run dev
```

The dev server includes fixtures at `/fixtures/<id>/`; the production build does
not emit them.

### Things that will fail the build

- A missing or misspelled frontmatter field → `InvalidContentEntryDataError`,
  naming the field.
- A `context` outside the enum.
- A module directory without `widget.tsx` → the island throws with the path.
- A hypothesis with no matching preset → `npm test` fails (the build will not
  catch this one).

---

## The fixture

`src/fixtures/fixture-module/` exists to prove the pipeline works. It is
validated on every build, rendered in dev, and excluded from the production
site and the index. Keep it working; it is the reference implementation of
everything above. It is not content and should never read as if it were.
