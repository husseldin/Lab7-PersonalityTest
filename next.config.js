/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      enabled: true,
      bodySizeLimit: '2mb'
    }
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
