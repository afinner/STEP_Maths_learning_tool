import katex from 'katex';

/**
 * Frontmatter is plain strings, but some of those strings are maths — the
 * decisive quantity's symbol above all. Rendering it here, at build time, means
 * KaTeX never ships to the browser: the pages carry finished markup.
 */
export function renderMath(tex: string, display = false): string {
  return katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    output: 'html',
    strict: 'ignore',
  });
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Dates are authored as plain YAML dates; read them as UTC so they never shift. */
export function formatDate(date: Date): string {
  return DATE_FORMAT.format(date);
}

/** Machine-readable form for <time datetime="...">. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
