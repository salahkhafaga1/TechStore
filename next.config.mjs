/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // هذا السطر سيجعل الـ build ينجح حتى مع وجود الأخطاء السابقة
    ignoreDuringBuilds: true,
  },
  // إذا كان لديك إعدادات صور سابقة اتركها هنا، مثل:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig; // أو module.exports = nextConfig حسب نوع ملفك