/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'imgbb.com',
      'example.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // يسمح بكل الروابط
      },
    ],
  },
}

module.exports = nextConfig