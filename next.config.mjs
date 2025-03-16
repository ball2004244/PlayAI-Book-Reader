/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.js',
      },
    },
  },
};

export default nextConfig;