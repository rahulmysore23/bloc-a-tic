/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tomato-hilarious-dragonfly-332.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
    domains: ['tomato-hilarious-dragonfly-332.mypinata.cloud'],
  },
}

module.exports = nextConfig 