// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**', // This will allow images from any domain
          port: '',
          pathname: '**',
        },
      ],
    },
  };
  
  export default nextConfig;
  