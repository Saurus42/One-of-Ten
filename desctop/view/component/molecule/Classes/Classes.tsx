import React = require( 'react' )
import send = require( '../../../../functions/send' );
import ClassTheme = require( '../ClassTheme' );
import History = require( '../../atom/History' );
import ListClasses = require( '../../atom/ListClasses' );
import Theme = require( '../Theme' );
import { socket, createSocket } from '../../atom/Socket';

interface props {}
interface state {
  teacher: {
    form: {
      name: string
    }
  },
  classes: classes[]
  path: string,
  selectClass: classes
  names: string[]
  paths: string[]
}

interface classes {
  _id: string
  name: string
  students: string[]
}

class Classes extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      teacher: {
        form: {
          name: ''
        }
      },
      classes: [],
      path: '/',
      selectClass: {
        name: '',
        _id: '',
        students: []
      },
      names: [],
      paths: []
    }
  }

  async componentDidMount(): Promise<void> {
    const config = require( '../../../../config.json' );
    send( `${location.protocol}//${location.host}:${config.port}/${config.api}/classes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
      }
    } ).then( res => res.json() ).then( value => {
      let names = [];
      let paths = [];
      let role = localStorage.getItem( 'role' );
      if( role === null )
        role = '';
      role = role.slice( 0, role.length - 1 );
      if( role === 'teacher' ) {
        names = [ 'Strona Główna', 'Dodaj pytanie', 'Wyświetl pytania', 'Klasy', 'Wyloguj' ];
        paths = [ '/teachers', '/quests/add', '/quests/show', '/classes', '/logout' ];
      } else {
        names = [ 'Strona Główna', 'Klasy', 'Wyloguj' ];
        paths = [ '/students', '/classes', '/logout' ];
      }
      this.setState( { classes: value, names, paths } );
    } );
  }

  viewListClasses(): JSX.Element[] {
    const tr: JSX.Element[] = []
    let index = 0;
    const tab: JSX.Element[] = [];
    for( let i = 0; i < this.state.classes.length; i++ ) {
      tr.push(
        <div className="class" key={ `class-${i}` } onClick={ this.selectedClass({ index: i }) }>
          {this.state.classes[i].name}
        </div>
      );
      index += 2;
      if( index >= 12 ) {
        tab.push( <div className="list-classes" key={ `class-list-${i}` }>{tr.splice( 0, tr.length )}</div> );
        index = 0;
      }
    }
    if( index <= 12 && index > 0 )
      tab.push( <div className="list-classes" key="class-list-last">{tr.splice( 0, tr.length )}</div> );
    return tab;
  }

  renderView(): JSX.Element {
    let button = <button type="button" onClick={ this.startRoom }>Wejdź do klasy</button>
    return button
  }

  // start teacher
  save = async ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    const config = require( '../../../../config.json' );
    const newClass = this.state.teacher.form.name;
    const data = await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/classes?new=${newClass}&teacher=${localStorage.getItem( 'ID' )}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
      },
      method: 'POST'
    } ).then<classes[]>( res => res.json() );
    this.setState( { classes: data } );
  }

  startRoom = ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    socket.save( createSocket( '/room' ) );
    socket.saved?.client.emit( 'new-client', this.state.selectClass._id );
    localStorage.setItem( 'room', this.state.selectClass._id );
    History.push( '/scenes' );
  }

  selectedClass({ index }: { index: number; }) {
    return ( event: React.MouseEvent<HTMLElement, MouseEvent> ) => {
      this.setState( { selectClass: this.state.classes[index], path: `/${this.state.classes[index].name}` } );
    }
  }

  back = () => {
    this.setState( { selectClass: {} as any } );
    History.push( '/classes' );
  }

  generateFormular(): JSX.Element {
    return <>
      <div className="form-up-menu" key="form-up-menu-1">
        <div className="col-sm" key="form-up-menu-1-name">Nazwa klasy</div>
        <div className="col-sm" key="form-up-menu-1-input"><input type="text" name="name" id="name" onChange={ e => { this.setState( { teacher: { form: { name: e.currentTarget.value } } } ) } } /></div>
      </div>
      <div className="form-down-menu" key="form-up-menu-2">
        <div className="col-sm" key="form-up-menu-2-button">
          <button type="button" onClick={ this.save }>Zapisz</button>
        </div>
      </div>
    </>
  }

  viewTeacher(): JSX.Element {
    return <>
      {this.generateFormular()}
      {this.viewListClasses()}
    </>
  }
  // end teacher

  // start student
  viewStudent() {
    return <ListClasses classes={this.state.classes} selectedClass={this.setClass} />
  }
  // end student

  private setClass = ( data: any ) => {
    this.setState( { classes: data } );
  }

  render(): JSX.Element {
    let role = localStorage.getItem( 'role' );
    if( role === null )
      role = '';
    role = role.slice( 0, role.length - 1 );
    if( location.pathname === '/classes' )
      switch( role ) {
        case 'student': {
          return <Theme paths={this.state.paths} names={this.state.names} vertical={false}>{this.viewStudent()}</Theme>
        }
        case 'teacher': {
          return <Theme paths={this.state.paths} names={this.state.names} vertical={false}>{this.viewTeacher()}</Theme>
        }
        default: {
          return <Theme paths={this.state.paths} names={this.state.names} vertical={false}></Theme>
        }
      }
    else
      return <Theme paths={this.state.paths} names={this.state.names} vertical={false}>
        <ClassTheme name={this.state.selectClass.name} selectClass={this.state.selectClass} weight={role}>
          <div className="row" key="row-button-class">
            <div className="col-sm" key="button-class"><button type="button" onClick={this.back}>Wstecz</button></div>
          </div>
          <div className="row" key="row-next-button-class">
            <div className="col-sm">{this.renderView()}</div>
          </div>
        </ClassTheme>
      </Theme>
  }
}

export = Classes;
