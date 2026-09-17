import { defineConfig, devices } from '@playwright/test'
process.loadEnvFile('.env.local')
if (new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname !== 'finbvtwjddrmbuuuyeni.supabase.co') throw new Error('E2E requires DEV Supabase')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 120000,
  use: { baseURL: 'http://localhost:3100', trace: 'off' },
  webServer: { command: 'node node_modules/next/dist/bin/next start --port 3100', url: 'http://localhost:3100', reuseExistingServer: false, timeout: 120000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
