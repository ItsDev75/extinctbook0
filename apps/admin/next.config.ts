import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@livemunshi/shared"],
    experimental: {
        typedRoutes: true,
    },
};

export default nextConfig;
