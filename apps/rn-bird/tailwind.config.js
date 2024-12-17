import baseConfig from '@rn/ui/tailwind.config';
import { Config } from 'tailwindcss';


export default {
	...baseConfig,
	content: [...baseConfig.content, './src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
