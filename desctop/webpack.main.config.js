const path = require( 'path' );

module.exports = {
  entry: path.join( __dirname, 'main.ts' ),
  output: {
    filename: 'run.js',
    path: path.resolve( __dirname )
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
  target: 'electron15.3-main'
}