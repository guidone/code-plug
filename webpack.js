const path = require('path');

module.exports = {
  mode: 'production',
  devtool: false,
  entry: './code-plug',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '.'),
    library: 'code-plug',
    libraryTarget: 'amd'
  },
  externals : [
    {
      react: 'amd react',
      lodash: 'amd lodash',
      'prop-types': 'amd prop-types'
    }
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader'
        ]
      }
    ]
  },

  devServer: {
    contentBase: './dist',
    port: 8081,
    //publicPath: './src/images',
    //hot: true,
    /*proxy: {
      '*.png': {
        target: 'http://localhost:[port]/',
        //pathRewrite: { '^/some/sub-path': '' },
      }
    }*/
  }
};