/**
 * The site is served from a subpath on GitHub Pages, so no internal href may be
 * written as a bare root-relative path. Everything goes through here.
 *
 * `import.meta.env.BASE_URL` is whatever `base` in astro.config.mjs says, always
 * with a trailing slash. Moving to a custom domain then means changing one line
 * of config and nothing else.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

/** Canonical URL for a module page, given its collection id. */
export function modulePath(id: string): string {
  return withBase(`/modules/${id}/`);
}

/** Fixture pages live under their own prefix and are never linked from the site. */
export function fixturePath(id: string): string {
  return withBase(`/fixtures/${id}/`);
}
