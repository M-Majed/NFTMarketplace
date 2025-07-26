/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["gateway.pinata.cloud"],
    formats: ["image/avif", "image/webp"],
  },
}

module.exports = nextConfig
