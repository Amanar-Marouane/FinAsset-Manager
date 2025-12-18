/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
      },
    ],
  },
  transpilePackages: ['geist'],

  reactStrictMode: false,
  output: 'export',
}

export default nextConfig;