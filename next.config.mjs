/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.imagin.studio',
          pathname: '/**', // Allows all paths from this domain
        },
      ],
    },
  };
  
  export default nextConfig;
  