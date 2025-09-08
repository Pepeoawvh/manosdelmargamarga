/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.pinterest.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
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
  }
};

export default nextConfig;