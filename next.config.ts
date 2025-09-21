import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  experimental: {
    // Temporarily disable optimizeCss due to critters issues
    // optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip'
    ],
    // Enable React Server Components
    // reactCompiler: true, // Temporarily disable React Compiler due to missing dependency
    // Enable turbopack loading for faster builds
    // turbo: { // Deprecated, using turbopack instead
    //   rules: {
    //     '*.svg': {
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //   },
    // },
  },
  // Use Webpack instead of Turbopack to avoid module loading issues
  webpack: (config) => {
    config.externals.push('@opentelemetry/*');
    return config;
  },
  serverExternalPackages: ['@genkit-ai/*'],
  images: {
    // Optimize image loading
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hqoexhhcilzjilnagotx.supabase.co',
        port: '',
        pathname: '/**',
      },
      // Add crafttrip.in to allow external images
      {
        protocol: 'https',
        hostname: 'www.crafttrip.in',
        port: '',
        pathname: '/**',
      },
      // Add Bing image hostname
      {
        protocol: 'https',
        hostname: 'tse4.mm.bing.net',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Enable compression for better performance
  compress: true,
  // Configure page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default nextConfig;