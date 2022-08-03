import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );

interface pointsI {
  subjects: string[]
  points: string[]
  grades: string[][]
}

class Points extends Controller<pointsI> {
  constructor() {
    super();
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.getContent( 'points', ctx );
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'points', ctx );
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'points', ctx );
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.deleteContent( 'points', ctx );
  }
}

export = Points;
