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
    // Externalize heavy puppeteer libs so Vercel doesn't try to bundle them
    "puppeteer",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    // Avoid loading stealth evasion subpaths on Vercel (cause cannot find module errors)
    // We'll only load puppeteer on the VPS worker.
  ],
  webpack: (config) => {
    const externals = [
      "puppeteer",
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
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
