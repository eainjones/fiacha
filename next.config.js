/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel deployment - output is handled automatically
  // Remove standalone output for Vercel (it handles this automatically)

  reactStrictMode: true,

  // Keep more pages compiled in dev to reduce recompilation churn
  onDemandEntries: {
    // Keep compiled pages in memory for 5 minutes (default 15s is too aggressive)
    maxInactiveAge: 300 * 1000,
    // Keep up to 50 pages in memory (default 5 causes frequent recompilation)
    pagesBufferLength: 50,
  },

  // Suppress noisy warnings during dev
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

module.exports = nextConfig
