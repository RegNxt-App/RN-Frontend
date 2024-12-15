/* eslint-disable import/no-extraneous-dependencies */

import baseConfig from '@rn/config/tailwind-preset';
import {Config} from 'tailwindcss';

export default {
  ...baseConfig,
  content: [...baseConfig.content, './components/**/*', './form/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
