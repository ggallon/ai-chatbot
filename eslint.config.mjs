import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginImportX from 'eslint-plugin-import-x';
//import tailwind from 'eslint-plugin-tailwindcss';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  //...tailwind.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    ignores: ['./components/ui/**'],
    rules: {
      'import-x/no-deprecated': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
    settings: {
      /* no compatibility with v4 yet
      tailwindcss: {
        callees: ['clsx', 'cn', 'cx'],
        config: 'tailwind.config.ts',
        removeDuplicates: true,
        whitelist: ['diff-editor'],
      },
       */
    },
  },
];

export default eslintConfig;
