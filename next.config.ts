import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.medidata.gov.bd',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'medidata.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.medicinedata.com',
      },
    ],
  },
};

export default nextConfig;
