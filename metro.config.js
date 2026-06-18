const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Watchman fails on some macOS setups (Desktop privacy, paths with spaces).
config.watcher = { useWatchman: false };

module.exports = config;
