import React, { useEffect, useState } from 'react';
import Message = require( '../Message' );
import Scene = require('../Scene');
import { socket } from '../Socket';

interface props {
  weight: string
  start: ( name: string, players1: any[], players2: any[], HP: number ) => void
  allPlayers: () => { players: any[], copy: any[] }
  getHP: () => number
}

interface state {
  players: any[]
  copyPlayers: any[]
  activate: boolean
  quest: any
  firstInit: boolean
  answer: JSX.Element
  HP: number
  timer: number
  time: number
  firstQuest: boolean
  select: boolean
  reported: boolean
  isSelected: boolean
  currentPlayer: number
  savePlayer: string
  listQuest: Map<string, number>
  listGoodAnswer: Map<string, number>
  listBadAnswer: Map<string, number>
}

class Etap2 extends Scene<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      players: [],
      copyPlayers: [],
      activate: false,
      quest: {},
      firstInit: true,
      isSelected: true,
      reported: false,
      answer: <p></p>,
      HP: 3,
      timer: 0,
      time: 10,
      firstQuest: true,
      select: false,
      currentPlayer: 0,
      savePlayer: '',
      listQuest: new Map(),
      listGoodAnswer: new Map(),
      listBadAnswer: new Map()
    }
  }

  render(): JSX.Element {
    if( this.state.quest === undefined || this.state.quest === null )
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
    let playersCount = 0;
    for( let i = 0; i < this.state.players.length; i++ )
      if( this.state.players[i] !== undefined && this.state.players[i] !== null )
        playersCount++;
    if( playersCount <= 2 && playersCount > 0 )
      socket.saved?.client.emit( 'etap-3', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ), this.state.HP );
    return <>
      <div className="scenes-header">
        <div className="header"><p>Etap 2</p></div>
      </div>
      { this.state.activate ? this.viewAnswers() : null }
      { this.props.weight === 'teacher' && this.state.isSelected ? this.createButton() : null }
      { this.state.select ? this.createToSelect() : null }
      { this.props.weight === 'teacher' && this.state.reported ? this.selectedPlayer() : null }
      { this.state.answer }
      { this.props.weight === 'student' ? this.showStatus() : null }
      { this.viewTitle() }
      { this.props.weight === 'teacher' ? this.generateTable( true ) : null }
    </>
  }

  selectedPlayer(): JSX.Element {
    return <div className="scenes-selected">
      <div className="selected"><p>Wyznaczony/a {this.state.players[ this.state.currentPlayer ].firstName} {this.state.players[ this.state.currentPlayer ].surname}</p></div>
    </div>
  }

  private createToSelect(): JSX.Element {
    if( this.state.firstQuest ) {
      let firstIndex = this.state.currentPlayer % 5;
      firstIndex = this.state.currentPlayer - firstIndex;
      let index = 0;
      const row: JSX.Element[] = [];
      const button: JSX.Element[] = [];
      for( let i = firstIndex; i < firstIndex + 5; i++ ) {
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
    } else {
      let index = 0;
      const row: JSX.Element[] = [];
      const button: JSX.Element[] = [];
      for( let i = 0; i < this.state.players.length; i++ ) {
        if( this.state.players[i] === undefined || this.state.players[i] === null || this.state.players[i]._id === localStorage.getItem( 'ID' ) )
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
  }

  protected showStatus(): JSX.Element {
    return <>
      <div className="scenes-status">
        <div className="status"><p>Punkty życia:</p> <div className="lives">{this.renderLife( this.state.HP )}</div></div>
        <div className="status"><p>Czas: { this.state.time }</p></div>
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
    const [ quest ] = useState<any>();
    if( quest._id === undefined )
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
        <div className="quest" onClick={ this.send( quest.goodAnswer === quest.answerA ) }>
          {quest.answerA}
        </div>
        <div className="quest" onClick={ this.send( quest.goodAnswer === quest.answerB ) }>
          {quest.answerB}
        </div>
      </div>
      <div className="scenes-quest">
        <div className="quest" onClick={ this.send( quest.goodAnswer === quest.answerC ) }>
          {quest.answerC}
        </div>
        <div className="quest" onClick={ this.send( quest.goodAnswer === quest.answerD ) }>
          {quest.answerD}
        </div>
      </div>
    </>
  }

  componentDidMount(): void {
    if( this.state.firstInit ) {
      socket.saved?.client.on( 'answer', this.socketAnswer );
      socket.saved?.client.on( 'start-player', this.socketStartPlayer );
      socket.saved?.client.on( 'last-quest', this.socketLastQuest );
      socket.saved?.client.on( 'last-player', this.socketLastPlayer );
      socket.saved?.client.on( 'delete-player', this.socketDeletePlayer );
      socket.saved?.client.on( 'etap-3', this.socketEtap3 );
      socket.saved?.client.on( 'quest', this.socketQuest );
      socket.saved?.client.on( 'down-HP', this.socketDownHP );
      socket.saved?.client.on( 'update-players', this.socketUpdatePlayers );
      socket.saved?.client.on( 'next-player', this.socketNextPlayer );
      socket.saved?.client.on( 'save-player', this.socketSavePlayer );
      socket.saved?.client.on( 'selected-player', this.socketSelectedPlayer );
      socket.saved?.client.on( 'next-etap', this.socketNextEtap );
      const { players, copy } = this.props.allPlayers();
      this.setState( { firstInit: false, players, copyPlayers: copy, HP: this.props.getHP() } );
      socket.saved?.client.emit( 'quest', localStorage.getItem( 'room' ), this.props.weight );
    }
  }

  componentDidUpdate(): void {
    if( this.state.quest === null || this.state.quest === undefined )
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
  }

  private startPlayer = ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    const player = this.state.players[this.state.currentPlayer];
    socket.saved?.client.emit( 'start-player', localStorage.getItem( 'room' ), player._id );
    this.setState( { isSelected: false } );
  }

  private createButton(): JSX.Element {
    return <>
      <div className="scenes-readed">
        <div><button type="button" onClick={ this.startPlayer } className="readed">Zadaj Pytanie</button></div>
      </div>
    </>
  }

  private socketNextEtap = () => {
    socket.saved?.client.emit( 'etap-3', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ), this.state.HP );
  }

  private socketSelectedPlayer = ( id: string, from: string ) => {
    let index = 0;
    let j = 0;
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i] === undefined || this.state.players[i] === null )
        continue;

      if( this.state.players[i]._id === id )
        index = i;

      if( this.state.players[i]._id === from )
        j = i;
    }
    if( localStorage.getItem( 'ID' ) === id ) {
      const player = this.state.players[j];
      const answer = <Message content={ `Do odpowiedzi wyznaczył ${player.firstName} ${player.surname}.` } />
      this.setState( { currentPlayer: index, select: false, reported: true, isSelected: true, answer } );
    } else
      this.setState( { currentPlayer: index, select: false, reported: true, isSelected: true } );
  }

  private socketSavePlayer = ( id: string ) => {
    this.setState( { savePlayer: id } );
  }

  private socketNextPlayer = ( index?: number ) => {
    let current: number
    if( index === undefined || index === null )
      current = this.state.currentPlayer + 1;
    else
      current = index + 1;
    const player = this.state.players[current];
    if( this.state.players.length <= current )
      current = 0;
    if( player === undefined )
      this.socketNextPlayer( current );
    else {
      this.setState( { currentPlayer: current } );
      if( this.props.weight === 'teacher' )
        socket.saved?.client.emit( 'start-player', localStorage.getItem( 'room' ), player._id );
    }
  }

  private socketUpdatePlayers = ( players: any[] ) => {
    this.setState( { players } );
    let count = 0;
    for( let i = 0; i < players.length; i++ )
      if( players[i] === undefined || players[i] === null )
        continue;
      else
        count++;
    if( count <= 2 )
      socket.saved?.client.emit( 'next-etap', localStorage.getItem( 'room' ), players );
  }

  private socketLastPlayer = () => {
    let isPlayer = false;
    if( this.state.savePlayer !== '' ) {
      isPlayer = true;
      for( let i = 0; i < this.state.players.length; i++ ) {
        if( this.state.players[i]._id === this.state.savePlayer ) {
          this.setState( { currentPlayer: i } );
          break;
        }
      }
    }
    if( this.state.savePlayer === localStorage.getItem( 'ID' ) )
      this.setState( { select: true } );
    if( isPlayer )
      this.setState( { isSelected: false, reported: false } );
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

  private socketQuest = ( quest: any ) => {
    if( quest === undefined )
      alert( 'Skończyły się pytania.' );
    this.setState( { quest, reported: false } );
  }

  private socketEtap3 = ( id: string, HP: number ) => {
    if( id === localStorage.getItem( 'ID' ) ) {
      socket.saved?.client.removeListener( 'answer', this.socketAnswer );
      socket.saved?.client.removeListener( 'start-player', this.socketStartPlayer );
      socket.saved?.client.removeListener( 'last-quest', this.socketLastQuest );
      socket.saved?.client.removeListener( 'last-player', this.socketLastPlayer );
      socket.saved?.client.removeListener( 'delete-player', this.socketDeletePlayer );
      socket.saved?.client.removeListener( 'etap-3', this.socketEtap3 );
      socket.saved?.client.removeListener( 'quest', this.socketQuest );
      socket.saved?.client.removeListener( 'down-HP', this.socketDownHP );
      socket.saved?.client.removeListener( 'update-players', this.socketUpdatePlayers );
      socket.saved?.client.removeListener( 'next-player', this.socketNextPlayer );
      socket.saved?.client.removeListener( 'save-player', this.socketSavePlayer );
      socket.saved?.client.removeListener( 'selected-player', this.socketSelectedPlayer );
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
      if( this.props.weight === 'teacher' )
        socket.saved?.client.emit( 'save-progress', localStorage.getItem( 'room' ), 'Etap 2', students );
      this.props.start( 'Etap 3', this.state.players, this.state.copyPlayers, this.state.HP );
    }
  }

  private socketDeletePlayer = ( id: string ) => {
    for( let i = 0; i < this.state.players.length; i++ ) {
      if( this.state.players[i] === null || this.state.players[i] === undefined )
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

  private socketStartPlayer = ( id: string ) => {
    if( id === localStorage.getItem( 'ID' ) )
      this.setState( { activate: true, timer: window.setInterval( this.interval , 1000 ) } )
    if( this.state.quest === undefined )
      socket.saved?.client.emit( 'last-quest', localStorage.getItem( 'room' ) );
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
      this.setState( { answer, select: false, reported: false, firstQuest: false } );
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
      if( this.state.firstQuest )
        socket.saved?.client.emit( 'next-player', localStorage.getItem( 'room' ) );
      else
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
      this.setState( { answer, isSelected: false, reported: false, firstQuest: false } );
    } else {
      this.setState( { activate: false } );
      if( localStorage.getItem( 'ID' ) === id && answer ) {
        this.setState( { select: true, isSelected: false, reported: false } );
      } else if( localStorage.getItem( 'ID' ) === id && !answer )
        socket.saved?.client.emit( 'last-player', localStorage.getItem( 'room' ) );
      else {
        this.setState( { isSelected: false, reported: false } );
      } if( answer && this.state.firstQuest )
        this.setState( { firstQuest: false } );
    }
  }

  protected send( answer: boolean ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
    return ( event: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
      clearInterval( this.state.timer );
      this.setState( { time: 10, answer: <p></p> } );
      socket.saved?.client.emit( 'answer', localStorage.getItem( 'room' ), answer, localStorage.getItem( 'ID' ) );
    }
  }
}

export = Etap2;
