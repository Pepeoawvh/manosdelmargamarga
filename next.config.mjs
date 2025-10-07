/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Puedes restringirlo si quieres más seguridad
      },
    ],
    domains: [
      'i.pinimg.com',
      'pinimg.com',
      'media.pinterest.com',
      'www.pinterest.com',
      's.pinimg.com',
      'drive.google.com',
      'lh3.googleusercontent.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

export default nextConfig;
