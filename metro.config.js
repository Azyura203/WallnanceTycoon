const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific configurations to reduce warnings
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure web-specific transformations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Reduce console warnings in development
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Ensure proper asset handling for web
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg'
];

module.exports = config;