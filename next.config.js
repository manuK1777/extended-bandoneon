/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/djxcomnwb/**',
      },
    ],
  },
  // Skip static generation for pages that use client-side authentication
  experimental: {
    // This ensures pages with client components that use authentication are not statically generated
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken', 'mysql2'],
  },
  // Explicitly set which pages should be statically generated vs. server-side rendered
  // This prevents issues with client components that use authentication hooks
  output: 'standalone',
};

module.exports = nextConfig;
