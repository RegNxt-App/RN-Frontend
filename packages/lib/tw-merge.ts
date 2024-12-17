import colors from "@rn/tokens/colors.json";
import spacings from "@rn/tokens/spacing.json";
import typography from "@rn/tokens/typography.json";
import { ClassValue, clsx } from "clsx";
import {
  extendTailwindMerge,
  getDefaultConfig,
  mergeConfigs,
  validators,
  type Config as TwMergeConfig,
} from "tailwind-merge";

const colorClasses = Object.entries(colors).reduce((a, [key, value]) => {
  if (typeof value === "string") {
    return [...a, key];
  }

  const nestedColors = Object.keys(value).map((e) => `${key}-${e}`);

  return [...a, ...nestedColors];
}, [] as string[]);

export const twMergeConfig: TwMergeConfig = mergeConfigs(getDefaultConfig(), {
  theme: {
    colors: colorClasses,
    spacings: Object.keys(spacings),
  },
  classGroups: {
    "font-size": [
      { text: [...Object.keys(typography), validators.isArbitraryValue] },
    ],
    "rx.animate": ["rx-slide-in-1", "rx-slide-none"],
    animate: ["animate-in", "animate-out", "animate-none"],
  },
});

const twMerge = extendTailwindMerge(twMergeConfig);

export default (...inputs: ClassValue[]) => twMerge(clsx(inputs));
