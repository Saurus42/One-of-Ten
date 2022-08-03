import React = require( 'react' );
import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );
import fs = require( 'fs' );
import mime = require( 'mime-types' );
import path = require( 'path' );
import Html = require( '../../../../class/Html' );
import Root = require('../../../view/component/organizm/Root');
import ReactServer = require( 'react-dom/server' );
import RouterDOM = require( 'react-router-dom' );


class View extends Controller<any> {
  constructor() {
    super();
  }

  index = async ( ctx: Router.RouterContext<any, {}> ) => {
    const context = {}
    const view = Html.generate( <RouterDOM.StaticRouter location={ ctx.request.url } context={ context }><Root /></RouterDOM.StaticRouter>, [ '/style/index.css' ], [ [ '/js/index.js', true ], [ '/js/build.js', false ] ] );
    const content = ReactServer.renderToString( view );
    ctx.response.set( { 'Content-Type': 'text/html' } );
    ctx.body = content;
    ctx.status = 200
  }

  file = async ( ctx: Router.RouterContext<any, {}> ) => {
    const p = path.join( __dirname, 'public', ctx.request.path );
    const type = mime.lookup( p );
    const content = fs.readFileSync( p );
    if( !type ) throw new Error( 'Bad file' );
    ctx.response.set( { 'Content-Type': type } );
    ctx.body = content;
    ctx.status = 200
  }
}

export = View;
