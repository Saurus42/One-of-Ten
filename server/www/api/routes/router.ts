import RouterKoa = require( 'koa-router' );
import Router = require( '../../../class/Router' );
const router = new Router( new RouterKoa() );

export = router;