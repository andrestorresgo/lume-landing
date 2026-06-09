// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://lume-landing-murex.vercel.app',
  adapter: vercel(),
  vite: {
      plugins: [tailwindcss()],
    },

  integrations: [
    react(),
    partytown({
      config: {
        forward: ['dataLayer', 'gtag'],
      },
    }),
    sitemap(),
  ],
});