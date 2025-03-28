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
        }
      ],
      domains: [
        'i.pinimg.com', 
        'pinimg.com',
        'media.pinterest.com',
        'www.pinterest.com',
        's.pinimg.com',
      ],
    }
  };
  
  export default nextConfig;