const path = require( 'path' );

module.exports = {
  entry: path.join( __dirname, 'www', 'view', 'index.tsx' ),
  output: {
    filename: 'build.js',
    path: path.resolve( __dirname, 'public', 'js' )
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js', '.tsx', '.json' ]
  },
  target: 'web',
  mode: 'development',
  devtool: 'inline-source-map'
}