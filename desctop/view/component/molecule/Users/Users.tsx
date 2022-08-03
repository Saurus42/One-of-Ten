import React = require( 'react' );
import CreateUsers = require( '../../atom/CreateUsers' );
import ShowUsers = require( '../../atom/ShowUsers' );
import { Switch, Route } from 'react-router';

interface props {}
interface state {
  path: string
}

class Users extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }

  resetPath = () => {
    this.setState( { path: '/' } )
  }

  contextComponent() {
    return <Switch>
      <Route path="/admin/users" exact component={ShowUsers} />
      <Route path="/admin/users/add" component={ CreateUsers } />
    </Switch>
  }

  render() {
    return <div className="row">
      <div className="col-sm">
        {this.contextComponent()}
      </div>
    </div>;
  }
}

export = Users;