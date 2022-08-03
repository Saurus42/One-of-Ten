import React = require( 'react' );
import AddQuest = require( '../../atom/AddQuest' );
import Menu = require( '../../atom/Menu' );
import ShowQuest = require( '../../atom/ShowQuest' );
import { Switch, Route } from 'react-router';
import Theme = require( '../Theme' );

interface props {}
interface state {
  names: string[]
  paths: string[]
}

class Quest extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      names: [ 'Dodaj', 'Wyświetl' ],
      paths: [ '/add', '/show' ]
    }
  }

  private view(): JSX.Element {
    return <Switch>
      <Route path="/quests" exact><></></Route>
      <Route path="/quests/add" component={AddQuest} />
      <Route path="/quests/show" component={ShowQuest} />
    </Switch>
  }

  render(): JSX.Element {
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
    return <Theme vertical={false} paths={paths} names={names}>
      <div className="row">
        <div className="col-sm-2">
          <Menu name={ this.state.names } path={ this.state.paths } vertical={true} submenu={ true }/>
        </div>
        {this.view()}
      </div>
    </Theme>
  }
}

export = Quest;
