/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@evm-wallet/sdk'],
  output: 'export',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  trailingSlash: true
};

module.exports = nextConfig;
