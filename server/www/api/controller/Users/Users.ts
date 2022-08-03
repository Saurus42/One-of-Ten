import Router = require( 'koa-router' );
import Controller = require( '../../../../class/Controller' );
import jwt = require( 'jsonwebtoken' );
import crypto = require( 'crypto' );
import fs = require( 'fs' );
import nano = require('nano');

interface usersI {
  login?: string
  password?: string
  firstName: string
  mail?: string
  lastName: string
  surname: string
  address?: string
  weight?: string
  points?: string
}

class Users extends Controller<usersI> {
  constructor() {
    super();
  }

  login = async ( ctx: Router.RouterContext<any, {}> ) => {
    this.database.connect( 'users' );
    const body = ctx.request.body;
    const list = await this.database.list;
    const collection = await Promise.all( list.rows.map( row => this.database.get( row.id ) ) );
    const cert = fs.readFileSync( './cert/cert.pem', { encoding: 'utf-8' } );
    for( const element of collection ) {
      if( element ) {
        const password = crypto.createHmac( 'sha1', cert ).update( body.password ).digest( 'hex' );
        if( element.login === body.login && element.password === password ) {
          ctx.status = 200;
          ctx.body = {
            token: jwt.sign( { role: element.weight, id: element._id }, fs.readFileSync( './cert/privKey.pem' ), { algorithm: 'RS256' } ),
            message: 'Successfully logged in.'
          };
          ctx.set( 'Content-Type', 'application/json' );
          return
        }
      }
    }
    ctx.status = 401;
    ctx.body = {
      message: 'Authentication failed.'
    };
    ctx.set( 'Content-Type', 'application/json' );
  }

  // Wyświetlanie danych
  get = async ( ctx: Router.RouterContext<any, {}> ) => {
    try {
      this.database.connect( 'users' );
      if( ctx.request.query.id ) {
        const docname = ctx.request.query.id as any as string;
        const weight = ctx.request.query.type as any as string;
        const doc = await this.database.get( docname ) as any as nano.DocumentGetResponse & usersI;
        if( weight ) {
          if( doc.weight === weight ) {
            ctx.status = 200;
            ctx.body = doc;
            ctx.set( 'Content-Type', 'application/json' );
          } else {
            ctx.status = 404;
            ctx.body = {};
            ctx.set( 'Content-Type', 'application/json' );
          }
        } else {
          ctx.status = 200;
          ctx.body = doc;
          ctx.set( 'Content-Type', 'application/json' );
        }
      } else if( ctx.request.query.type ) {
        const weight = ctx.request.query.type as any as string;
        const list = await this.database.list;
        const collection = await Promise.all( list.rows.map( row => this.database.get( row.id ) ) ) as any as (nano.DocumentGetResponse & usersI)[];
        const response: (nano.DocumentGetResponse & usersI)[] = [];
        for( let i = 0; i < collection.length; i++ ) {
          if( collection[i].weight === weight ) {
            delete collection[i].address;
            delete collection[i].login;
            delete collection[i].mail;
            delete collection[i].password;
            delete collection[i].points;
            delete collection[i].weight;
            response.push( collection[i] );
          }
        }
        ctx.status = 200;
        ctx.body = response;
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
    // await this.getContent( 'users', ctx );
  }

  // Dodawanie danych
  post = async ( ctx: Router.RouterContext<any, {}> ) => {
    const cert = fs.readFileSync( './cert/cert.pem', { encoding: 'utf-8' } );
    ctx.request.body.password = crypto.createHmac( 'sha1', cert ).update( ctx.request.body.password ).digest( 'hex' );
    await this.putContent( 'users', ctx );
  }

  // Aktualizacja danych
  put = async ( ctx: Router.RouterContext<any, {}> ) => {
    const cert = fs.readFileSync( './cert/cert.pem', { encoding: 'utf-8' } );
    ctx.request.body.password = crypto.createHmac( 'sha1', cert ).update( ctx.request.body.password ).digest( 'hex' );
    await this.putContent( 'users', ctx );
  }

  // Usuwanie danych
  delete = async ( ctx: Router.RouterContext<any, {}> ) => {
    await this.deleteContent( 'users', ctx );
  }
}

export = Users;
