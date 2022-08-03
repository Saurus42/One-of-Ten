import React = require( 'react' );
import sendToServer = require( '../../../../functions/send' );
import Type = require( '../../../../typingConfig' );
import Message = require( '../Message' );
import { socket } from '../Socket';
import Scene = require( '../Scene' );

interface props {
  weight: string
  start: ( name: string, players1: any[], players2: any[], HP: number ) => void
}

interface state {
  players: any[]
  playersAnswers: boolean[]
  off: boolean[]
  activate: boolean
  quest: any
  firstInit: boolean
  answer: JSX.Element
  rounds: number
  badAnswer: number
  timer: number
  time: number
  newEtap: number
  listQuest: Map<string, number>
  listGoodAnswer: Map<string, number>
  listBadAnswer: Map<string, number>
  copyPlayers: any[]
}

var HP = 3;

class Etap1 extends Scene<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      players: [],
      copyPlayers: [],
      playersAnswers: [],
      off: [],
      activate: false,
      quest: {},
      firstInit: true,
      answer: <p></p>,
      rounds: 0,
      newEtap: 0,
      badAnswer: 2,
      timer: 0,
      time: 10,
      listQuest: new Map(),
      listGoodAnswer: new Map(),
      listBadAnswer: new Map()
    }
  }

  private runPlayer( ID: string, answered: boolean ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
    return ( event: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
      if( !answered )
        socket.saved?.client.emit( 'start-player', localStorage.getItem( 'room' ), ID );
    }
  }

  private socketAnswer = ( answer: boolean, id: string ) => {
    if( answer && this.props.weight === 'teacher' ) {
      let num = this.state.listQuest.get( id );
      if( num === undefined )
        num = 0;
      num += 1;
      this.state.listQuest.set( id, num );
      num = this.state.listGoodAnswer.get( id );
      if( num === undefined )
        num = 0;
      num += 1;
      this.state.listGoodAnswer.set( id, num );
      let index = -1;
      for( let i = 0; i < this.state.playersAnswers.length; i++ ) {
        if( this.state.players[i]._id !== id )
          continue;
        else {
          this.state.playersAnswers[i] = true;
          index = i;
          break;
        }
      }
      const player = this.state.players[index];
      const answer = <Message content={`Poprawną odpowiedź dał ${player.firstName} ${player.surname}.`} />;
      socket.saved?.client.emit( 'quest', localStorage.getItem( 'room' ), this.props.weight );
      this.setState( { answer } );
    } else if( !answer && this.props.weight === 'teacher' ) {
      let num = this.state.listQuest.get( id );
      if( num === undefined )
        num = 0;
      num += 1;
      this.state.listQuest.set( id, num );
      num = this.state.listBadAnswer.get( id );
      if( num === undefined )
        num = 0;
      num += 1;
      this.state.listBadAnswer.set( id, num );
      let index = -1;
      for( let i = 0; i < this.state.playersAnswers.length; i++ ) {
        if( this.state.players[i]._id !== id )
          continue;
        else {
          this.state.playersAnswers[i] = true;
          index = i;
          break;
        }
      }
      const player = this.state.players[index];
      const answer = <Message content={`Błędną odpowiedź dał ${player.firstName} ${player.surname}.`} />;
      socket.saved?.client.emit( 'quest', localStorage.getItem( 'room' ), this.props.weight );
      socket.saved?.client.emit( 'down-HP', localStorage.getItem( 'room' ), id );
      this.setState( { answer } );
    } else {
      this.setState( { activate: false } );
      for( let i = 0; i < this.state.playersAnswers.length; i++ ) {
        if( this.state.players[i]._id !== id )
          continue;
        else {
          const off = this.state.off;
          if( answer && this.state.players[i]._id === id ) {
            let rounds = this.state.rounds + 1;
            if( rounds === 2 ) {
              socket.saved?.client.emit( 'next-etap', localStorage.getItem( 'room' ), this.state.players );
              off[i] = true;
            }
            this.setState( { rounds: rounds } );
          } else if( !answer && this.state.players[i]._id === id ) {
            let round = this.state.rounds + 1;
            if( round === 2 ) {
              off[i] = true;
            }
          }
          this.setState( { off } )
          break;
        }
      }
    }
  }

  private socketStartPlayer = ( id: string ) => {
    if( localStorage.getItem( 'ID' ) === id ) {
      this.setState( {
        activate: true,
        timer: window.setInterval( this.interval, 1000 )
      } );
    }
    if( this.state.quest === undefined )
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
  }

  private socketLastQuest = ( quest: any ) => {
    this.setState( { quest } );
  }

  private socketQuest = ( quest: any ) => {
    let all = false;
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.off[i] )
        continue
      if( this.state.playersAnswers[i] )
        all = true;
      else {
        all = false;
        break;
      }
    }
    const answer = this.state.playersAnswers;
    const off = this.state.off;
    if( all )
      for( let i = 0; i < answer.length; i++ ) {
        if( off[i] )
          continue;
        answer[i] = false;
      }
    this.setState( { quest, playersAnswers: answer, off } );
  }

  private socketDeletePlayer = ( id: string ) => {
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i]._id === id ) {
        delete this.state.players[i];
        break;
      }
    }
    socket.saved?.client.emit( 'list-player', localStorage.getItem( 'room' ) );
  }

  private socketEtap2 = ( id: string, HP: number ) => {
    if( id === localStorage.getItem( 'ID' ) ) {
      socket.saved?.client.removeListener( 'answer', this.socketAnswer );
      socket.saved?.client.removeListener( 'start-player', this.socketStartPlayer );
      socket.saved?.client.removeListener( 'last-quest', this.socketLastQuest );
      socket.saved?.client.removeListener( 'delete-player', this.socketDeletePlayer );
      socket.saved?.client.removeListener( 'etap-2', this.socketEtap2 );
      socket.saved?.client.removeListener( 'quest', this.socketQuest );
      socket.saved?.client.removeListener( 'list-player', this.socketListPLayer );
      socket.saved?.client.removeListener( 'down-HP', this.socketDownHP );
      socket.saved?.client.removeListener( 'next-etap', this.socketNextEtap );
      const students = [];
      for( let i = 0; i < this.state.copyPlayers.length; i++ ) {
        const player = this.state.copyPlayers[i];
        students.push( {
          student: `${player.firstName} ${player.surname}`,
          allQuests: this.state.listQuest.get( player._id ),
          goodAnswer: this.state.listGoodAnswer.get( player._id ),
          badAnswer: this.state.listBadAnswer.get( player._id )
        } );
      }
      this.props.start( 'Etap 2', this.state.players, this.state.copyPlayers, HP );
      if( this.props.weight === 'teacher' )
        socket.saved?.client.emit( 'save-progress', localStorage.getItem( 'room' ), 'Etap 1', students );
    }
  }

  private socketNextEtap = () => {
    socket.saved?.client.emit( 'etap-2', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ), HP );
  }

  private socketDownHP = ( id: string ) => {
    if( localStorage.getItem( 'ID' ) === id ) {
      HP--;
      const rounds = this.state.rounds + 1;
      const badAnswer = this.state.badAnswer - 1;
      if( rounds === 2 )
        socket.saved?.client.emit( 'next-etap', localStorage.getItem( 'room' ), this.state.players, HP );
      this.setState( { rounds, badAnswer } );
      if( badAnswer === 0 ) {
        socket.saved?.client.emit( 'end-game', localStorage.getItem( 'room' ), id );
        socket.saved?.client.emit( 'delete-player', localStorage.getItem( 'room' ), id );
        socket.saved?.client.emit( 'game-over', localStorage.getItem( 'room' ), id );
      }
    }
  }

  private socketListPLayer = async ( list: string[] ) => {
    const config: Type = require( '../../../../config.json' );
    const players: any[] = [];
    const copy: any[] = []
    for( const id of list ) {
      players.push( await sendToServer( `${location.protocol}//${location.host}:${config.port}/${config.api}/users?id=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
        }
      } ).then( res => res.json() ) );
    }
    const answer = [];
    const off = [];
    for( let i = 0; i < players.length; i++ ) {
      copy.push( players[i] );
      answer.push( false );
      off.push( false );
    }
    this.setState( { copyPlayers: copy, playersAnswers: answer, off, players } );
  }

  private createPlayers(): JSX.Element {
    const buttons: JSX.Element[] = [];
    let index = 0;
    let i = 0;
    const rows: JSX.Element[] = [];
    for( const player of this.state.players ) {
      const answer = this.state.playersAnswers[i++];
      const className = answer ? "disable" : "active";
      buttons.push( <div className={className} onClick={ this.runPlayer( player._id, answer ) }>{player.firstName} {player.surname}</div> );
      index += 3;
      if( index >= 12 ) {
        rows.push( <div className="scenes-player">{buttons.splice( 0, buttons.length )}</div> );
        index = 0;
      }
    }
    if( index < 12 && index > 0 )
      rows.push( <div className="scenes-player">{buttons.splice( 0, buttons.length )}</div> );
    return <div className="scenes-all-players">{rows}</div>
  }

  protected viewTitle(): JSX.Element {
    if( this.state.quest._id === undefined )
      return <>
        <div className="scenes-category">
          <div className="category"><p></p></div>
        </div>
        <div className="scenes-content">
          <div className="content"><p></p></div>
        </div>
      </>
    return <>
      <div className="scenes-category">
        <div className="category">
          <p>{ this.state.quest.category === '' ? 'Brak kategorii' : this.state.quest.category }</p>
        </div>
      </div>
      <div className="scenes-content">
        <div className="content">
          <p>{ this.state.quest.question }</p>
        </div>
      </div>
    </>
  }

  protected send( answer: boolean ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
    return ( event: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
      clearInterval( this.state.timer );
      this.setState( { timer: 10 } );
      socket.saved?.client.emit( 'answer', localStorage.getItem( 'room' ), answer, localStorage.getItem( 'ID' ) );
    }
  }

  protected showStatus(): JSX.Element {
    return <>
      <div className="scenes-status">
        <div className="status"><p>Punkty życia:</p> <div className="lives">{this.renderLife( HP )}</div></div>
        <div className="status"><p>Liczba prób: { this.state.badAnswer }</p></div>
        <div className="status"><p>Czas: { this.state.time }</p></div>
      </div>
    </>
  }

  protected viewAnswers(): JSX.Element {
    if( this.state.quest._id === undefined )
      return <>
        <div className="scenes-quest">
          <div className="quest"><p></p></div>
          <div className="quest"><p></p></div>
        </div>
        <div className="scenes-quest">
          <div className="quest"><p></p></div>
          <div className="quest"><p></p></div>
        </div>
      </>
    return <>
      <div className="scenes-quest">
        <div className="quest" onClick={ this.send( this.state.quest.goodAnswer === this.state.quest.answerA ) }>
          {this.state.quest.answerA}
        </div>
        <div className="quest" onClick={ this.send( this.state.quest.goodAnswer === this.state.quest.answerB ) }>
          {this.state.quest.answerB}
        </div>
      </div>
      <div className="scenes-quest">
        <div className="quest" onClick={ this.send( this.state.quest.goodAnswer === this.state.quest.answerC ) }>
          {this.state.quest.answerC}
        </div>
        <div className="quest" onClick={ this.send( this.state.quest.goodAnswer === this.state.quest.answerD ) }>
          {this.state.quest.answerD}
        </div>
      </div>
    </>
  }

  componentDidMount(): void {
    if( this.state.firstInit ) {
      socket.saved?.client.on( 'answer', this.socketAnswer );
      socket.saved?.client.on( 'start-player', this.socketStartPlayer);
      socket.saved?.client.on( 'last-quest', this.socketLastQuest );
      socket.saved?.client.on( 'delete-player', this.socketDeletePlayer );
      socket.saved?.client.on( 'etap-2', this.socketEtap2 );
      socket.saved?.client.on( 'quest', this.socketQuest );
      socket.saved?.client.on( 'list-player', this.socketListPLayer );
      socket.saved?.client.on( 'down-HP', this.socketDownHP );
      socket.saved?.client.on( 'next-etap', this.socketNextEtap );
      this.setState( { firstInit: false } );
      socket.saved?.client.emit( 'list-player', localStorage.getItem( 'room' ) );
      socket.saved?.client.emit( 'quest', localStorage.getItem( 'room' ), this.props.weight );
    }
  }

  render(): JSX.Element {
    return <>
      <div className="scenes-header">
        <div className="header"><p>Etap 1</p></div>
      </div>
      { this.state.activate ? this.viewAnswers() : null }
      { this.props.weight === 'teacher' ? this.createPlayers() : null }
      { this.state.answer }
      { this.viewTitle() }
      { this.props.weight === 'student' ? this.showStatus() : null }
      { this.props.weight === 'teacher' ? this.generateTable( true ) : null }
    </>
  }
}

export = Etap1;