import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );

interface questI {
  teacher: string
  category: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  question: string
  goodAnswer: string
}

class Questions extends Controller<questI> {
  constructor() {
    super();
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    if( ctx.request.query.teacher ) {
      this.database.connect( 'questions' );
      const list = (await this.database.list);
      const tab: any[] = [];
      for( const row of list.rows ) {
        const quest = await this.database.get( row.id );
        if( quest?.teacher === ctx.request.query.teacher )
          tab.push( quest );
      }
      ctx.response.body = tab;
      ctx.response.set( {'Content-Type': 'application/json' })
      ctx.response.status = 200;
    } else
      await this.getContent( 'questions', ctx );
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'questions', ctx );
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'questions', ctx );
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.deleteContent( 'questions', ctx );
  }
}

export = Questions;
