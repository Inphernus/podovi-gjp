// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://podovi-gjp.hr',
  trailingSlash: 'always',
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/hvala/') })],
  vite: { plugins: [tailwindcss()] },
});
