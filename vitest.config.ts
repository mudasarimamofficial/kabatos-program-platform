import { defineConfig } from 'vitest/config'
import path from 'node:path'
process.loadEnvFile('.env.local')
if (new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname !== 'finbvtwjddrmbuuuyeni.supabase.co') throw new Error('Live regression tests require DEV Supabase')

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'e2e'],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, 'lib/test-stubs/server-only.ts'),
    },
  },
})
