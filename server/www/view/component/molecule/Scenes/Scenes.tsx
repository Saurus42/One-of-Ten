import React = require( 'react' );
import Etap1 = require( '../../atom/Etap1' );
import Etap2 = require( '../../atom/Etap2' );
import Etap3 = require( '../../atom/Etap3' );
import send = require( '../../../../../functions/send' );
import Type = require( '../../../../../typingConfig' );
import History = require( '../../atom/History' );
import Theme = require('../Theme');
import { socket } from '../../atom/Socket';

interface props {}
interface state {
  users: Set<string>
  players: any[]
  copyPlayers: any[]
  HP: number
  playersWin: string
  name: string
  scale: number
  activeGame: boolean
  endGame: boolean
  clicked: boolean
  firstLog: boolean
  selected: string | null
  chance: number
  quest: any
  scenes: Map<string, JSX.Element>
  currentScene: string
  gameOver: boolean
  names: string[]
  paths: string[]
}

class Scenes extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      users: new Set(),
      players: [],
      copyPlayers: [],
      quest: {},
      HP: 3,
      scenes: new Map(),
      currentScene: '',
      playersWin: '',
      activeGame: false,
      endGame: false,
      firstLog: true,
      clicked: false,
      scale: 32,
      selected: null,
      name: '',
      chance: 3,
      gameOver: false,
      names: [],
      paths: []
    }
  }

  private item = 0;

  private initGame( weight: string ): void {
    let role = localStorage.getItem( 'role' );
    if( role === null )
      role = '';
    role = role.slice( 0, role.length - 1 );
    this.state.scenes.set( 'Etap 1', <Etap1 weight={ role } start={ this.nextScene } /> );
    this.state.scenes.set( 'Etap 2', <Etap2 weight={ role } start={ this.nextScene } allPlayers={ this.getPlayers } getHP={ this.getHP } /> );
    this.state.scenes.set( 'Etap 3', <Etap3 weight={ role } start={ this.nextScene } allPlayers={ this.getPlayers } getPoints={ this.getHP }/> );
    this.setState( { currentScene: 'Etap 1' } );
  }

  private getPlayers = () => ( { players: this.state.players, copy: this.state.copyPlayers } );

  private getHP = () => this.state.HP;

  private nextScene = ( next: string, players1: any[], players2: any[], HP: number ) => {
    this.setState( { currentScene: next, players: players1, copyPlayers: players2, HP } );
  }

  private generateTable( head: boolean ) {
    const tr: JSX.Element[] = [];
    if( head ) {
      const header = [
        <div className="td head">Imię i nazwisko</div>,
        <div className="td head">Lista pytań</div>,
        <div className="td head">Lista poprawnych odpowiedzi</div>,
        <div className="td head">Lista błędnych odpowiedzi</div>
      ];
      tr.push( <div className="tr">{header}</div> );
    }
    const copy = this.state.copyPlayers;
    if( Array.isArray( copy ) ) {
      for( let i = 0; i < this.state.copyPlayers.length; i++ ) {
        const player = this.state.copyPlayers[i];
        const name = <div className="td">{player.firstName} {player.surname}</div>
        tr.push( <div className="tr">{name}</div> );
      }
    } else if( typeof copy === 'object' ) {
      console.log( copy );
      for( const [ key, value ] of Object.entries( copy as any ) ) {
        tr.push( <div className="tr">
          <div className="col-sm-12">{key}</div>
        </div> );
        for( let i = 0; i < (value as any[]).length; i++ ) {
          const player = (value as any[])[i];
          const name = <div className="td">{player.student}</div>
          const quest = <div className="td">{player.allQuests}</div>
          const good = <div className="td">{player.goodAnswer}</div>
          const bad = <div className="td">{player.badAnswer}</div>
          tr.push( <div className="tr">{name}{quest}{good}{bad}</div> );
        }
      }
    }
    return <div className="table">{tr}</div>
  }

  private socketLeaveRoom = () => {
    this.state.users.clear();
    socket.saved?.client.emit( 'list', localStorage.getItem( 'room' ), 'show' );
  }

  private socketActiveGame = ( active: boolean ) => {
    if( !this.state.activeGame )
      this.setState( { activeGame: active } );
  }

  private socketListShow = ( list: string[] ) => {
    const users = new Set<string>();
    list.map( v => users.add( v ) );
  }

  private socketWin = async ( id: string, raport: any[] ) => {
    let role = localStorage.getItem( 'role' );
    if( role === null )
      role = '';
    role = role.slice( 0, role.length - 1 );
    let win = '';
    const config: Type = require( '../../../../../config.json' );
    const players = await send( `${location.protocol}://${location.host}:${config.port}/${config.api}/users?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem( 'room' )}`
      }
    } ).then( res => res.json() );
    win = `${players.surname} ${players.firstName}`;
    if( role === 'teacher' )
      socket.saved?.client.emit( 'raport', localStorage.getItem( 'room' ) );
    this.setState( { endGame: true, activeGame: false, playersWin: win, copyPlayers: raport } )
  }

  private socketEtap1 = ( active: boolean ) => {
    let role = localStorage.getItem( 'role' );
    if( role === null )
      role = '';
    role = role.slice( 0, role.length - 1 );
    this.initGame( role );
  }

  private socketListPlayer = async ( list: any[] ) => {
    this.setState( { players: list } );
  }

  private socketRaport = async ( rap: string ) => {
    this.setState( { copyPlayers: JSON.parse(rap) } );
  }

  private socketEndGame = ( id: string ) => {
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i] === undefined || this.state.players[i] === null )
        continue;
      if( this.state.players[i]._id === id )
        delete this.state.players[i];
    }
  }

  private socketGameOver = ( id: string ) => {
    if( localStorage.getItem( 'ID' ) === id ) {
      this.setState( { gameOver: true } );
      socket.saved?.client.emit( 'list-player', localStorage.getItem( 'room' ) );
    }
  }

  private socketStartGame = () => {
    this.setState( { activeGame: true } );
    socket.saved?.client.emit( 'list-player', localStorage.getItem( 'room' ) );
  }

  private socketLastQuest = ( quest: any ) => {
    this.setState( { quest } );
  }

  private socketQuest = async ( quest: any ) => {
    this.setState( { quest } );
  }

  componentDidMount(): void {
    if( this.state.names.length === 0 ) {
      // Przygotowanie socketów
      socket.saved?.client.on( 'leave-room', this.socketLeaveRoom );
      socket.saved?.client.on( 'list-show', this.socketListShow );
      socket.saved?.client.on( 'active-game', this.socketActiveGame );
      socket.saved?.client.on( 'win', this.socketWin );
      socket.saved?.client.on( 'etap-1', this.socketEtap1 );
      socket.saved?.client.on( 'list-player', this.socketListPlayer );
      socket.saved?.client.on( 'raport', this.socketRaport );
      socket.saved?.client.on( 'end-game', this.socketEndGame );
      socket.saved?.client.on( 'game-over', this.socketGameOver );
      socket.saved?.client.on( 'start-game', this.socketStartGame );
      socket.saved?.client.on( 'last-quest', this.socketLastQuest );
      socket.saved?.client.on( 'quest', this.socketQuest );
      let weight = localStorage.getItem( 'role' );
      if( weight === null )
        weight = '';
      weight = weight.slice( 0, weight.length - 1 );
      let names = [];
      let paths = [];
      if( weight === 'teacher' ) {
        names = [ 'Strona Główna', 'Dodaj pytanie', 'Wyświetl pytania', 'Klasy', 'Wyloguj' ];
        paths = [ '/teachers', '/quests/add', '/quests/show', '/classes', '/logout' ];
      } else {
        names = [ 'Strona Główna', 'Klasy', 'Wyloguj' ];
        paths = [ '/students', '/classes', '/logout' ];
      }
      this.setState( { names, paths } );
    }
  }

  private back = () => {
    socket.saved?.client.emit( 'leave', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ) );
    socket.saved?.client.disconnect();
    History.push( '/classes' );
  }

  private joinGame = () => {
    socket.saved?.client.emit( 'join-game', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ) );
    this.setState( { clicked: true } );
  }

  private gameButton(): JSX.Element | null {
    let role = localStorage.getItem( 'role' );
    if( role === null )
      role = '';
    role = role.slice( 0, role.length - 1 );
    if( role === 'student' ) {
      if( this.state.activeGame && !this.state.clicked )
        return <div className="col-sm-3"><button type="button" onClick={ this.joinGame }>Dołącz do gry</button></div>
      else
        return <div className="col-sm-3"></div>
    } else
      if( this.state.activeGame )
        return <div className="col-sm-3"><button type="button" onClick={ () => { socket.saved?.client.emit( 'etap-1', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ) ) } }>Start</button></div>
      else
        return <div className="col-sm-3"><button type="button" onClick={ () => { socket.saved?.client.emit( 'start-game', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ) ) } }>Rozpocznij grę</button></div>
  }

  private getContent(): JSX.Element | undefined {
    if( this.state.endGame ) {
      return <div className="row">
        <div className="col-sm">
          Zwycięzcą jest {this.state.playersWin}<br/>
          {this.generateTable( true )}
        </div>
      </div>
    } else if( this.state.gameOver ) {
      return <div className="row">
        <div className="col-sm">
          Przegrałeś/aś.
        </div>
      </div>
    } else {
      return this.state.scenes.get( this.state.currentScene );
    }
  }

  render(): JSX.Element {
    return <Theme vertical={false} paths={this.state.paths} names={this.state.names}>
    <div className="row scenes">
      <div className="col-sm-3"><button type="button" onClick={ this.back }>Rozłącz się</button></div>
      { this.gameButton() }
      <div className="col-sm-3 text">Uczestnicy {this.state.users.size}</div>
      <div className="col-sm-3 text">Dołączeni do gry {this.state.players.length}</div>
    </div>
    { this.getContent() }
  </Theme>
  }
}

export = Scenes;