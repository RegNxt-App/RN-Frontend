/* eslint-disable import/no-extraneous-dependencies */
import {Config} from 'tailwindcss';

import baseConfig from '@rn/config/tailwind-preset';

export default {
  ...baseConfig,
  content: [...baseConfig.content, './components/**/*', './form/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
