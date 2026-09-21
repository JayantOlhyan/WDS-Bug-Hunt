/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/bug-hunt',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
