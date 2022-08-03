import configuration = require( '../../../../../typingConfig' );
import React = require( 'react' );
import send = require( '../../../../../functions/send' );
import updateToken = require('../../../../../functions/updateToken' );
import Cookie = require( '../../../../../modules/cookie-browser' );

interface props {}
interface state {
  messageObject: JSX.Element
  login: string
  password: string
}

class Login extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      login: '',
      password: '',
      messageObject: <></>
    }
  }

  render() {
    return <div className="login">
      <div className="container">
        <div className="row">
          <div className="col-sm">Login</div>
          <div className="col-sm"><input type="text" name="login" id="login" className="person" onChange={ event => { this.setState( { login: event.currentTarget.value } ) } } /></div>
        </div>
        <div className="row">
          <div className="col-sm">Hasło</div>
          <div className="col-sm"><input type="password" name="password" id="password" className="person" onChange={ event => { this.setState( { password: event.currentTarget.value } ) } } /></div>
        </div>
        <div className="row">
          <div className="col-sm" style={ { height: '3em' } }><button type="button" onClick={ this.login }>Zaloguj się</button></div>
        </div>
        <div className="row">
          <div className="col-sm">{ this.state.messageObject }</div>
        </div>
      </div>
    </div>
  }

  private login = async ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    try {
      const config: configuration = require( '../../../../../config.json' );
      const data = {
        login: this.state.login,
        password: this.state.password
      }
      const response = await send( `${location.protocol}//${location.hostname}:${config.port}/${config.api}/login`, {
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify( data ),
        method: 'POST'
      } );
      if( response.status === 200 ) {
        const json = await response.json();
        const cookie = new Cookie();
        cookie.push( 'token', json.token );
        localStorage.setItem( 'token', json.token );
        updateToken();
      } else {
        const json = await response.json();
        this.setState( { messageObject: <div id="message">{json.message}</div> } );
      }
      return response;
    } catch {
      this.setState( { messageObject: <div id="message">Błąd serwera. Za utrudnienia przepraszamy.</div> } );
    }
  }
}

export = Login;
