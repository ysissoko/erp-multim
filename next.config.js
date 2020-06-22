const withLess = require('@zeit/next-less');
module.exports = withLess({
  lessLoaderOptions: {
    javascriptEnabled: true
  },
      // Webpack customization
      webpack: function(config) {
        config.module.rules.push({
          test: /\.(jpe?g|png|svg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                limit: 8192,
                publicPath: '/_next/static/images/',
                outputPath: 'static/images/',
                name: '[name]-[hash].[ext]'
              }
            }
          ]
        });
  
        return config;
      }
});