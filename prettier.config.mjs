export default {
  importOrder: [
    '^react$',
    '<THIRD_PARTY_MODULES>',
    '^@core/(.*)$',
    '',
    '^@/(.*)$',
    '',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  singleQuote: true,
};
