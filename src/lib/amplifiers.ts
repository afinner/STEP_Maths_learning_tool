/**
 * Why a dropped term comes back.
 *
 * This vocabulary is deliberately shared rather than owned by one module: the
 * bank is organised by amplifier instead of by topic, and a topic taxonomy
 * teaches surface pattern-matching, which is the habit the catalogue exists to
 * break. Later modules that reuse the vocabulary sort into the same drawers.
 */

export type Amplifier = 'cancellation' | 'multiplication';

export const AMPLIFIERS: readonly Amplifier[] = ['cancellation', 'multiplication'];

export const AMPLIFIER_NAMES: Readonly<Record<Amplifier, string>> = {
  cancellation: 'Cancellation',
  multiplication: 'Multiplication',
};

export const AMPLIFIER_DESCRIPTIONS: Readonly<Record<Amplifier, string>> = {
  cancellation: 'The leading terms subtract away, promoting the error term to the answer.',
  multiplication: 'A small error meets a large factor and arrives back at full size.',
};
