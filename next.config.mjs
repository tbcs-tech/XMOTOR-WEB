/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type and lint errors are caught in development; a production build on a
  // 1vCPU droplet should not re-run them.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
}
export default nextConfig
