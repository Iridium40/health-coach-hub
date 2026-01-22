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

export default nextConfig
