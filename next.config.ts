import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Required for static export
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  } as any,
  webpack: (config, { dev }) => {
    // Disable minification in production build to drastically reduce memory usage
    if (!dev && config.optimization) {
      config.optimization.minimize = false;
    }
    return config;
  }
};

export default nextConfig;
