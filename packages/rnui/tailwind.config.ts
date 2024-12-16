/* eslint-disable import/no-extraneous-dependencies */

import {Config} from 'tailwindcss';

import baseConfig from '@rn/config/tailwind-preset';

export default {
  ...baseConfig,
  content: [
    ...baseConfig.content,
    './components/**/*',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ]
} satisfies Config;
