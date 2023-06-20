/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  endOfLine: 'lf',
  semi: false,
  useTabs: false,
  singleQuote: true,
  arrowParens: 'avoid',
  tabWidth: 2,
  trailingComma: 'none',
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/components/ui/(.*)$',
    '^@/components/(.*)$',
    '^@/app/(.*)$',
    '^(@/auth/(.*)$)|^(@/auth$)',
    '^@/lib/(.*)$',
    '^@/config/(.*)$',
    '^@/styles/(.*)$',
    '^[./]'
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  tailwindFunctions: ['cn', 'cva'],
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ],
  pluginSearchDirs: false
}
