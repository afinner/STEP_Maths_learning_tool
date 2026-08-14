// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * The site is served from a GitHub Pages project subpath, so `base` is not '/'.
 * Every internal link and asset must go through `withBase()` in src/lib/base.ts
 * or be emitted by Astro itself; hardcoded root-relative paths ('/foo.css') will
 * 404 on the deployed site while working fine in `astro dev`.
 */
export default defineConfig({
  site: 'https://afinner.github.io',
  base: '/STEP_Maths_learning_tool/',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  integrations: [react()],
});
