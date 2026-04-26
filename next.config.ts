import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack to this repo so the parent directory's stray lockfile
  // does not get inferred as the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
