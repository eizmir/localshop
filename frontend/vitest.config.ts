import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      // Ölçülmesi anlamsız olanlar: testlerin kendisi, tip tanımları,
      // uygulama girişi ve saf metin/sabit dosyaları.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/types.ts',
        'src/main.tsx',
        'src/i18n/**',
        'src/constants/**',
      ],
    },
  },
});
