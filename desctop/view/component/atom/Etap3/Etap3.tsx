import React = require( 'react' );
import Message = require('../Message');
import { socket } from '../Socket';
import Scene = require( '../Scene' );

var isInterval = false;

interface props {
  weight: string
  start: ( name: string, players1: any[], players2: any[], HP: number ) => void
  allPlayers: () => { players: any[], copy: any[] }
  getPoints: () => number
}
interface state {
  players: any[]
  copyPlayers: any[]
  activate: boolean
  quest: any
  firstInit: boolean
  answer: JSX.Element
  HP: number
  points: number
  timer: number
  time: number
  select: boolean
  currentPlayer: number
  savePlayer: string
  part: number
  countQuest: number
  reported: boolean
  buttonEnable: boolean
  thisPlayer: boolean
  firstQuest: boolean
  maxQuests: number
  clicked: boolean
  listQuest: Map<string, number>
  listGoodAnswer: Map<string, number>
  listBadAnswer: Map<string, number>
}

class Etap3 extends Scene<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      players: [],
      copyPlayers: [],
      activate: false,
      quest: {},
      firstInit: true,
      answer: <p></p>,
      HP: 3,
      points: 0,
      timer: -1,
      time: 10,
      select: false,
      currentPlayer: 0,
      savePlayer: '',
      part: 1,
      countQuest: 3,
      reported: false,
      buttonEnable: true,
      thisPlayer: false,
      firstQuest: true,
      clicked: false,
      maxQuests: 40,
      listQuest: new Map(),
      listGoodAnswer: new Map(),
      listBadAnswer: new Map()
    }
  }

  render(): JSX.Element {
    if( this.state.quest === undefined && this.state.points > 0 )
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
    switch( this.state.part ) {
      case 1: {
        return <>
          <div className="scenes-header">
            <div className="header"><p>Etap 3</p></div>
          </div>
          { this.state.activate ? this.viewAnswers() : null }
          { this.props.weight === 'student' && this.state.buttonEnable ? this.createButton() : null }
          { this.state.answer }
          { this.props.weight === 'student' ? this.showStatus() : null }
          { this.viewTitle() }
          { this.props.weight === 'teacher' && this.state.reported ? this.viewRepotedPlayer() : null }
          { this.props.weight === 'teacher' ? this.generateTable( true ) : null }
        </>
      }
      default: {
        return <>
          <div className="scenes-header">
            <div className="header"><p>Etap 3</p></div>
          </div>
          { this.state.activate ? this.viewAnswers() : null }
          { this.state.select ? this.createToSelect() : null }
          { this.props.weight === 'teacher' && !this.state.clicked ? this.createTeacherButton() : null }
          { this.props.weight === 'teacher' && this.state.reported ? this.viewRepotedPlayer() : null }
          { this.state.answer }
          { this.props.weight === 'student' ? this.showStatus() : null }
          { this.viewTitle() }
          { this.props.weight === 'teacher' ? this.generateTable( true ) : null }
        </>
      }
    }
  }

  private createToSelect(): JSX.Element {
    let index = 0;
    const row: JSX.Element[] = [];
    const button: JSX.Element[] = [];
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i] === undefined || this.state.players[i] === null )
        continue;
      index += 3;
      button.push( <div className="active" onClick={ e => socket.saved?.client.emit( 'selected-player', localStorage.getItem( 'room' ), this.state.players[i]._id, localStorage.getItem( 'ID' ) ) } >{ this.state.players[i].firstName } { this.state.players[i].surname }</div> );
      if( index >= 12 ) {
        row.push( <div className="scenes-player">{ button.splice( 0, button.length ) }</div> );
        index = 0;
      }
    }
    if( index < 12 && index > 0 )
      row.push( <div className="scenes-player">{ button.splice( 0, button.length ) }</div> );
    return <div className="scenes-all-players">{ row }</div>
  }

  protected showStatus(): JSX.Element {
    return <>
      <div className="scenes-status">
        <div className="status"><p>Punkty życia:</p> <div className="lives">{this.renderLife( this.state.HP )}</div></div>
        <div className="status"><p>Punkty: { this.state.points }</p></div>
        <div className="status"><p>Czas: { this.state.time }</p></div>
      </div>
    </>
  }

  private viewRepotedPlayer(): JSX.Element {
    return <>
      <div className="row">
        <div className="col-sm">
          <p>Zgłosił/a się {this.state.players[this.state.currentPlayer].firstName} {this.state.players[this.state.currentPlayer].surname}</p>
        </div>
      </div>
    </>
  }

  protected viewTitle(): JSX.Element {
    if( this.state.quest._id === undefined || this.state.quest === null ) {
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
      return <>
        <div className="scenes-category">
          <div className="category"><p></p></div>
        </div>
        <div className="scenes-content">
          <div className="content"><p></p></div>
        </div>
      </>
    }
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

  protected viewAnswers(): JSX.Element {
    if( this.state.quest === undefined || this.state.quest === null )
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
    if( this.state.quest === undefined )
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
      socket.saved?.client.on( 'select-quest', this.socketSelectQuest );
      socket.saved?.client.on( 'last-quest', this.socketLastQuest );
      socket.saved?.client.on( 'last-player', this.socketLastPlayer );
      socket.saved?.client.on( 'delete-player', this.socketDeletePlayer );
      socket.saved?.client.on( 'quest', this.socketQuest );
      socket.saved?.client.on( 'down-HP', this.socketDownHP );
      socket.saved?.client.on( 'update-players', this.socketUpdatePlayers );
      socket.saved?.client.on( 'save-player', this.socketSavePlayer );
      socket.saved?.client.on( 'selected-player', this.socketSelectedPlayer );
      socket.saved?.client.on( 'next-part', this.socketNextPart );
      const { players, copy } = this.props.allPlayers();
      this.setState( { firstInit: false, players, copyPlayers: copy, points: this.props.getPoints() } );
      socket.saved?.client.emit( 'quest', localStorage.getItem( 'room' ), this.props.weight );
    }
  }

  private startPlayer = ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    socket.saved?.client.emit( 'select-quest', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ) );
  }

  
  private continueQuest = ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    if( this.state.part === 2 ) {
      this.setState( { clicked: true, firstQuest: false } );
      socket.saved?.client.emit( 'select-quest', localStorage.getItem( 'room' ), this.state.players[ this.state.currentPlayer ]._id );
    }
  }

  private createButton(): JSX.Element {
    return <>
      <div className="scenes-me">
        <button type="button" className="me" onClick={ this.startPlayer }>Zgłoś się</button>
      </div>
    </>
  }
  
  private createTeacherButton(): JSX.Element {
    return <>
    <div className="scenes-readed">
      <button type="button" onClick={ this.continueQuest } className="readed">Zadaj pytanie</button>
    </div>
  </>
  }

  private socketSelectedPlayer = ( id: string, from: string ) => {
    let current = this.state.currentPlayer;
    let activate = false;
    let j = 0;
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i] === undefined || this.state.players[i] === null )
        continue;

      if( this.state.players[i]._id === id ) {
        current = i;
        activate = true;
      }

      if( this.state.players[i]._id === from && id !== from )
        j = i;
    }
    this.setState( { currentPlayer: current, reported: true, select: false } );
    if( localStorage.getItem( 'ID' ) === id ) {
      if( from !== id ) {
        const player = this.state.players[j];
        const answer = <Message content={ `Do odpowiedzi wyznaczył/a ${player.firstName} ${player.surname}` } />
        this.setState( { answer } );
      } else {
        const answer = <Message content="Sam się wyznaczyłeś/aś." />
        this.setState( { answer } );
      }
      let thisPlayer = false;
      if( this.state.savePlayer === localStorage.getItem( 'ID' ) )
        thisPlayer = true;
      if( activate && !isInterval ) {
        isInterval = true;
        this.setState( { timer: window.setInterval( this.interval , 1000 ) } );
      }
      this.setState( { activate, thisPlayer } );
    }
  }

  private socketSavePlayer = ( id: string ) => {
    this.setState( { savePlayer: id } );
  }

  private socketUpdatePlayers = ( players: any[] ) => {
    this.setState( { players } );
    let count = 0;
    let iid = '';
    for( let i = 0; i < players.length; i++ )
      if( players[i] === undefined || players[i] === null )
        continue;
      else {
        count++;
        iid = players[i]._id;
      }
    if( count === 1 && this.props.weight === 'teacher' ) {
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
      if( this.props.weight === 'teacher' )
        socket.saved?.client.emit( 'save-progress', localStorage.getItem( 'room' ), 'Etap 3', students );
      socket.saved?.client.emit( 'win', localStorage.getItem( 'room' ), iid, students );
    }
  }

  private socketLastPlayer = () => {
    if( this.state.savePlayer === localStorage.getItem( 'ID' ) )
      this.setState( { select: true } );
    else
      this.setState( { select: false } );
  }

  componentDidUpdate( prevProps: props, prevState: state, snapshot: any ): void {
    if( this.state.part === 2 ) {
      if( this.state.players[ this.state.currentPlayer ] === undefined || this.state.players[ this.state.currentPlayer ] === null ) {
        let currentPlayer = this.state.currentPlayer;
        const players = this.state.players;
        for( let i = 0; i < players.length; i++ ) {
          if( players[ currentPlayer ] === undefined || players[ currentPlayer ] === null ) {
            currentPlayer += i;
            if( currentPlayer > players.length )
              currentPlayer -= players.length;
            for( let j = 0; j < players.length; j++ ) {
              let current = currentPlayer + j;
              if( current > players.length )
                current -= players.length;
              if( players[current] !== undefined && players[current] !== null ) {
                currentPlayer = current;
                this.socketSelectedPlayer( players[currentPlayer]._id, localStorage.getItem( 'ID' ) as string );
                break;
              }
            }
          } else {
            // this.socketSelectedPlayer( players[currentPlayer]._id );
            break;
          }
        }
      }
    }
    if( this.state.quest === null || this.state.quest === undefined )
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
  }

  private socketDownHP = ( id: string ) => {
    if( localStorage.getItem( 'ID' ) === id ) {
      const HP = this.state.HP - 1;
      this.setState( { HP } );
      if( HP === 0 ) {
        socket.saved?.client.emit( 'end-game', localStorage.getItem( 'room' ), id );
        socket.saved?.client.emit( 'delete-player', localStorage.getItem( 'room' ), id );
        socket.saved?.client.emit( 'game-over', localStorage.getItem( 'room' ), id );
      }
    }
  }
  
  private socketNextPart = ( id: string ) => {
    let currentPlayer = -1;
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i] === undefined || this.state.players[i] === null )
        continue;
      if( this.state.players[i]._id === id ) {
        currentPlayer = i;
        break;
      }
    }
    this.setState( { part: 2, currentPlayer, select: false } );
  }

  private socketQuest = ( quest: any ) => {
    if( quest === undefined )
      alert( 'Skończyły się pytania.' );
    this.setState( { quest, reported: false, buttonEnable: true } );
  }

  private socketDeletePlayer = ( id: string ) => {
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i] === undefined || this.state.players[i] === null )
        continue;
      if( this.state.players[i]._id === id ) {
        delete this.state.players[i];
        break;
      }
    }
    socket.saved?.client.emit( 'update-players', localStorage.getItem( 'room' ), this.state.players );
    socket.saved?.client.emit( 'list-player', localStorage.getItem( 'room' ) );
  }

  private socketLastQuest = ( quest: any ) => {
    this.setState( { quest } );
  }

  private socketSelectQuest = ( id: string ) => {
    const enable = this.state.buttonEnable;
      let currentPlayer = -1;
      this.setState( { buttonEnable: false } );
      if( this.state.part > 1 )
        socket.saved?.client.emit( 'selected-player', localStorage.getItem( 'room' ), id, localStorage.getItem( 'ID' ) );
      else if( enable ) {
        for( let i = 0; i < this.state.players.length; i++ ) {
          if( this.state.players[i] === undefined || this.state.players[i] === null )
            continue;
          if( this.state.players[i]._id === id )
            currentPlayer = i;
        }
        if( currentPlayer > -1 && localStorage.getItem( 'ID' ) === id ) {
          isInterval = true;
          this.setState( { activate: true, timer: window.setInterval( this.interval , 1000 ) } );
        } else if( currentPlayer > -1 ) {
          const player = this.state.players[currentPlayer];
          const answer = <Message content={ `Zgłosił się ${player.firstName} ${player.surname}` } />
          this.setState( { answer } );
        }
        if( this.state.quest === undefined )
          socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
      }
  }

  private socketAnswer = ( answer: boolean, id: string ) => {
    const maxQuests = this.state.maxQuests - 1;
    if( maxQuests > 0 ) {
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
        for( let i = 0; i < this.state.players.length; i++ ) {
          if( this.state.players[i] === undefined || this.state.players[i] === null )
            continue;
          if( this.state.players[i]._id !== id )
            continue;
          else {
            index = i;
            break;
          }
        }
        const player = this.state.players[index];
        const answer = <Message content={`Poprawną odpowiedź dał ${player.firstName} ${player.surname}.`} />;
        socket.saved?.client.emit( 'quest', localStorage.getItem( 'room' ), this.props.weight );
        socket.saved?.client.emit( 'save-player', localStorage.getItem( 'room' ), id );
        this.setState( { maxQuests, answer } );
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
        socket.saved?.client.emit( 'last-player', localStorage.getItem( 'room' ) );
        let index = -1;
        for( let i = 0; i < this.state.players.length; i++ ) {
          if( this.state.players[i] === undefined || this.state.players[i] === null )
            continue;
          if( this.state.players[i]._id !== id )
            continue;
          else {
            index = i;
            break;
          }
        }
        const player = this.state.players[index];
        const answer = <Message content={`Błędną odpowiedź dał ${player.firstName} ${player.surname}.`} />;
        socket.saved?.client.emit( 'quest', localStorage.getItem( 'room' ), this.props.weight );
        socket.saved?.client.emit( 'down-HP', localStorage.getItem( 'room' ), id );
        this.setState( { answer, maxQuests } );
      } else {
        this.setState( { activate: false, maxQuests } );
        if( localStorage.getItem( 'ID' ) === id && answer ) {
          const count = this.state.countQuest - 1;
          this.setState( { select: true, countQuest: count } );
          if( count === 0 )
            socket.saved?.client.emit( 'next-part', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ) );
        } else if( localStorage.getItem( 'ID' ) === id && !answer )
          socket.saved?.client.emit( 'last-player', localStorage.getItem( 'room' ) );
      }
    } else {
      const answer = <Message content="Skończyły się pytania dla tego etapu. Proszę zadać dodatkowe pytanie albo uznać remis." />;
      this.setState( { answer } );
    }
    const count = this.state.countQuest - 1;
    if( answer && this.state.firstQuest && count === -1 )
      this.setState( { firstQuest: false } );
    if( this.props.weight === 'student' )
      this.setState( { answer: <p></p> } );
  }

  protected send( answer: boolean ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
    return ( event: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
      clearInterval( this.state.timer );
      this.setState( { time: 10 } );
      socket.saved?.client.emit( 'answer', localStorage.getItem( 'room' ), answer, localStorage.getItem( 'ID' ) );
      if( answer ) {
        if( this.state.part === 1 || this.state.thisPlayer )
          this.setState( { points: this.state.points + 20, thisPlayer: false } );
        else
          this.setState( { points: this.state.points + 10 } );
      }
    }
  }
}

export = Etap3;
