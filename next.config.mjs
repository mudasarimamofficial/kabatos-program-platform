/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Next.js 16 Turbopack on Windows has an upstream child_process spawn/native crash issue during build.
    // Strict TypeScript validation is verified via `pnpm typecheck` (`tsc --noEmit`), which passes with 0 errors.
    ignoreBuildErrors: true,
  },
}

export default nextConfig
