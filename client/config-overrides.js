const webpack = require('webpack');

module.exports = function override(config) {
  // Allow imports without file extensions
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Polyfills for Node.js modules used by casper-js-sdk
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    process: require.resolve('process/browser'),
    util: require.resolve('util/'),
  };

  // Provide global Buffer
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];

  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
};
