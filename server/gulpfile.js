const sass = require( 'sass' );
const { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } = require( 'fs' );
const { join } = require( 'path' );
const { execSync } = require( 'child_process' );

function buildServer( cb ) {
  execSync( 'node ./node_modules/webpack-cli/bin/cli --config webpack.main.config.js' );
  cb();
}

function buildView( cb ) {
  tramspileSassToCss();
  publishImages();
  publishFonts( [ 'Cairo', 'Oswald', 'Quicksand' ] );
  execSync( 'node ./node_modules/webpack-cli/bin/cli --config webpack.config.js' );
  cb();
}

function tramspileSassToCss() {
  const result = sass.compile( join( __dirname, 'www', 'style', 'index.scss' ) );
  writeFileSync( join( __dirname, 'public', 'style', 'index.css' ), result.css, { encoding: 'utf-8' } );
}

function publishImages() {
  const files = readdirSync( join(__dirname, 'www', 'images') );
  for( let i = 0; i < files.length; i++ ) {
    const read = readFileSync( join( __dirname, 'www', 'images', files[i] ) );
    writeFileSync( join( __dirname, 'public', 'images', files[i] ), read );
  }
}

function publishFonts( fonts ) {
  for( let i = 0; i < fonts.length; i++ ) {
    const files = readdirSync( join(__dirname, 'www', 'font', fonts[i]) );
    if( !existsSync( join( __dirname, 'public', 'font', fonts[i] ) ) )
      mkdirSync( join( __dirname, 'public', 'font', fonts[i] ) );
    for( let j = 0; j < files.length; j++ ) {
      const read = readFileSync( join( __dirname, 'www', 'font', fonts[i], files[j] ) );
      writeFileSync( join( __dirname, 'public', 'font', fonts[i], files[j] ), read );
    }
  }
}

module.exports.buildServer = buildServer;
module.exports.buildView = buildView;