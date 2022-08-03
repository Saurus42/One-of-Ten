import React = require( 'react' );

interface state {
  copyPlayers: any[]
  listQuest: Map<string, any>
  listGoodAnswer: Map<string, any>
  listBadAnswer: Map<string, any>
  time: number
  timer: number
}

abstract class Scene<P, S extends state> extends React.Component<P, S> {
  constructor( props: P ) {
    super( props );
  }
  protected generateTable( head: boolean ) {
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
    for( let i = 0; i < this.state.copyPlayers.length; i++ ) {
      const player = this.state.copyPlayers[i];
      const name = <div className="td">{player.firstName} {player.surname}</div>
      const quest = <div className="td">{this.state.listQuest.get( player._id )}</div>
      const good = <div className="td">{this.state.listGoodAnswer.get( player._id )}</div>
      const bad = <div className="td">{this.state.listBadAnswer.get( player._id )}</div>
      tr.push( <div className="tr">{name}{quest}{good}{bad}</div> );
    }
    return <div className="table">{tr}</div>
  }

  protected renderLife( HP: number ) {
    const circle: JSX.Element[] = [];
    for( let i = 0; i < HP; i++ ) {
      circle.push( <div className="scenes-life"></div> );
    }
    return circle;
  }

  protected send( answer: boolean ): any {
    if( this.constructor instanceof Scene )
      throw new Error( 'This is abstract method.' );
  }

  protected interval = () => {
    const time = this.state.time - 1;
    this.setState( { time } );
    if( time <= 0 ) {
      clearInterval( this.state.timer );
      this.setState( { time: 10 } );
      this.send( false )( {} as any );
    }
  }
}

export = Scene;