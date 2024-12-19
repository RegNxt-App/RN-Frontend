/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@rn/config/eslint-preset.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
