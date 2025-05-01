/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,// Set to true temporarily if needed
  },
  experimental: {
    typedRoutes: true, // Enable for better type checking
  }
};

module.exports = nextConfig;