/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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