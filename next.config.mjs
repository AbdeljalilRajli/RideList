/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.imagin.studio', 'images.unsplash.com'], // Combine both domains in one array
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
