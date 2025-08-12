import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Avoid bundling heavy Chromium automation libs; keep them as runtime dependencies
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "clone-deep",
    "merge-deep",
  ],
  webpack: (config) => {
    const externals = [
      "puppeteer",
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
      "clone-deep",
      "merge-deep",
    ];
    // Ensure these packages are treated as runtime commonjs requires
    const asCommonJs = externals.reduce<Record<string, string>>((acc, name) => {
      acc[name] = `commonjs ${name}`;
      return acc;
    }, {});
    // Preserve existing externals if configured
    if (Array.isArray(config.externals)) {
      config.externals.push(asCommonJs);
    } else if (config.externals) {
      config.externals = [config.externals, asCommonJs];
    } else {
      config.externals = [asCommonJs];
    }
    return config;
  },
};

export default nextConfig;
