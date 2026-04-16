import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to treat these packages as native Node.js modules
  // (do not bundle them through webpack) — required for server-side PDF generation
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
