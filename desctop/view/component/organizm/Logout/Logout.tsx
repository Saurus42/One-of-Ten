import React = require( 'react' );
import Cookie = require( '../../../../modules/cookie-browser' );
import { Redirect } from 'react-router';
import { socket } from '../../atom/Socket';

interface props {}
interface state {}

class Logout extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }
  render() {
    if( socket.saved ) {
      socket.saved.client.emit( 'leave-room', localStorage.getItem( 'room' ), localStorage.getItem( 'ID' ) );
      socket.saved.client.disconnect();
      socket.save( undefined );
    }
    const cookie = new Cookie();
    cookie.delete( 'token', cookie.get( 'token' ) );
    localStorage.removeItem( 'token' );
    localStorage.removeItem( 'ID' );
    localStorage.removeItem( 'room' );
    localStorage.removeItem( 'role' );
    return <Redirect to="/" />
  }
}

export = Logout;
