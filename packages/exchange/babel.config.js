const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            '> 2%',
          ],
        },
        modules: isTest ? 'commonjs' : false,
        useBuiltIns: false,
        loose: true,
      },
    ],
  ],
  sourceMaps: isTest ? 'inline' : true,
};
