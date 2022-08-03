import Route = require( 'koa-router' );
const { version } = require( '../../configure.json' );
class Router {
  private route: Route
  constructor( route: Route ) {
    this.route = route;
  }
  private get( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.get( `/api/${version}/${name}`, callback );
  }
  private getImage( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.get( `/${name}`, callback );
  }
  private post( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.post( `/api/${version}/${name}`, callback );
  }
  private postImage( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.post( `/${name}`, callback );
  }
  private put( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.put( `/api/${version}/${name}`, callback );
  }
  private putImage( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.put( `/${name}`, callback );
  }
  private delete( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.delete( `/api/${version}/${name}`, callback );
  }
  private deleteImage( name: string, callback: ( ctx: Route.RouterContext ) => void ) {
    this.route.delete( `/${name}`, callback );
  }
  public send( name: string, method: string, type: 'image'|'api', callback: ( ctx: Route.RouterContext ) => void ) {
    switch( type ) {
      case 'image': {
        switch( method ) {
          case 'get': {
            this.getImage( name, callback );
            break;
          }
          case 'post': {
            this.postImage( name, callback );
            break;
          }
          case 'put': {
            this.putImage( name, callback );
            break;
          }
          case 'delete': {
            this.deleteImage( name, callback );
            break;
          }
        }
      }
      case 'api': {
        switch( method ) {
          case 'get': {
            this.get( name, callback );
            break;
          }
          case 'post': {
            this.post( name, callback );
            break;
          }
          case 'put': {
            this.put( name, callback );
            break;
          }
          case 'delete': {
            this.delete( name, callback );
            break;
          }
        }
      }
    }
  }
  public get router() {
    return this.route;
  }
}

export = Router;
