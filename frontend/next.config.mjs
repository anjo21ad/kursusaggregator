/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable production source maps
  productionBrowserSourceMaps: false,

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
