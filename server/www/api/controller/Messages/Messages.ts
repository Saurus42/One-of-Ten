import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );
import nano = require( 'nano' );

interface messagesI {
  content: string
  to: string
  from: string
}

interface usersI {
  login: string
  password: string
  firstName: string
  mail: string
  lastName: string
  surname: string
  address: string
  weight: string
  points: string
}

class Messages extends Controller<messagesI> {
  constructor() {
    super();
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.getContent( 'messages', ctx );
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    const body: messagesI = ctx.request.body;
    const messages: messagesI[] = []
    let adreser: string[] = []
    if( body.to.includes( ',' ) )
      adreser = body.to.split( ',' );
    else if( body.to.includes( ', ' ) )
      adreser = body.to.split( ', ' );
    // this.database.connect( 'messages' )
    if( adreser.length > 0 ) {
      for( let i = 0; i < adreser.length; i++ ) {
        this.database.connect( 'users' );
        const list = await this.database.list;
        for( const row of list.rows ) {
          let user = await this.database.get( row.id ) as any as (nano.DocumentGetResponse & usersI) | undefined;
          if( user ) {
            const fullname = adreser[i].split( ' ' );
            if( fullname[0] === user.surname && fullname[1] === user.firstName ) {
              const message: messagesI = {
                content: body.content,
                to: user._id,
                from: body.from
              }
              messages.push( message );
            }
          }
        }
      }
    } else {
      this.database.connect( 'users' );
      const list = await this.database.list;
      for( const row of list.rows ) {
        let user = await this.database.get( row.id ) as any as (nano.DocumentGetResponse & usersI) | undefined;
        if( user ) {
          const fullname = body.to.split( ' ' );
          if( fullname[0] === user.surname && fullname[1] === user.firstName ) {
            const message: messagesI = {
              content: body.content,
              to: user._id,
              from: body.from
            }
            messages.push( message );
          }
        }
      }
    }
    const response = await Promise.all( messages.map( value => this.database.post( value ) ) );
    ctx.status = 200;
    ctx.body = response;
    ctx.set( 'Content-Type', 'application/json' );
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.putContent( 'messages', ctx );
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.deleteContent( 'messages', ctx );
  }
}

export = Messages;
