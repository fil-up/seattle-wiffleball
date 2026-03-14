/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/teams',
        destination: '/stats/teams',
        permanent: true,
      },
      {
        source: '/teams/:id',
        destination: '/stats/teams/:id',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
