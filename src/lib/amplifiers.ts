/**
 * Why a step that looks safe changes the answer.
 *
 * This vocabulary is deliberately shared rather than owned by one module: banks
 * are organised by mechanism instead of by topic, and a topic taxonomy teaches
 * surface pattern-matching, which is the habit the catalogue exists to break.
 * Modules that reuse a mechanism sort into the same drawer.
 */

export type Amplifier =
  /** Leading terms subtract away, promoting the error term to the answer. */
  | 'cancellation'
  /** A small error meets a large factor and arrives back at full size. */
  | 'multiplication'
  /** The step reverses the order it was supposed to preserve. */
  | 'sign-reversal'
  /** The step changes where the statement is defined, silently. */
  | 'domain-loss';

export const AMPLIFIERS: readonly Amplifier[] = [
  'cancellation',
  'multiplication',
  'sign-reversal',
  'domain-loss',
];

export const AMPLIFIER_NAMES: Readonly<Record<Amplifier, string>> = {
  cancellation: 'Cancellation',
  multiplication: 'Multiplication',
  'sign-reversal': 'Sign reversal',
  'domain-loss': 'Domain loss',
};

export const AMPLIFIER_DESCRIPTIONS: Readonly<Record<Amplifier, string>> = {
  cancellation: 'The leading terms subtract away, promoting the error term to the answer.',
  multiplication: 'A small error meets a large factor and arrives back at full size.',
  'sign-reversal':
    'The step is order-preserving in one place and order-reversing in another, so the inequality quietly turns round.',
  'domain-loss':
    'The step changes where the statement is defined, so the two sides are no longer being asked about the same values.',
};
