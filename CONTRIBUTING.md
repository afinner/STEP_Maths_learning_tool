# Adding a module

A module is one false belief — one that held up until a question was built on
the place it fails. Adding one means creating one directory with eight files in
it and running the build. Nothing else in the repository has to change: no
route, no registry, no navigation entry, no index update.

```
src/content/modules/<module-id>/
  index.md         frontmatter + the Hook
  explain.md       the Why: the mathematics, argued properly
  question.md      the STEP question, paraphrased
  solution.md      its solution, referring back to the ideas above
  bank.md          the Bank: more questions and a few problems
  widget.tsx       the Explore section: the interactive panels
  compute.ts       pure functions — no DOM, no randomness without a seed
  compute.test.ts  tests for the decisive quantity

  *.tsx            optional: module-local figures used by widget.tsx
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

- module prose and frontmatter, including `question.md`,
- code comments,
- test fixtures, test names and assertion messages,
- commit messages.

Every question a module draws on is **paraphrased into that module's own
framing** and cited by reference. The featured question in `question.md` is
written in this site's words: the same mathematics, never the paper's wording,
and the page says so beside the citation. Put the citation in the `question`
frontmatter field — paper, year and question number — with a link and a
description of what is behind it.

Where a citation carries a link, **say what is behind it**. A link to an
official past paper and a link to a worked paper containing full solutions are
different objects, and a reader following a link to work a question needs to
know which one they are about to open. The STEP question database entry —
`https://step.maths.org/questions/<code>`, with codes like `04-s2-q2` — is
usually the right target for older papers: it carries the paper and links onward
to solutions without putting the answer one click from the question. Recent
papers are not in the database; the STEP Support Programme's worked papers are,
and they carry full solutions, so the module must say so. Check each link
resolves before shipping it.

Cite only what you can describe. The rule is about the words, not the
mathematics: results, standard identities and the reasoning are not anyone's
copyright, and a module is free to work through them in its own voice.

---

## The five sections

The template renders them in this fixed order for every module. A module cannot
reorder them and should not reproduce one section inside another.

| | Section | Comes from | What goes in it |
| --- | --- | --- | --- |
| 01 | Hook | body of `index.md`, then `claim` | A short example where the belief gives a wrong answer. It comes **before** the belief is stated: a claim in the abstract loses the reader. Ideally under 150 words plus one displayed equation and, if useful, a small table. |
| 02 | Explore | `widget.tsx`, with `decisiveQuantity` and `hypotheses` from frontmatter | Interactive panels. This is what separates the site from a textbook: graphs, sliders, constructions, counterexamples, and a readout of the quantity that decides the belief. |
| 03 | Why | `explain.md`, then `repairedIntuition` and `boundary` | The mathematics, argued properly: annotated derivations, equations, static figures. Rigorous without being pedantic. |
| 04 | STEP | `question` frontmatter, `question.md`, `solution.md` | The STEP question that fits best, paraphrased, and a solution folded away underneath that refers back to the ideas above. |
| 05 | Bank | `bank.md`, then `provenance` | More questions with the same mechanism, each a link and one line, plus a few problems with answers folded away. |

Nothing anywhere asks the reader to commit to an answer, rate their confidence,
or record how a question went. This is a reference for curious people, not an
exercise; a test fails if a module asks for a commitment.

---

## 1. `index.md`

### Frontmatter

Every field except `question` and `draft` is required, and `question` is
required to publish. A missing or malformed field fails `npm run build` — this
is deliberate, and it is checked by a test, so it will not quietly stop being
true. The schema is `src/schema.ts`, which is the authority if this document
and the code ever disagree.

| Field | Type | What goes in it |
| --- | --- | --- |
| `id` | kebab-case string | Must equal the directory name. |
| `title` | string | Short descriptive title. Names the situation, not the belief. |
| `summary` | string | One line naming the situation, for the index card and the page header. |
| `claim` | string | **The false belief, in the learner's own voice.** First person, unhedged, no scare quotes. |
| `context` | `STEP` \| `first-year analysis` \| `general` | Where the belief bites. |
| `hypotheses` | array of `{ id, label, statement, violatedBy }` | The conditions the claim silently assumes. See below. |
| `decisiveQuantity` | `{ symbol, name, description }` | The one number that settles it. `symbol` is KaTeX (rendered at build time), `name` is human, `description` says which way it has to go for the claim to survive. |
| `repairedIntuition` | string | The corrected mental model — still a picture, not a theorem statement. |
| `boundary` | string | One sentence: when the original move **is** valid. |
| `question` | `{ citation, link, behind }` | The featured STEP question: its citation, a link, and what the link opens. Optional only while `draft: true`. |
| `provenance` | string | What prompted this: the specific paper, question, or lesson where the belief showed itself. |
| `added` | date `YYYY-MM-DD` | Sorts the index. |
| `draft` | boolean, optional | `true` while the module is being built. Omit it entirely once published. |

### Hypotheses

Each hypothesis is one condition that can be violated **on its own**, and each
becomes a "break it" chip in the Explore section:

```yaml
hypotheses:
  - id: terms-stay-bounded          # kebab-case; joins to the widget
    label: Grow the spike           # the chip's text: an action, a few words
    statement: The terms are bounded by a constant independent of n.
    violatedBy: Let the single non-zero term grow with n and the bound is gone.
```

- `label` is what the chip says. An action the reader can picture, at most 40
  characters.
- `statement` is positive — what has to be true, not what goes wrong.
- `violatedBy` is the shape of the counterexample in one sentence. It is shown
  once the chip is pressed.
- `id` must have a matching entry in the widget's exported `presets`. A test
  fails if it does not, so a hypothesis can never become a chip that does
  nothing.

### Drafts

A module that will take more than one sitting starts with `draft: true`. Drafts
are validated by the schema and rendered by `npm run dev`, but the production
build emits no page for them and the index does not list them, so nothing
half-finished can reach the live site. A draft may be missing its section files
and its `question`; the contract test requires both before the line is deleted.

### Body

The body is the **Hook**. Maths is KaTeX, rendered at build time: `$x^2$`
inline, `$$ ... $$` display. No KaTeX runs in the browser. Do not write
headings; the template owns the section headings.

---

## 2. `explain.md`, `question.md`, `solution.md`, `bank.md`

Plain markdown with KaTeX, each rendered into its section by the template. Use
`###` headings inside `explain.md` and `bank.md` for sub-structure; the section
heading itself belongs to the template.

- `question.md` carries only the question, in this site's words. The citation
  and the link come from frontmatter.
- `solution.md` is folded away under the question. Refer back to the panels and
  the ideas in Why by name, so a reader sees the mechanism doing work.
- `bank.md` is a list of questions, each a link and one line, grouped by
  mechanism rather than by topic. A problem with an answer uses a
  `<details><summary>Answer</summary>` block with a blank line after the
  summary, so the answer is still markdown.

---

## 3. `compute.ts`

Pure functions. No DOM, no `Math.random()` without an explicit seed, no imports
from the widget. Export the parameters' shape and functions computing the
reference result, the approximation and the decisive quantity from it.
Mathematical truth belongs here. Presentational copy and layout do not.

## 4. `compute.test.ts`

Pin the decisive quantity, and pin the cases where the claim fails. At minimum:

- the decisive quantity is what you say it is in the frontmatter;
- the well-behaved case passes;
- each hypothesis violation shows up in the number;
- any number that appears as a literal in the markdown (a table in the hook,
  say) is pinned against the computation, so the page cannot drift.

## 5. `widget.tsx`

Three requirements, all enforced by tests:

1. A default export taking `WidgetHostProps` and rendering an `ExploreShell`.
2. An exported `presets` map with **exactly one entry per hypothesis id**.
3. No maths of its own — numbers come from `compute.ts`.

```tsx
import { LineChart } from '../../../components/charts';
import {
  BreakChips, Choice, Controls, ExploreShell, Panel, Readout, Slider,
  type WidgetHostProps,
} from '../../../components/explore';
import { decisiveQuantity, type Params } from './compute';

/** The well-behaved case: the claim looks true here. */
const initial: Params = { n: 40, spikeSize: 4 };

/** One entry per hypothesis id, each violating that hypothesis. */
export const presets: Record<string, Params> = {
  'terms-stay-bounded': { n: 40, spikeSize: 400 },
};

export default function Widget(props: WidgetHostProps) {
  return (
    <ExploreShell {...props} initial={initial} presets={presets}>
      {(params, setParams) => (
        <Panel id="mean-panel" title="The running mean" lead="Drag n out.">
          {/* a chart */}
          <Controls>{/* Slider, Choice, Select */}</Controls>
          <Readout items={[{ term: 's / n', value: '…', tone: 'decisive' }]} />
          <BreakChips />
        </Panel>
      )}
    </ExploreShell>
  );
}
```

`ExploreShell` owns one parameter object for the whole widget and the
"break it" chips. A widget is one or more `Panel`s; each panel is one idea — a
picture, its controls, and a `Readout` of the numbers, with the decisive
quantity given the `decisive` tone. `BreakChips` can go in any panel, and
`only={[...]}` restricts it to the hypotheses that panel's controls can violate.

Controls are native `<input>` and `<button>` elements, so they are
keyboard-accessible without effort; keep it that way. Where a control has to
land exactly on a special point (a pole, a cusp, zero), carry an integer and
convert in `compute.ts`.

### Charts

Import from `src/components/charts`. They take data and tokens, never colours:

- `LineChart` — series, optional log axes, shaded `bands`, horizontal `rules`,
  vertical `guides`, marked `points`. Non-finite values break the line.
- `NumberLine` — several sets on one line, one `row` each, with arrowheads at
  clipped ends.
- `RunningValue` — a sequence against its index with the value it is supposedly
  approaching.

All three take a required `ariaLabel` describing what the chart shows, including
the current numbers. A figure the shared charts cannot draw (a rolling circle,
say) is a module-local `.tsx` file beside the widget.

### Styling

**Never apply `text-transform: uppercase` to anything that can contain a
variable** — a label, a caption, an axis title, a table header. Uppercasing
turns ρ into Ρ and O(α) into O(Α), which are different symbols.

Use the existing class names from `src/styles/global.css`. If you need a new
colour or spacing value, add a token to `src/styles/tokens.css`. No literal
colours or pixel values in components: replacing that one file must be enough
to restyle the site.

---

## Before you commit

```bash
npm test && npm run check && npm run build
```

`npm run build` validates every module's frontmatter, including fixtures. `npm
test` checks the file set, that `id` matches the directory, that presets cover
the hypotheses, and that nothing asks for a commitment.

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
- A published module missing a section file or its `question` → `npm test`
  fails.

---

## The fixture

`src/fixtures/fixture-module/` exists to prove the pipeline works. It is
validated on every build, rendered in dev, and excluded from the production
site and the index. Keep it working; it is the reference implementation of
everything above. It is not content and should never read as if it were.
