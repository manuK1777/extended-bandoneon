/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/djxcomnwb/**',
      },
    ],
  },
  // Configuration for handling Node.js APIs in the Edge Runtime
  experimental: {
    // This ensures packages using Node.js APIs are properly handled
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken', 'mysql2'],
  },
  // Set the output to standalone for better deployment compatibility
  output: 'standalone',
};

module.exports = nextConfig;
