import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (Next.js 16 default) handles static assets natively.
  // GLB/GLTF files are loaded as object URLs via URL.createObjectURL on the client.
  turbopack: {},
};

export default nextConfig;
