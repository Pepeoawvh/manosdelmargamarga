/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
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
    // Sugerido si usas Server Components/Route Handlers con librerías Node
    serverComponentsExternalPackages: ['pdfmake'],
  },

  // Excluir pdfmake del bundle del server y cargarlo nativamente en runtime
  serverExternalPackages: ['pdfmake'],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

module.exports = nextConfig;
