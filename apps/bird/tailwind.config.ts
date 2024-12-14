import {Config} from 'tailwindcss';

import baseConfig from '@rn/config/tailwind-preset';

export default {
  ...baseConfig,
  content: [...baseConfig.content, './src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
