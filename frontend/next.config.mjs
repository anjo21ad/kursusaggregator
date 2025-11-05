/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable production source maps
  productionBrowserSourceMaps: false,

  // Disable ESLint during builds (TODO: Fix lint errors later)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during builds (relying on IDE)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Sentry configuration (optional)
  ...(process.env.SENTRY_DSN && {
    sentry: {
      hideSourceMaps: true,
      disableServerWebpackPlugin: true,
      disableClientWebpackPlugin: true,
    },
  }),
};

export default nextConfig;
