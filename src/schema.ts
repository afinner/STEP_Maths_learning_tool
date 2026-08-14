import { z } from 'zod';

/**
 * The module schema. One definition, used by every collection.
 *
 * Both the real `modules` collection and the `fixtures` collection are built
 * from this exact object, so the fixture proves the same validation the real
 * content is held to. Every field here is required: a module missing any one of
 * them fails `npm run build`, by design. See CONTRIBUTING.md.
 */

/** Where the false belief actually bites the reader. */
export const CONTEXTS = ['STEP', 'first-year analysis', 'general'] as const;

/**
 * A condition the claim silently assumes.
 *
 * `id` is the join key to the widget: every hypothesis id must have a matching
 * entry in the module widget's exported `presets` map, so clicking the
 * hypothesis can drive the widget into a state that violates it. That pairing
 * is enforced by test, not by the type system — see CONTRIBUTING.md.
 */
export const hypothesisSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'hypothesis id must be kebab-case: [a-z0-9-]'),
  /** The assumption, stated positively — what has to be true for the claim to hold. */
  statement: z.string().min(1),
  /** What breaks it: the shape of a counterexample, in prose. */
  violatedBy: z.string().min(1),
});

/** The one number that settles whether the claim holds. */
export const decisiveQuantitySchema = z.object({
  /** Rendered as inline maths, so KaTeX syntax is expected here: '\\sup_n |f_n - f|'. */
  symbol: z.string().min(1),
  /** Short human name, e.g. 'uniform distance'. */
  name: z.string().min(1),
  /** What it measures and which way it has to go for the claim to survive. */
  description: z.string().min(1),
});

export const moduleSchema = z.object({
  /** Must equal the module's directory name. Enforced by test. */
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'module id must be kebab-case: [a-z0-9-]'),
  title: z.string().min(1),
  /** The false belief, in the learner's own voice. First person, unhedged. */
  claim: z.string().min(1),
  context: z.enum(CONTEXTS),
  hypotheses: z.array(hypothesisSchema).min(1),
  /** What the reader commits to before the widget shows its result. */
  predictionPrompt: z.string().min(1),
  decisiveQuantity: decisiveQuantitySchema,
  /** The corrected mental model — still intuitive, not a restatement of the theorem. */
  repairedIntuition: z.string().min(1),
  /** One sentence: when the original move IS valid. */
  boundary: z.string().min(1),
  /** What prompted this module: a specific paper, question, or lesson. */
  provenance: z.string().min(1),
  added: z.coerce.date(),
});

export type ModuleFrontmatter = z.infer<typeof moduleSchema>;
export type Hypothesis = z.infer<typeof hypothesisSchema>;
export type DecisiveQuantity = z.infer<typeof decisiveQuantitySchema>;
export type ModuleContext = (typeof CONTEXTS)[number];
