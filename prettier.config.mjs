/** @type {import('prettier').Config} */
const config = {
  printWidth: 80,
  endOfLine: "lf",
  semi: true,
  useTabs: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  bracketSpacing: true,
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["cn"],
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
