const path = require( 'path' );

module.exports = {
  entry: path.join( __dirname, 'index.ts' ),
  output: {
    filename: 'index.js',
    path: path.resolve( __dirname )
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
  target: 'node16.14',
  mode: 'development',
  devtool: 'inline-source-map'
}