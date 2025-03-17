/** @type {import('prettier').Config} */
const config = {
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  endOfLine: 'lf',
  tailwindStylesheet: './app/globals.css',
  tailwindFunctions: ['classnames', 'clsx', 'cn', 'cx'],
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
