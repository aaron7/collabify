/**
 * Based off https://github.com/nkzw-tech/eslint-config - MIT License - Copyright (c) 2023 Christoph Nakazawa
 * Dropped @nkzw/strict (no-instanceof), replaced `typescript-sort-keys` with `perfectionist`, and migrated
 * to eslint 9 via @eslint/migrate-config.
 *
 * The plan is to switch to a pre-made config that supports Eslint 9, or look at a tool like Biome.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: _dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/dist/', '**/coverage/', '**/generated/'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/strict',
      'plugin:import/errors',
      'plugin:import/typescript',
      'plugin:react-hooks/recommended',
      'plugin:react/recommended',
    ),
  ),
  {
    languageOptions: {
      ecmaVersion: 5,

      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      sourceType: 'commonjs',
    },

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      'no-only-tests': noOnlyTests,
      perfectionist,
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys-fix': sortKeysFix,
      unicorn,
      'unused-imports': unusedImports,
    },

    rules: {
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-dynamic-delete': 0,
      '@typescript-eslint/no-invalid-void-type': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-this-alias': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-var-requires': 0,
      curly: 2,
      'import/default': 0,
      'import/named': 0,
      'import/namespace': 0,
      'import/no-duplicates': 0,
      'import/no-extraneous-dependencies': 2,
      'import/no-named-as-default-member': 0,
      'import/order': 0,
      'no-console': 2,
      'no-const-assign': 2,
      'no-constant-binary-expression': 2,
      'no-extra-parens': [2, 'functions'],
      'no-irregular-whitespace': 2,
      'no-only-tests/no-only-tests': 2,
      'no-this-before-super': 2,
      'no-unused-expressions': 2,
      'no-unused-labels': 2,
      'no-unused-vars': 0,
      'no-useless-rename': 2,
      'no-var': 2,

      'no-warning-comments': [
        2,
        {
          terms: ['@nocommit'],
        },
      ],

      'object-curly-spacing': 0,
      'object-shorthand': 2,

      'perfectionist/sort-enums': 2,

      'perfectionist/sort-interfaces': 2,
      'prefer-arrow-callback': [
        2,
        {
          allowNamedFunctions: true,
        },
      ],
      'prefer-const': 2,
      'react-hooks/exhaustive-deps': 2,
      'react/jsx-sort-props': 2,
      'react/prop-types': 0,
      'react/react-in-jsx-scope': 0,
      'sort-destructure-keys/sort-destructure-keys': 2,
      'sort-keys-fix/sort-keys-fix': 2,
      'unicorn/better-regex': 2,
      'unicorn/catch-error-name': 2,
      'unicorn/consistent-empty-array-spread': 2,
      'unicorn/consistent-function-scoping': 2,
      'unicorn/no-abusive-eslint-disable': 2,
      'unicorn/no-hex-escape': 2,
      'unicorn/no-invalid-fetch-options': 2,
      'unicorn/no-length-as-slice-end': 2,
      'unicorn/no-magic-array-flat-depth': 2,
      'unicorn/no-typeof-undefined': 2,
      'unicorn/no-unnecessary-polyfills': 2,
      'unicorn/no-useless-promise-resolve-reject': 2,
      'unicorn/no-useless-spread': 2,
      'unicorn/numeric-separators-style': 2,
      'unicorn/prefer-array-flat-map': 2,
      'unicorn/prefer-array-index-of': 2,
      'unicorn/prefer-array-some': 2,
      'unicorn/prefer-at': 2,
      'unicorn/prefer-dom-node-append': 2,
      'unicorn/prefer-native-coercion-functions': 2,
      'unicorn/prefer-node-protocol': 2,
      'unicorn/prefer-number-properties': 2,
      'unicorn/prefer-optional-catch-binding': 2,
      'unicorn/prefer-set-size': 2,
      'unicorn/prefer-string-raw': 2,
      'unicorn/prefer-string-replace-all': 2,
      'unicorn/prefer-string-slice': 2,
      'unicorn/prefer-structured-clone': 2,
      'unicorn/prefer-ternary': 2,
      'unicorn/prefer-top-level-await': 2,
      'unicorn/text-encoding-identifier-case': 2,
      'unused-imports/no-unused-imports': 2,
    },

    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },

      react: {
        version: '18.2.0',
      },
    },
  },
];
