import React = require( 'react' );
import AdminMain = require( '../../molecule/AdminMain' );
import Theme = require( '../../molecule/Theme' );
import Users = require( '../../molecule/Users' );
import { Route, Switch } from 'react-router-dom';

interface props {}
interface state {
  names: string[]
  paths: string[]
}

class Admin extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      names: [ 'Strona Główna', 'Lista użytkowników', 'Dodaj użytkownika', 'Wyloguj' ],
      paths: [ '/admin', '/admin/users', '/admin/users/add', '/logout' ]
    };
  }

  getContent = () => {
    return <Switch>
      <Route path="/admin" exact component={AdminMain} />
      <Route path="/admin/users" component={Users} />
    </Switch>
  }

  render() {
    return <Theme
      names={ this.state.names }
      paths={ this.state.paths }
      vertical={ false }
    >{this.getContent()}</Theme>
  }
}

export = Admin;
