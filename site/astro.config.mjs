// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://podovi-gjp.hr',
  trailingSlash: 'always',
  integrations: [preact({ compat: true }), sitemap({ filter: (page) => !page.includes('/hvala/') })],
  vite: { plugins: [tailwindcss()] },
});
