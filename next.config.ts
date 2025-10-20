import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static page generation for all pages to avoid build-time data fetching issues
  output: 'standalone',
  // Skip trailing slash to avoid redirect issues
  trailingSlash: false,
};

export default nextConfig;
