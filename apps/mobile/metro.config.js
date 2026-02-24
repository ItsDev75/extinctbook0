const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root for shared packages
config.watchFolders = [monorepoRoot];

// Resolve modules from the project root first, then monorepo root
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(monorepoRoot, "node_modules"),
];

// ── CRITICAL: Exclude Next.js .next build output and admin app ─────────────
// Without this, Metro watches the admin's .next folder and crashes trying
// to interpret Next.js route group folders like (admin) as Expo route groups.
config.resolver.blockList = [
    // Block the entire admin .next build cache
    /apps[/\\]admin[/\\]\.next[/\\].*/,
    // Block the admin's node_modules to avoid conflicts
    /apps[/\\]admin[/\\]node_modules[/\\].*/,
];

module.exports = config;
