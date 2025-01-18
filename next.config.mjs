/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
  },
  // Vercel specific optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable static exports for better performance
  output: 'standalone',
}