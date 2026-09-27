import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
  // data/corpus.json is read from disk by the genericness scorer at runtime.
  outputFileTracingIncludes: {
    "/api/**": ["./data/**/*.json"],
  },
};

export default nextConfig;
