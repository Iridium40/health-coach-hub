import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/daily-actions',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
