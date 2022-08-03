import Router = require( 'koa-router' );
import Database = require( '../Database' );
import configType from '../../configureTypes';
import nano = require('nano');

abstract class Controller<T> {
  database: Database<T>;
  constructor() {
    if( this.constructor === Controller ) {
      throw new Error( 'This is a abstract class.' );
    }
    const config: configType = require( '../../configure.json' );
    this.database = new Database<T>(
      config.database.login, config.database.password, config.database.host, config.database.port
    );
  }

  async getContent( document: string, ctx: Router.RouterContext<any, {}> ) {
    try {
      this.database.connect( document );
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
  }

  async postContent( document: string, ctx: Router.RouterContext<any, {}> ) {
    try {
      this.database.connect( document );
      const response = await this.database.post( ctx.request.body );
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

  async putContent( document: string, ctx: Router.RouterContext<any, {}> ) {
    try {
      this.database.connect( document );
      const response = await this.database.put( ctx.request.body );
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

  async deleteContent( document: string, ctx: Router.RouterContext<any, {}> ) {
    try {
      this.database.connect( document );
      if( ctx.request.query.id ) {
        const docname = ctx.request.query.id;
        if( Array.isArray( docname ) ) {
          const collection = await Promise.all( docname.map( id => this.database.get( id ) ) );
          const deleted: (nano.DocumentGetResponse & T)[] = [];
          for( const item of collection ) {
            if( item === undefined )
              continue;
            deleted.push( item );
          }
          const result = await Promise.all( deleted.map( item => this.database.delete( item ) ) );
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
          await Promise.all( body.map( item => this.database.delete( item ) ) );
          ctx.status = 200;
          ctx.body = { message: 'Delete elements' };
          ctx.set( 'Content-Type', 'application/json' );
        } else {
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

export = Controller;