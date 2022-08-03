import React = require( 'react' );
import Admin = require( '../Admin' );
import Login = require( '../Login' );
import Student = require( '../Student' );
import Teacher = require( '../Teacher' );
import { Route, Switch } from 'react-router';
import Scenes = require( '../../molecule/Scenes' );
import Logout = require( '../Logout' );
import Classes = require( '../../molecule/Classes' );
import Quest = require( '../../molecule/Quest' );

interface props {}
interface state {}

class Root extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {}
  }

  render(): JSX.Element {
    return <Switch>
      <Route path="/" exact component={ Login } />
      <Route path="/students" component={ Student } />
      <Route path="/teachers" component={ Teacher } />
      <Route path="/admin" component={ Admin } />
      <Route path="/scenes" component={ Scenes } />
      <Route path="/quests" component={ Quest } />
      <Route path="/classes" component={ Classes } />
      <Route path="/logout" component={ Logout } />
    </Switch>
  }
}

export = Root;
