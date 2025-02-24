import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['rsc/**/*.ui.test.ts{,x}'],
    exclude: ['**/node_modules/**'],
  },
});
