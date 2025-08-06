/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self), camera=(), geolocation=(), accelerometer=(), gyroscope=(), magnetometer=()'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/en/dashboards/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/en/:path*',
        destination: '/',
        permanent: false,
      }
    ];
  },
};

module.exports = nextConfig; 