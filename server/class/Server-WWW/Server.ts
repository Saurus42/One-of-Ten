import Koa = require( 'koa' );
import http = require( 'http' );
import http2 = require( 'http2' );
import bodyParser = require('koa-body');
import xmlParser = require( 'koa-xml-body' );
import router = require( '../../www/api/routes' );
import jwt = require( 'koa-jwt' );
import fs = require( 'fs' );
import uuid = require( 'uuid' );
import { Server as Serve, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Game = require('../Game');

class Server {
  private config: Koa<Koa.DefaultState, Koa.DefaultContext>
  private server11: http.Server
  private server20: http2.Http2SecureServer
  private lastQuest: Map<string, any>
  private counter: Map<string, number>
  private raport: Map<string, any>
  private socket: Serve
  private games: Map<string, Game>
  get server() {
    return this.server20;
  }
  constructor( socket: Serve ) {
    this.socket = socket;
    this.config = new Koa();
    this.games = new Map();
    this.lastQuest = new Map();
    this.counter = new Map();
    this.raport = new Map();
    this.setConfig();
    this.server11 = http.createServer( this.config.callback() );
    this.server20 = http2.createSecureServer( {
      allowHTTP1: true,
      cert: fs.readFileSync( './cert/cert.pem', { encoding: 'utf-8' } ),
      key: fs.readFileSync( './cert/privkey.pem', { encoding: 'utf-8' } )
    }, this.config.callback() );
    this.setSocket();
    this.connection();
  }

  private setSocket() {
    this.socket.listen( this.server as any, {
      serveClient: true,
      path: '/room'
    } );
    this.socket.engine.generateId = ( req: any ) => {
      return uuid.v4();
    }
  }

  private newClient( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return async ( room: string ) => {
      await socket.join( room );
      socket.in( room ).emit( 'active-room', true );
      this.getList( socket )( room, 'show' );
      this.isRoom( socket )( room );
    }
  }

  private isRoom( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return async ( room: string ) => {
      const ROOM = this.socket.sockets.adapter.rooms.get( room );
      if( ROOM ) {
        socket.emit( 'active-room', true );
      } else {
        socket.emit( 'active-room', false );
      }
    }
  }

  private isGame( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return async ( room: string ) => {
      const game = this.games.get( room );
      if( game ) {
        socket.in( room ).emit( 'active-game', true );
      } else {
        socket.in( room ).emit( 'active-game', false );
      }
    }
  }

  private re1( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, data: any ) => {
      socket.in( room ).emit( 'server-request', data );
    }
  }

  private re2( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, data: any ) => {
      socket.in( room ).emit( 'server-respond', data );
    }
  }

  private leave( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return async ( room: string, id: string ) => {
      await socket.leave( room );
      const ROOM = this.socket.sockets.adapter.rooms.get( room );
      if( ROOM ) {
        const clients = ROOM.size;
        if( clients > 0 ) {
          if( clients <= 2 )
            socket.in( room ).emit( 'leave-room', id );
            socket.emit( 'leave-room', id );
          this.socket.sockets.adapter.rooms.get( room )?.delete( id );
        }
      }
    }
  }

  private getList( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return async ( room: string, type: string ) => {
      const tab = [];
      const ROOM = this.socket.sockets.adapter.rooms.get( room )
      if( ROOM ) {
        for( const value of ROOM )
          tab.push( value );
        socket.emit( `list-${type}`, tab );
        socket.in( room ).emit( `list-${type}`, tab )
      }
    }
  }

  private listPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string ) => {
      const game = this.games.get( room );
      if( game ){
        socket.in( room ).emit( 'list-player', game.players );
        socket.emit( 'list-player', game.players );
      }
    }
  }

  private startPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'start-player', id );
      socket.emit( 'start-player', id );
    }
  }

  private startedPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, answer: boolean ) => {
      socket.in( room ).emit( 'started-player', answer );
    }
  }

  private deletePlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      this.games.get( room )?.deleteUser( id );
      socket.in( room ).emit( 'delete-player', id );
      socket.emit( 'delete-player', id );
    }
  }

  private lastPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string ) => {
      socket.in( room ).emit( 'last-player' );
      socket.emit( 'last-player' );
    }
  }

  private nextPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string ) => {
      socket.in( room ).emit( 'next-player' );
      socket.emit( 'next-player' );
    }
  }

  private savePlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'save-player', id );
      socket.emit( 'save-player', id );
    }
  }

  private selectedPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string, from: string ) => {
      socket.in( room ).emit( 'selected-player', id, from );
      socket.emit( 'selected-player', id, from );
    }
  }

  private selectPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'select-player', id );
      socket.emit( 'select-player', id );
    }
  }

  private selectQuest( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'select-quest', id );
      socket.emit( 'select-quest', id );
    }
  }

  private updatePlayers( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, players: string[] ) => {
      socket.in( room ).emit( 'update-players', players );
      socket.emit( 'update-players', players );
    }
  }

  private firstPlayer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'first-player', id );
      socket.emit( 'first-player', id );
    }
  }

  private startGame( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, teacher: string ) => {
      socket.in( room ).emit( 'start-game' );
      socket.emit( 'start-game' );
      this.games.set( room, new Game( teacher, room ) );
      this.counter.set( room, 0 );
    }
  }
  private joinGame( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, student: string ) => {
      socket.in( room ).emit( 'start-game' );
      socket.emit( 'start-game' );
      const game = this.games.get( room )
      game?.addUser( student );
      this.listPlayer( socket )( room );
    }
  }
  private endGame( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'end-game', id );
      socket.emit( 'end-game', id );
    }
  }
  private quest( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, weight: string ) => {
      if( weight === 'teacher' ) {
        const question = this.games.get( room )?.randomQuestion();
        this.lastQuest.set( room, question );
        socket.in( room ).emit( 'quest', question );
        socket.emit( 'quest', question );
      }
    }
  }
  private questLast( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string ) => {
      socket.emit( 'last-quest', this.lastQuest.get( room ) );
    }
  }
  private answer( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, answer: boolean, id: string ) => {
      socket.in( room ).emit( 'answer', answer, id );
      socket.emit( 'answer', answer, id );
    }
  }
  private etap1( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'etap-1' );
      socket.emit( 'etap-1', true );
    }
  }
  private etap2( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string, HP: number ) => {
      socket.in( room ).emit( 'etap-2', id, HP );
      socket.emit( 'etap-2', id, HP );
    }
  }
  private etap3( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string, HP: number ) => {
      socket.in( room ).emit( 'etap-3', id, HP );
      socket.emit( 'etap-3', id, HP );
    }
  }
  private win( socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> ) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'win', id );
      socket.emit( 'win', id );
      this.lastQuest.delete( room );
      this.games.delete( room );
    }
  }

  private connection() {
    this.socket.on( 'connection', socket => {
      socket.emit( 'me', socket.id );
      socket.on( 'start-game', this.startGame( socket ) );
      socket.on( 'join-game', this.joinGame( socket ) );
      socket.on( 'end-game', this.endGame( socket ) );
      socket.on( 'quest', this.quest( socket ) );
      socket.on( 'last-quest', this.questLast( socket ) );
      socket.on( 'answer', this.answer( socket ) );
      socket.on( 'etap-1', this.etap1( socket ) );
      socket.on( 'etap-2', this.etap2( socket ) );
      socket.on( 'etap-3', this.etap3( socket ) );
      socket.on( 'new-client', this.newClient( socket ) );
      socket.on( 'is-room', this.isRoom( socket ) );
      socket.on( 'is-game', this.isGame( socket ) );
      socket.on( 'request', this.re1( socket ) );
      socket.on( 'respond', this.re2( socket ) );
      socket.on( 'leave-room', this.leave( socket ) );
      socket.on( 'list', this.getList( socket ) );
      socket.on( 'list-player', this.listPlayer( socket ) );
      socket.on( 'last-player', this.lastPlayer( socket ) );
      socket.on( 'delete-player', this.deletePlayer( socket ) );
      socket.on( 'next-player', this.nextPlayer( socket ) );
      socket.on( 'save-player', this.savePlayer( socket ) );
      socket.on( 'update-players', this.updatePlayers( socket ) );
      socket.on( 'selected-player', this.selectedPlayer( socket ) );
      socket.on( 'select-player', this.selectPlayer( socket ) );
      socket.on( 'select-quest', this.selectQuest( socket ) );
      socket.on( 'start-player', this.startPlayer( socket ) );
      socket.on( 'started-player', this.startedPlayer( socket ) );
      socket.on( 'win', this.win( socket ) );
      socket.on( 'first-player', this.firstPlayer( socket ) );
      socket.on( 'game-over', this.gameOver( socket ) );
      socket.on( 'down-HP', this.downHP( socket ) );
      socket.on( 'next-etap', this.nextEtap( socket ) );
      socket.on( 'next-part', this.nextPart( socket ) );
      socket.on( 'save-progress', this.saveProgress( socket ) );
      socket.on( 'raport', this.getProgress( socket ) );
    } );
  }

  private saveProgress(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): (...args: any[]) => void {
    return ( room: string, name: string, data: any[] ) => {
      let progress = this.raport.get( room );
      if( progress === undefined ) {
        progress = {} as any;
      }
      progress[name] = data;
      this.raport.set( room, progress );
    }
  }

  private getProgress(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): (...args: any[]) => void {
    return ( room: string ) => {
      let raport = this.raport.get( room );
      if( raport === undefined )
        raport = {};
      raport = JSON.stringify( raport );
      socket.emit( 'raport', raport );
      socket.in( room ).emit( 'raport', raport );
    }
  }

  private nextEtap(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    return ( room: string, players: any[], HP?: number ) => {
      let count = this.counter.get( room );
      if( count !== undefined ) {
        this.counter.set( room, ++count );
        let withoutUndefined = 0;
        for( let i = 0; i < players.length; i++ )
          if( players[i] !== undefined && players[i] !== null )
            withoutUndefined++;
        if( withoutUndefined === count ) {
          socket.in( room ).emit( 'next-etap', HP );
          socket.emit( 'next-etap', HP );
          this.counter.set( room, 0 );
        }
      }
    }
  }

  private downHP(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'down-HP', id );
      socket.emit( 'down-HP', id );
    }
  }

  private nextPart(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'next-part', id );
      socket.emit( 'next-part', id );
    }
  }

  private gameOver(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    return ( room: string, id: string ) => {
      socket.in( room ).emit( 'game-over', id );
      socket.emit( 'game-over', id );
    }
  }

  private setConfig() {
    this.config.use( xmlParser( { key: 'xmlbody' } ) );
    this.config.use( bodyParser( { multipart: true, urlencoded: true, json: true } ) );
    this.config.use( router.router.routes() );
    this.config.use( router.router.allowedMethods() );
    this.config.use( jwt( {
      secret: fs.readFileSync( './cert/publicKey.pem', { encoding: 'utf-8' } ),
      key: fs.readFileSync( './cert/privkey.pem', { encoding: 'utf-8' } )
    } ).unless( { path: [ /\/login/, /\//, /.*\.png/, /.*\.js/, /.*\.ts/, /.*\.tsx/, /.*\.css/, /.*\.scss/ ] } ) );
  }

  static start( socket: Serve ) {
    return new Server( socket );
  }
}

export = Server;
