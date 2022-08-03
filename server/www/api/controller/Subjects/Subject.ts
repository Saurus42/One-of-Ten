import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );

interface subjectsI {
  name: string
  teachers: string[]
  classes: string[]
}

class Subjects extends Controller<subjectsI> {
  constructor() {
    super();
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.getContent( 'subjects', ctx );
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'subjects', ctx );
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'subjects', ctx );
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.deleteContent( 'subjects', ctx );
  }
}

export = Subjects;
