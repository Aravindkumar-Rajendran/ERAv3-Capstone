module.exports = function (api) {
  // Cache the returned value forever and don't call this function again
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead',
        useBuiltIns: 'entry',
        corejs: 3,
        modules: false,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ];

  const plugins = [
    // Enable class properties syntax
    '@babel/plugin-proposal-class-properties',
    // Enable private methods and accessors
    '@babel/plugin-proposal-private-methods',
    // Enable private property in object
    '@babel/plugin-proposal-private-property-in-object',
    // Enable nullish coalescing operator (??)
    '@babel/plugin-proposal-nullish-coalescing-operator',
    // Enable optional chaining (?.)
    '@babel/plugin-proposal-optional-chaining',
    // Add other plugins as needed
  ];

  return {
    presets,
    plugins,
  };
};
