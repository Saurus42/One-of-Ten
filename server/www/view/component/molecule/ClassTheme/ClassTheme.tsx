import React = require( 'react' );
import send = require( '../../../../../functions/send' );

interface props {
  name: string
  weight: string
  selectClass: any
}
interface state {
  students: students[]
  allStudents: students[]
  filtr: boolean
  filtered: students[]
}
interface students {
  _id: string
  firstName: string
  lastName: string
  surname: string
}

class ClassTheme extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      students: [],
      allStudents: [],
      filtr: false,
      filtered: []
    }
  }

  async componentDidMount(): Promise<void> {
    if( this.state.students.length === 0 ) {
      const config = require( '../../../../../config.json' );
      if( this.props.weight === 'teacher' ) {
        const response = await Promise.all( this.props.selectClass.students.map( ( value: string ) => send( `${location.protocol}//${location.host}:${config.port}/${config.api}/users?id=${value}&type=students`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
          },
          method: 'GET'
        } ).then<students>( res => res.json() ) ) );
        const all = await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/users?type=students`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
          },
          method: 'GET'
        } ).then<students[]>( res => res.json() );
        this.setState( { students: response, allStudents: all } );
      }
    }
  }

  addToCollection({ student }: { student: students; }) {
    return ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
      const tab = this.state.students;
      tab.push( student );
      this.setState( { students: tab } );
    }
  }
  clearFilter = ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    this.setState( { filtered: [], filtr: false } );
  }

  filter = ( event: React.ChangeEvent<HTMLInputElement> ) => {
    const name = event.currentTarget.value;
    const tab: any[] = []
    for( let i = 0; i < this.state.allStudents.length; i++ ) {
      if(
        this.state.allStudents[i].firstName.includes( name ) ||
        this.state.allStudents[i].lastName.includes( name ) ||
        this.state.allStudents[i].surname.includes( name )
      ) {
        tab.push( this.state.allStudents[i] );
      }
    }
    this.setState( { filtr: name === '' ? false : true, filtered: tab } );
  }

  showAllStudents(): JSX.Element {
    const tr: JSX.Element[] = []
    if( this.state.filtr ) {
      for( let i = 0; i < this.state.filtered.length; i++ ) {
        let is = false;
        for( let j = 0; j < this.state.students.length; j++ ) {
          if( this.state.filtered[i]._id === this.state.students[j]._id ) {
            is = true;
            break;
          }
        }
        if( is )
          continue;
        tr.push(
            <div className="row" key={ `student-${i}` }>
              <div className="col-sm" key={ `student-${i}-name` }>{this.state.filtered[i].surname} {this.state.filtered[i].firstName} {this.state.filtered[i].lastName}</div>
              <div className="col-sm" key={ `student-${i}-button` }>
                <button type="button" onClick={this.addToCollection({ student: this.state.filtered[i] })}>Dodaj</button>
              </div>
            </div>
        );
      }
    } else {
      for( let i = 0; i < this.state.allStudents.length; i++ ) {
        let is = false;
        for( let j = 0; j < this.state.students.length; j++ ) {
          if( this.state.allStudents[i]._id === this.state.students[j]._id ) {
            is = true;
            break;
          }
        }
        if( is )
          continue;
        tr.push(
            <div className="row" key={ `student-${i}` }>
              <div className="col-sm" key={ `student-${i}-name` }>{this.state.allStudents[i].surname} {this.state.allStudents[i].firstName} {this.state.allStudents[i].lastName}</div>
              <div className="col-sm" key={ `student-${i}-button` }>
                <button type="button" onClick={this.addToCollection({ student: this.state.allStudents[i] })}>Dodaj</button>
              </div>
            </div>
        );
      }
    }
    return <div className="row" key={ `show-row` }><div className="list" key={ `show-row-list` }>{tr}</div></div>
  }

  formular(): JSX.Element {
    if( this.props.weight === 'teacher' ) {
      return <>
      <div className="formular" key="formular">
        <div className="row" key="teacher-row-form">
          <div className="col-sm" key="teacher-row-form-input">
            <input type="text" name="student" id="student" onChange={this.filter} />
          </div>
          <div className="col-sm" key="teacher-row-label">
            Wpisz imię lub nazwisko ucznia/studenta.
          </div>
        </div>
        {this.showAllStudents()}
      </div>
      </>
    } else
      return <></>
  }

  private async saveStudents( students: string[] ) {
    const config = require( '../../../../../config.json' );
    const data = this.props.selectClass;
    data.students = students;
    const response = await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/classes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
      },
      method: 'PUT',
      body: JSON.stringify(data)
    } ).then( res => res.json() );
    if( response.ok )
      alert( 'Zapisano pomyślnie' );
    else
      alert( 'Zapis się nie powiódł' );
  }

  litStudents(): JSX.Element[] {
    const tr: JSX.Element[] = []
    for( let i = 0; i < this.state.students.length; i++ )
      tr.push( <div className="row" key={ `list-row-${i}` }><div className="col-sm" key={ `list-col-sm-${i}` }>{this.state.students[i].surname} {this.state.students[i].firstName} {this.state.students[i].lastName}</div></div> );
    return tr
  }

  save = async ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    if( this.props.selectClass.students.length < this.state.students.length ) {
      const tab = this.props.selectClass.students
      for( let i = this.props.selectClass.students.length; i < this.state.students.length; i++ ) {
        tab.push( this.state.students[i]._id )
      }
      await this.saveStudents( tab );
      this.setState( { filtr: false, filtered: [] } );
    }
  }

  render(): JSX.Element {
    return <>
    <div className="class-theme" key="class-theme">
      {this.formular()}
      <div className="list-students" key="list-students">
        <div className="row" key="list-students-row">
          {this.props.weight === 'teacher' ? <div className="col-sm-8" key="list-students-row-list">{this.litStudents()}</div> : null}
          {this.props.weight === 'teacher' ? <div className="col-sm-2" key="list-students-row-button"><button type="button" onClick={this.save}>Zapisz zmiany</button></div> : null}
          <div className="col-sm-2" key="list-students-row-children">{this.props.children}</div>
        </div>
      </div>
    </div>
    </>;
  }
}

export = ClassTheme;
