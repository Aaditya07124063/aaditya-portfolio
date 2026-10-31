import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https:' + String.fromCharCode(47, 47) + 'aadityaadhikari.tech';

export default defineConfig({
  site,
  output: 'static',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
