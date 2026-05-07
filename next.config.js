/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize large package imports for tree-shaking
  experimental: {
    optimizePackageImports: ["wagmi", "viem", "@tanstack/react-query"],
  },
};

module.exports = nextConfig;
