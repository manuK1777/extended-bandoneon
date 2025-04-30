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
  // External packages that use Node.js APIs
  serverExternalPackages: ['bcryptjs', 'jsonwebtoken', 'mysql2'],
  // Set the output to standalone for better deployment compatibility
  output: 'standalone',
};

module.exports = nextConfig;
