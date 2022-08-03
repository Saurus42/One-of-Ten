import React = require( 'react' );
import TeacherMain = require( '../../molecule/TeacherMain' );
import Theme = require( '../../molecule/Theme' );

interface props {}
interface state {
  names: string[]
  paths: string[]
}

class Teacher extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      names: [ 'Strona Główna', 'Dodaj pytanie', 'Wyświetl pytania', 'Klasy', 'Wyloguj' ],
      paths: [ '/teachers', '/quests/add', '/quests/show', '/classes', '/logout' ]
    };
  }

  getContent(): JSX.Element {
    return <TeacherMain />
  }

  render(): JSX.Element {
    return <Theme
      names={ this.state.names }
      paths={ this.state.paths }
      vertical={ false }
    >{this.getContent()}</Theme>
  }
}

export = Teacher;
