/* eslint-disable import/no-extraneous-dependencies */
import radixPlugin from "./tailwind-plugins/radix";
import breakpoints from "@rn/tokens/breakpoints.json";
import colors from "@rn/tokens/colors.json";
import easings from "@rn/tokens/easings.json";
import shadows from "@rn/tokens/shadows.json";
import spacing from "@rn/tokens/spacing.json";
import typography from "@rn/tokens/typography.json";
import tailwindTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
// @ts-ignore
import tailwindAnimate from "tailwindcss-animate";
import { fontFamily } from "tailwindcss/defaultTheme";
// eslint-disable-next-line import/no-unresolved
import { PluginUtils } from "tailwindcss/types/config";

export default {
  content: [
    "../../packages/nui/components/**/*.{tsx,ts,js,jsx}",
    "../../packages/layouts/**/*.{tsx,ts,js,jsx}",
  ],
  theme: {
    screens: breakpoints,
    colors,
    spacing,
    boxShadow: shadows,
    fontSize: Object.fromEntries(
      Object.entries(typography).map(([k, v]) => [k, [v.fontSize, { ...v }]])
    ) as any,
    extend: {
      transitionTimingFunction: easings,
      fontFamily: {
        firasans: ["Fira Sans", ...fontFamily.sans],
        figtree: ["Figtree", ...fontFamily.sans],
      },
      minHeight: {
        0: "0",
        screen: "100vh",
      },
      maxWidth: {
        0: "0",
        full: "100%",
      },
      minWidth: {
        0: "0",
        full: "100%",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "path-fill": {
          to: { strokeDashoffset: "0" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translate3d(0, -20%, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        "accordion-down": "0.2s accordion-down ease-out",
        "accordion-up": "0.2s accordion-up ease-out",
        "collapsible-down": "0.2s collapsible-down ease-out",
        "collapsible-up": "0.2s collapsible-up ease-out",
        "path-fill": `0.15s path-fill ease-out forwards`,
        "fade-down": `0.2s fade-down ease-in`,
      },
      typography: ({ theme }: PluginUtils) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.neutral[900]"),
            "--tw-prose-links": theme("colors.cinchgreen[700]"),
            "--tw-prose-pre-code": theme("colors.neutral[900]"),
            "--tw-prose-pre-bg": theme("colors.neutral[100]"),
            "--tw-prose-headings": theme("colors.neutral[900]"),
            "--tw-prose-code": "#000",
            "--tw-prose-bold": "#000",
            "li>p": {
              marginTop: 0,
              marginBottom: 0,
            },
            p: {
              marginTop: "1em",
              marginBottom: "1em",
            },
            h2: {
              margin: "1.6em 0 .64em",
            },
            hr: {
              marginTop: "1.5em",
              marginBottom: "1.5em",
            },
            blockquote: {
              paddingTop: "0.5em",
              paddingBottom: "0.5em",
            },
            "blockquote p:first-of-type": {
              marginTop: 0,
            },
            "blockquote p:last-of-type": {
              marginBottom: 0,
            },
            "blockquote p:first-of-type::before": {
              content: '""',
            },
            "blockquote p:last-of-type::after": {
              content: '""',
            },
          },
        },
      }),
    },
  },
  plugins: [radixPlugin, tailwindTypography, tailwindAnimate],
} satisfies Config;