import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.ts'],
    typecheck: {
      enabled: true,
    },
    coverage: {
      exclude: [
        '.github/**',
        '.next/**',
        '.vercel/**',
        'components/**',
        'patches/**',
        'public/**',
        'type/**',
        ...coverageConfigDefaults.exclude,
      ],
      extension: ['.ts'],
      reporter: ['text', 'html'],
    },
  },
});
