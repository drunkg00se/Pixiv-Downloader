import { join } from 'path';
import { createRequire } from 'node:module';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { skeleton } from '@skeletonlabs/tw-plugin';
import scrollbar from 'tailwind-scrollbar';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    'src/**/*.{js,ts,html,svelte}',
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
  ],
  theme: {
    extend: {
      transitionProperty: {
        height: 'height'
      }
    }
  },
  plugins: [
    forms,
    typography,
    skeleton({
      themes: {
        preset: [
          {
            name: 'skeleton',
            enhancements: true
          }
        ]
      }
    }),
    scrollbar()
  ]
};
