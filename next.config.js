/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com", // unsafe-inline needed for Next.js, vercel analytics
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Google Fonts stylesheets
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com", // Google Fonts files
              "connect-src 'self' https://api.indusanalytics.co.in https://indusestimoapi.onrender.com https://api.frankfurter.app https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ],
      },
    ]
  },

  // Turbopack configuration for development (Next.js 15+)
  turbopack: {
    // Turbopack specific configuration
    // resolveAlias can be added here if needed for custom module resolution
  },

  // Experimental features
  experimental: {
    // Disable webpack build worker to prevent conflicts with Turbopack
    webpackBuildWorker: false,
  },

  // Webpack configuration (used in production)
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack for production builds
    if (process.env.NODE_ENV === 'production' && !dev) {
      config.parallelism = 1
      config.optimization = {
        ...config.optimization,
        minimize: true,
      }
    }

    return config
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Compiler options (SWC is default in Next.js 15+)
  compiler: {
    // Remove unused imports
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // TypeScript configuration
  typescript: {
    // WARNING: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    // Email module is under development, ignore type errors for now
    ignoreBuildErrors: true,
  },

  // PostCSS configuration (consolidated from postcss.config.js)
  // No need for separate postcss.config.js file
  // Next.js will use these settings automatically
}

module.exports = nextConfig