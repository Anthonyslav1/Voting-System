const path = require('path');

module.exports = {
  entry: './src/js/app.js',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'src/dist'),
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'), // Added fallback for vm
    },
  },
  plugins: [
    new (require('webpack').ProvidePlugin)({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  ignoreWarnings: [
    {
      module: /ethers/, // Suppresses warnings for ethers
    },
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  mode: 'development', // Change to 'production' for production builds
};
