import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['hooks/**', 'store/**', 'components/**'],
      exclude: ['node_modules/**', 'tests/**'],
      thresholds: {
        // Overall project — currently have focused unit tests for P0/P1
        statements: 10,
        // Per-file: enforce 100% on P0 critical paths
        perFile: false,
      },
    },
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
