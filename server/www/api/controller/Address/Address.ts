import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );

interface addressI {
  streat: string
  nr: string
  city: string
  postCode: string
  district: string
  voivodeship: string
}

class Address extends Controller<addressI> {
  constructor() {
    super();
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.getContent( 'address', ctx );
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'address', ctx );
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'address', ctx );
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.deleteContent( 'address', ctx );
  }
}

export = Address;
