import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      // Ölçülmesi anlamsız olanlar: testlerin kendisi, tip tanımları,
      // uygulama girişi ve OpenAPI tanımı (çalıştırılabilir mantık içermez).
      exclude: [
        'src/**/*.test.ts',
        'src/test/**',
        'src/types/**',
        'src/server.ts',
        'src/docs/**',
      ],
    },
  },
});
