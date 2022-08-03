import Router = require( 'koa-router' );
import nano = require('nano');
import Controller = require( '../../../../class/Controller' );

interface classesI {
  students: string[]
  name: string
  educator: string
}

class Classes extends Controller<classesI> {
  constructor() {
    super();
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    const teacher = ctx.request.query.teacher as any as string;
    const student = ctx.request.query.student as any as string;
    try {
      this.database.connect( 'classes' );
      if( ctx.request.query.id ) {
        const docname = ctx.request.query.id;
        if( Array.isArray( docname ) ) {
          const collection = await Promise.all( docname.map( id => this.database.get( id ) ) );
          ctx.status = 200;
          ctx.body = collection;
          ctx.set( 'Content-Type', 'application/json' );
        } else {
          const doc = await this.database.get( docname );
          if( doc ) {
            ctx.status = 200;
            ctx.body = doc;
            ctx.set( 'Content-Type', 'application/json' );
          }
        }
      } else if( teacher ) {
        const list = await this.database.list;
        const collection = await Promise.all( list.rows.map( row => this.database.get( row.id ) ) );
        const result: ((nano.DocumentGetResponse & classesI) | undefined)[] = [];
        for( let i = 0; i < collection.length; i++ ) {
          if( collection[i]?.educator === teacher ) {
            result.push( collection[i] );
          }
        }
        ctx.status = 200;
        ctx.body = result;
        ctx.set( 'Content-Type', 'application/json' );
      } else if( student ) {
        const list = await this.database.list;
        const collection = await Promise.all( list.rows.map( row => this.database.get( row.id ) ) ) as any as (nano.DocumentGetResponse & classesI)[];
        const result: (nano.DocumentGetResponse & classesI)[] = [];
        for( let i = 0; i < collection.length; i++ ) {
          for( let j = 0; j < collection[i].students.length; j++ ) {
            if( collection[i].students[j] === student ) {
              result.push( collection[i] );
              continue;
            }
          }
        }
        ctx.status = 200;
        ctx.body = result;
        ctx.set( 'Content-Type', 'application/json' );
      } else {
        const list = await this.database.list;
        const collection = await Promise.all( list.rows.map( row => this.database.get( row.id ) ) );
        ctx.status = 200;
        ctx.body = collection;
        ctx.set( 'Content-Type', 'application/json' );
      }
    } catch( e ) {
      ctx.status = 500;
      ctx.body = {
        // @ts-ignore
        message: e.message
      };
      ctx.set( 'Content-Type', 'application/json' )
    }
    // await this.getContent( 'classes', ctx );
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    try {
      this.database.connect( 'classes' );
      const newClass = ctx.request.query.new as any as string;
      const teacher = ctx.request.query.teacher as any as string;
      const save = await this.database.put( { name: newClass, educator: teacher, students: [] } );
      if( save?.ok ) {
        const list = await this.database.list;
        const collection = await Promise.all( list.rows.map( row => this.database.get( row.id ) ) );
        const result: ((nano.DocumentGetResponse & classesI) | undefined)[] = [];
        for( let i = 0; i < collection.length; i++ ) {
          if( collection[i]?.educator === teacher ) {
            result.push( collection[i] );
          }
        }
        ctx.status = 200;
        ctx.body = result;
        ctx.set( 'Content-Type', 'application/json' );
      }
    } catch( e ) {
      ctx.status = 500;
      ctx.body = {
        // @ts-ignore
        message: e.message
      };
      ctx.set( 'Content-Type', 'application/json' )
    }
    // await this.putContent( 'classes', ctx );
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    if( typeof ctx.request.body === 'string' )
      ctx.request.body = JSON.parse(ctx.request.body);
    await this.putContent( 'classes', ctx );
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.deleteContent( 'classes', ctx );
  }
}

export = Classes;
