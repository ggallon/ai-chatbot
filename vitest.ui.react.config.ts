import react from '@vitejs/plugin-react';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.ui.test.ts{,x}'],
    typecheck: {
      enabled: true,
    },
    coverage: {
      exclude: [
        '.github/**',
        '.next/**',
        '.vercel/**',
        'patches/**',
        'public/**',
        'type/**',
        ...coverageConfigDefaults.exclude,
      ],
      extension: ['.tsx'],
      reporter: ['text', 'html'],
    },
  },
});
