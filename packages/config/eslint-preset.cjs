/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', '@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:react/jsx-runtime',
    'turbo',
    'prettier',
  ],
  rules: {
    // override typescript eslint rules
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['error'],
    'react/jsx-filename-extension': [1, {extensions: ['.tsx', '.jsx']}],
    'react/require-default-props': 0,
    'import/no-unresolved': 'error',

    'import/extensions': [
      'error',
      'ignorePackages',
      {
        '': 'never',
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-unstable-nested-components': [
      'off',
      {
        allowAsProps: true,
      },
    ],

    'no-console': 'error',
    'no-nested-ternary': 0,
    'no-param-reassign': 0,

    'react/jsx-props-no-spreading': 'off',
    'no-continue': 'off',
    'no-restricted-syntax': 'off',
    'react/forbid-prop-types': 'off',
    'import/prefer-default-export': 'off',
    'max-classes-per-file': ['error', 10],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      alias: {
        extensions: ['.ts', '.js', '.tsx', '.jsx', '.json'],
      },
    },
  },
};
