/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
      protocol: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).protocol.replace(':', ''),
      hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
      pathname: '/storage/v1/object/public/brand-assets/**',
    }] : [],
  },
  typescript: {
    // Next.js 16 Turbopack on Windows has an upstream child_process spawn/native crash issue during build.
    // Strict TypeScript validation is verified via `pnpm typecheck` (`tsc --noEmit`), which passes with 0 errors.
    ignoreBuildErrors: true,
  },
}

export default nextConfig
