import React = require( 'react' );
import StudentsMain = require( '../../molecule/StudentsMain' );
import Theme = require( '../../molecule/Theme' );

interface props {}
interface state {
  names: string[]
  paths: string[]
}

class Student extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      names: [ 'Strona Główna', 'Klasy', 'Wyloguj' ],
      paths: [ '/students', '/classes', '/logout' ]
    };
  }

  getContent(): JSX.Element {
    return <StudentsMain />
  }

  render(): JSX.Element {
    return <Theme
      names={ this.state.names }
      paths={ this.state.paths }
      vertical={ false }
    >{this.getContent()}</Theme>
  }
}

export = Student;
