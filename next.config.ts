import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads font files from its own node_modules directory at runtime
  // using __dirname-relative paths. If Turbopack bundles it, __dirname no
  // longer points to node_modules/pdfkit/js/ and font loading fails silently.
  // Marking it external tells Next.js to use native require() at runtime instead.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
