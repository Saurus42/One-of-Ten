import Router = require( 'koa-router' );
import nano = require( 'nano' );
import Controller = require( '../../../../class/Controller' );

// Zabezpieczyć przed sygnaturą none.

interface addressesI {
  post: string
  home: string
}

interface addressI {
  streat: string
  nr: string
  city: string
  postCode: string
  district: string
  voivodeship: string
  [key: string]: string
}

class Address extends Controller<addressesI> {
  constructor() {
    super();
  }

  private equol( data1: addressI, data2: addressI ) {
    let eq = false;
    for( const key in data1 ) {
      if( data1[key] === data2[key] )
        eq = true;
      else {
        eq = false;
        break;
      }
    }
    return eq;
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    try {
      this.database.connect( 'addresses' );
      if( ctx.request.query.id ) {
        const docname = ctx.request.query.id;
        if( Array.isArray( docname ) ) {
          const collection = await Promise.all( docname.map( id => this.database.get( id ) ) );
          this.database.connect( 'address' );
          for( let i = 0; i < collection.length; i++ ) {
            const element = collection[i];
            if( element ) {
              const ids = [ element.home, element.post ];
              const address = await Promise.all( ids.map( id => this.database.get( id ) ) );
              // @ts-ignore
              element.home = address[0];
              // @ts-ignore
              element.post = address[1];
            }
          }
          ctx.status = 200;
          ctx.body = collection;
          ctx.set( 'Content-Type', 'application/json' );
        } else {
          const doc = await this.database.get( docname );
          if( doc ) {
            const ids = [ doc.home, doc.post ];
            this.database.connect( 'address' );
            const address = await Promise.all( ids.map( id => this.database.get( id ) ) );
            // @ts-ignore
            doc.home = address[0]
            // @ts-ignore
            doc.post = address[1]
            ctx.status = 200;
            ctx.body = doc;
            ctx.set( 'Content-Type', 'application/json' );
          } else {
            ctx.status = 404;
            ctx.body = doc;
            ctx.set( 'Content-Type', 'application/json' );
          }
        }
      } else {
        const list = await this.database.list;
        const collection = await Promise.all( list.rows.map( row => this.database.get( row.id ) ) );
        this.database.connect( 'address' );
        for( let i = 0; i < collection.length; i++ ) {
          const element = collection[i];
          if( element ) {
            const ids = [ element.home, element.post ];
            const address = await Promise.all( ids.map( id => this.database.get( id ) ) );
            // @ts-ignore
            element.home = address[0];
            // @ts-ignore
            element.post = address[1];
          }
        }
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
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    try {
      this.database.connect( 'address' );
      const body = ctx.request.body;
      if( this.equol( body.home, body.post ) ) {
        const response2 = await this.database.post( body.home );
        body.home = response2?.id;
        body.post = response2?.id;
        this.database.connect( 'addresses' );
        const response = await this.database.post( body );
        ctx.status = 200;
        ctx.body = response;
        ctx.set( 'Content-Type', 'application/json' );
      } else {
        const content = [ body.home, body.post ];
        const response2 = await Promise.all( content.map( body => this.database.post( body ) ) );
        body.home = response2[0]?.id;
        body.post = response2[1]?.id;
        this.database.connect( 'addresses' );
        const response = await this.database.post( body );
        ctx.status = 200;
        ctx.body = response;
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
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    try {
      this.database.connect( 'address' );
      const body = ctx.request.body;
      const content = [ body.home, body.post ];
      const response2 = await Promise.all( content.map( body => this.database.put( body ) ) );
      body.home = response2[0]?.id;
      body.post = response2[1]?.id;
      this.database.connect( 'addresses' );
      const response = await this.database.put( body );
      ctx.status = 200;
      ctx.body = response;
      ctx.set( 'Content-Type', 'application/json' );
    } catch( e ) {
      ctx.status = 500;
      ctx.body = {
        // @ts-ignore
        message: e.message
      };
      ctx.set( 'Content-Type', 'application/json' )
    }
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    try {
      this.database.connect( 'addresses' );
      if( ctx.request.query.id ) {
        const docname = ctx.request.query.id;
        if( Array.isArray( docname ) ) {
          const collection = await Promise.all( docname.map( id => this.database.get( id ) ) );
          const deletedList: (nano.DocumentGetResponse & addressesI)[] = [];
          for( const item of collection ) {
            if( item === undefined )
              continue;
            deletedList.push( item );
          }
          const result = await Promise.all( deletedList.map( item => this.database.delete( item ) ) );
          this.database.connect( 'address' );
          const deletedAddress: (nano.DocumentGetResponse & addressI)[] = [];
          for( const element of deletedList ) {
            const ids = [ element.home, element.post ];
            const collection = await Promise.all( ids.map( id => this.database.get( id ) ) );
            // @ts-ignore
            deletedAddress.push( ...collection );
          }
          // @ts-ignore
          await Promise.all( deletedAddress.map( element => this.database.delete( element ) ) );
          let success = 0;
          for( const item of result ) {
            if( item?.ok )
              success++;
          }
          ctx.status = 200;
          ctx.body = { message: `Deleted ${success} elements` };
          ctx.set( 'Content-Type', 'application/json' );
        } else {
          const doc = await this.database.get( docname );
          if( doc ) {
            const result = await this.database.delete( doc );
            this.database.connect( 'address' );
            const ids = [ doc.home, doc.post ];
            const docs = await Promise.all( ids.map( id => this.database.get( id ) ) );
            // @ts-ignore
            await Promise.all( docs.map( doc => this.database.delete( doc ) ) );
            if( result?.ok ) {
              ctx.status = 200;
              ctx.body = { message: 'Delete elements' };
              ctx.set( 'Content-Type', 'application/json' );
            } else {
              ctx.status = 400;
              ctx.body = { message: 'Error' };
              ctx.set( 'Content-Type', 'application/json' );
            }
          }
        }
      } else {
        const body = ctx.request.body;
        if( Array.isArray( body ) ) {
          this.database.connect( 'address' );
          await Promise.all( body.map( item => this.database.delete( item.home._id ) ) )
          await Promise.all( body.map( item => this.database.delete( item.post._id ) ) );
          for( let i = 0; i < body.length; i++ ) {
            body[i].home = body[i].home._id;
            body[i].post = body[i].post._id;
          }
          this.database.connect( 'addresses' );
          await Promise.all( body.map( item => this.database.delete( item ) ) );
          ctx.status = 200;
          ctx.body = { message: 'Delete elements' };
          ctx.set( 'Content-Type', 'application/json' );
        } else {
          this.database.connect( 'address' );
          await this.database.delete( body.home._id );
          await this.database.delete( body.post._id );
          this.database.connect( 'addresses' );
          body.home = body.home._id;
          body.post = body.post._id;
          const result = await this.database.delete( body );
          if( result?.ok ) {
            ctx.status = 200;
            ctx.body = { message: 'Delete elements' };
            ctx.set( 'Content-Type', 'application/json' );
          } else {
            ctx.status = 400;
            ctx.body = { message: 'Error' };
            ctx.set( 'Content-Type', 'application/json' );
          }
        }
      }
    } catch( e ) {
      ctx.status = 500;
      ctx.body = {
        // @ts-ignore
        message: e.message
      };
      ctx.set( 'Content-Type', 'application/json' )
    }
  }
}

export = Address;
