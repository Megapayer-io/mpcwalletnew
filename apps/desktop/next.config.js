/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@evm-wallet/sdk', '@tauri-apps/api'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  distDir: 'out',
  // Disable server-side features for Tauri
  experimental: {
    esmExternals: false
  }
};

module.exports = nextConfig;
