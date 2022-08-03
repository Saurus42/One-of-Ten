import React = require( 'react' );
import send = require( '../../../../../functions/send' );

interface props {}
interface state {
  quests: Map<string, questI>
  currentQuest: string
  clickCategory: string
  selectClass: Map<string, Set<string>>
  classes: Map<string, classesI>
}
interface questI {
  _id: string
  _rev: string
  category: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  question: string
  goodAnswer: string
  teacher: string
  [key: string]: string
}

interface classesI {
  _id: string
  name: string
  students: string[]
  quests: string[]
}

class ShowQuest extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      quests: new Map(),
      currentQuest: '',
      clickCategory: '',
      selectClass: new Map(),
      classes: new Map()
    }
  }

  
  async componentDidMount(): Promise<void> {
    const config = require( '../../../../../config.json' );
    const request = [
      `${location.protocol}//${location.host}:${config.port}/${config.api}/questions?teacher=${localStorage.getItem( 'ID' )}`,
      `${location.protocol}//${location.host}:${config.port}/${config.api}/classes?teacher=${localStorage.getItem( 'ID' )}`
    ];
    const respond = await Promise.all<[questI, classesI]>( request.map( v => send( v, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
      }
    } ).then( res => res.json() ) ) );
    const quests = this.state.quests;
    const classes = this.state.classes;
    const selectClass = this.state.selectClass
    for( const value of respond[0] )
      quests.set( value._id, value as any );
    for( const value of respond[1] ) {
      classes.set( value._id, value as any );
      selectClass.set( value._id, new Set( ( value as any as classesI ).quests ) )
    }
    this.setState( { quests, classes } );
  }

  private selected( { id }: { id: string; } ): (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
    return ( event: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
      this.setState( { currentQuest: id } );
    }
  }

  private clickHeader( { category }: { category: string; } ): (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void {
    return ( e: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
      this.setState( { clickCategory: category } );
    }
  }

  private getSelected = ( keyClass: string, category: string ) => {
    if( this.state.selectClass.has( keyClass ) )
      this.state.selectClass.get( keyClass )?.add( category );
    else
      this.state.selectClass.set( keyClass, new Set( [ category ] ) );
  }

  private createSelect( { category }: { category: string; } ): JSX.Element {
    const options: JSX.Element[] = [];
    options.push( <option value="">Wybierz</option> );
    for(const [ key, classes ] of this.state.classes )
      options.push( <option value={key}>{classes.name}</option> );
    return <select name="class" id="class" onChange={ e => this.getSelected( e.currentTarget.value, category ) }>
      {options}
    </select>
  }

  private saveData = ( e: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    const selected = this.state.selectClass;
    const config = require( '../../../../../config.json' );
    for( const [key, quests] of selected ) {
      const classes = this.state.classes.get( key );
      if( classes ) {
        const q: string[] = [];
        for( const [ , quest ] of this.state.quests ) {
          for( const category of quests ) {
            if( quest.category === category ) {
              q.push( quest._id );
            }
          }
        }
        classes.quests = q
        send( `${location.protocol}//${location.host}:${config.port}/${config.api}/classes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem( 'token' )}`,
            'Content-Type': 'application/json'
          },
          method: 'PUT',
          body: JSON.stringify( classes )
        } );
      }
    }
    alert( 'Zapisane.' );
  }

  private removeCategoryFromClass( id: string, keys: Set<string> ): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return ( e: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
      if( confirm( 'Czy chcesz usunąć tą kategorie z listy pytań?' ) ) {
        const quests =  this.state.selectClass.get( id );
        if( quests ) {
          for( const key of keys )
            if( quests.has( key ) )
              quests.delete( key );
          this.state.selectClass.set( id, quests );
        }
      }
    }
  }

  private showClasses( category: string ): JSX.Element[] {
    const classes = this.state.classes;
    const selectClass = this.state.selectClass;
    const keys = new Set<string>();
    const idClasses = new Set<string>();
    for( const [ keyQuest, quest ] of this.state.quests )
      if( category === quest.category )
        keys.add( keyQuest );
    for( const [ keyClass, collection ] of selectClass )
      for( const keyQuest of collection )
        if( keys.has( keyQuest ) )
          idClasses.add( keyClass );
    const names: string[] = [];
    const ids: string[] = [];
    for( const id of idClasses ) {
      const classs = classes.get( id );
      if( classs ) {
        names.push( classs.name );
        ids.push( classs._id );
      }
    }
    const buttons: JSX.Element[] = [];
    for( let i = 0; i < names.length; i++ ) {
      buttons.push( <button type="button" className="class" onClick={ this.removeCategoryFromClass( ids[i], keys ) }>{names[i]}</button> );
    }
    return buttons;
  }

  private showCategory(): JSX.Element[] {
    const categories = new Set<string>();
    for( const [ , quest ] of this.state.quests ) {
      categories.add( quest.category );
    }
    const view: JSX.Element[] = [];
    for( const category of categories ) {
      const header = <div className="row" onClick={ this.clickHeader({ category }) }>
        <div className="col-sm-11">
          <h1>{category === '' ? 'Brak kategorii' : category}</h1>
          Wyznacz klasę dla tej kategorii
          {this.createSelect( { category } )}
          Ta grupa jest przypisana do klas: {this.showClasses( category )}
        </div>
        <div className="col-sm-1"><img src={ this.state.clickCategory === category ? "/images/arrow-up.png" : "/images/arrow-down.png" } width={25} height={25} /></div>
      </div>
      const quested: [string, questI][] = [];
      for( const [ key, quest ] of this.state.quests ) {
        if( category === quest.category )
          quested.push( [ key, quest ] );
      }
      const content = this.renderCollection( quested );
      view.push( <div className="show-quest">
        <div className="col-sm">{header}{this.state.clickCategory === category ? content : null}</div>
      </div> );
    }
    view.push( <div className="row">
      <div className="col-sm"><button type="button" onClick={ this.saveData }>Zapisz</button></div>
    </div> );
    return view;
  }

  private renderCollection( quests: [string, questI][] ): JSX.Element[] {
    const tab: JSX.Element[] = [];
    const headers: JSX.Element[] = [];
    for( const [ id, quest ] of quests ) {
      const answerA = quest.answerA === quest.goodAnswer ? 'col-sm-3 good-answer' : 'col-sm-3';
      const answerB = quest.answerB === quest.goodAnswer ? 'col-sm-3 good-answer' : 'col-sm-3';
      const answerC = quest.answerC === quest.goodAnswer ? 'col-sm-3 good-answer' : 'col-sm-3';
      const answerD = quest.answerD === quest.goodAnswer ? 'col-sm-3 good-answer' : 'col-sm-3';
      const td: JSX.Element[] = [
        <div className="row">
          <div className="col-sm-12">{quest.question}</div>
        </div>,
        <div className="row">
          <div className={ answerA }>{quest.answerA}</div>
          <div className={ answerB }>{quest.answerB}</div>
          <div className={ answerC }>{quest.answerC}</div>
          <div className={ answerD }>{quest.answerD}</div>
        </div>
      ];
      tab.push( <hr /> );
      tab.push( <div className="col-sm-10">{td}</div> );
      tab.push( <div className="col-sm-2">
        <div className="show-quest-collection">
          <div className="col-sm"><button type="button" onClick={ this.deleteQuest( id ) }>Usuń</button></div>
        </div>
      </div> );
    }
    return tab;
  }

  private deleteQuest = ( key: string ) => {
    return async ( e: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
      const config = require( '../../../../../config.json' );
      for( const [ key, classes ] of this.state.selectClass ) {
        if( classes.has( key ) ) {
          classes.delete( key );
          break;
        }
        this.state.selectClass.set( key, classes );
      }
      await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/questions?id=${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
        }
      } );
      this.saveData( {} as any );
    }
  }

  render() {
    return <>{this.showCategory()}</>;
  }
}

export = ShowQuest;
