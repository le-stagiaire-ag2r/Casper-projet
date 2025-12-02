module.exports = function override(config) {
  // Allow imports without file extensions
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
};
