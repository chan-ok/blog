import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { createSharedMarkdownOptions, createSatteriOptions } from './src/lib/markdown/processor';
import contentAssets from './src/integrations/content-assets';
export default defineConfig({
  site: 'https://chan-ok.com', output: 'static', compressHTML: 'jsx',
  ...(process.env.BLOG_CACHE_DIR ? { cacheDir: process.env.BLOG_CACHE_DIR } : {}),
  ...(process.env.BLOG_OUT_DIR ? { outDir: process.env.BLOG_OUT_DIR } : {}),
  integrations: [react(), vue(), svelte(), contentAssets()],
  markdown: { ...createSharedMarkdownOptions(), processor: satteri(createSatteriOptions()) },
  vite: { plugins: [tailwindcss()], ...(process.env.BLOG_CACHE_DIR ? { cacheDir: `${process.env.BLOG_CACHE_DIR}/vite` } : {}) },
});
