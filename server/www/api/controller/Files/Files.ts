import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );
import mime = require( 'mime-types' );
import fs = require( 'fs' );
import path = require( 'path' );

class Files extends Controller<any> {
  constructor() {
    super();
  }

  // Wyświetlanie danych
  image = async ( ctx: Router.RouterContext<any, {}> ) => {
    const p = path.join( __dirname, 'public', 'images', ctx.request.query.name as any as string );
    const mimeType = mime.lookup( p );
    const stream = fs.createReadStream( p );
    if( mimeType )
      ctx.response.set( { 'Content-Type': mimeType } );
    ctx.body = stream;
  }
  key = async ( ctx: Router.RouterContext<any, {}> ) => {
    const p = path.join( __dirname, 'cert', 'publicKey.pem' );
    const stream = fs.readFileSync( p, { encoding: 'utf-8' } );
    ctx.response.set( { 'Content-Type': 'text/plain' } );
    ctx.body = stream;
  }
}

export = Files;
