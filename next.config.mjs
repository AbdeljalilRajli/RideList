/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cdn.imagin.studio',
      'images.unsplash.com',
      'res.cloudinary.com',
      'tbobbdlyuvmtbveedlmc.supabase.co',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.imagin.studio' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'tbobbdlyuvmtbveedlmc.supabase.co' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
}

export default nextConfig;
