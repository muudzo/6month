import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths, so the built site works from any folder or host.
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
  test: {
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      include: ['src/lib/**', 'src/app/prompts.js'],
      reporter: ['text', 'html'],
    },
  },
});
