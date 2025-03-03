/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        // Add any Turbopack-specific rules here if needed
      }
    }
  }
}

module.exports = nextConfig
