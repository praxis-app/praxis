module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
    PRODUCTION_BASE_URL: process.env.PRODUCTION_BASE_URL,
  },
};
