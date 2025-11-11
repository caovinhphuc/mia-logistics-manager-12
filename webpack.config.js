const path = require('path');

module.exports = {
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    allowedHosts: ['localhost', '127.0.0.1'],
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://sheets.googleapis.com https://drive.googleapis.com https://maps.googleapis.com https://accounts.google.com; frame-src 'self' https://accounts.google.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; report-uri /csp-report;",
    },
  },

  // Other webpack configurations can be added here
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser'),
      util: require.resolve('util'),
      path: require.resolve('path-browserify'),
      fs: false,
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
      querystring: require.resolve('querystring-es3'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      net: false,
      tls: false,
      child_process: false,
    },
  },
  plugins: [
    // Add any additional plugins here
  ],
};
