/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ["*"] } },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
