/**
 * Number formatting shared by modules.
 *
 * Kept out of src/lib/format.ts, which pulls in KaTeX for build-time rendering:
 * anything an island imports has to stay free of a typesetting library.
 */

/**
 * Fixed-decimal rendering, so a column of numbers lines up and can be compared.
 *
 * A value that rounds to zero is shown as zero, without a sign — floats produce
 * -1.2e-16 in places where the answer is zero, and "-0.000" reads as a quantity
 * that is slightly negative rather than one that is zero.
 */
export function formatFixed(value: number, decimals: number): string {
  const text = value.toFixed(decimals);
  return /^-0(\.0+)?$/.test(text) ? text.slice(1) : text;
}
