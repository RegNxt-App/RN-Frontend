import baseConfig from '@rn/ui/tailwind.config';

export default {
	...baseConfig,
	content: [...baseConfig.content, './src/**/*.{js,ts,jsx,tsx}'],
};
