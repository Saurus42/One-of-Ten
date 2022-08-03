import React = require( 'react' );
import send = require( '../../../../functions/send' );

interface props {}

interface state {
  login: string
  password: string
  firstName: string
  lastName: string
  surname: string
  weight: string
}

class CreateUsers extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      login: '',
      password: '',
      firstName: '',
      lastName: '',
      surname: '',
      weight: ''
    }
    this.nameKey = 'users-create';
  }

  private nameKey: string

  save = async ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    const config = require( '../../../../config.json' );
    const data: state = this.state;
    const res = await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem( 'token' )}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( data )
    } ).then( r => r.json() );
    this.setState( { weight: '', firstName: '', surname: '', lastName: '', login: '', password: '' } );
  }

  render(): JSX.Element {
    return <div className="row" key={`${this.nameKey}`}>
      <div className="col-sm create-user" key={`${this.nameKey}-content`}>
        <div className="row data-user" key={`${this.nameKey}-col-01`}>
          <div className="col-sm" key={`${this.nameKey}-col-01-01`}>Login</div>
          <div className="col-sm" key={`${this.nameKey}-col-01-02`}><input type="text" name="login" id="login" defaultValue={ this.state.login } onChange={ e => { this.setState( { login: e.currentTarget.value } ) } } /></div>
        </div>
        <div className="row data-user" key={`${this.nameKey}-col-02`}>
          <div className="col-sm" key={`${this.nameKey}-col-02-01`}>Hasło</div>
          <div className="col-sm" key={`${this.nameKey}-col-02-02`}><input type="password" name="password" id="password" defaultValue={ this.state.password } onChange={ e => { this.setState( { password: e.currentTarget.value } ) } } /></div>
        </div>
        <div className="row data-user" key={`${this.nameKey}-col-03`}>
          <div className="col-sm" key={`${this.nameKey}-col-03-01`}>Pierwsze imię</div>
          <div className="col-sm" key={`${this.nameKey}-col-03-02`}><input type="text" name="firstName" id="firstName" defaultValue={ this.state.firstName } onChange={ e => { this.setState( { firstName: e.currentTarget.value } ) } } /></div>
        </div>
        <div className="row data-user" key={`${this.nameKey}-col-04`}>
          <div className="col-sm" key={`${this.nameKey}-col-04-01`}>Drugie imię</div>
          <div className="col-sm" key={`${this.nameKey}-col-04-02`}><input type="text" name="lastName" id="lastName" defaultValue={ this.state.lastName } onChange={ e => { this.setState( { lastName: e.currentTarget.value } ) } } /></div>
        </div>
        <div className="row data-user" key={`${this.nameKey}-col-05`}>
          <div className="col-sm" key={`${this.nameKey}-col-05-01`}>Nazwisko</div>
          <div className="col-sm" key={`${this.nameKey}-col-05-02`}><input type="text" name="surname" id="surname" defaultValue={ this.state.surname } onChange={ e => { this.setState( { surname: e.currentTarget.value } ) } } /></div>
        </div>
        <div className="row data-user" key={`${this.nameKey}-col-18`}>
          <div className="col-sm" key={`${this.nameKey}-col-18-01`}>Ranga</div>
          <div className="col-sm" key={`${this.nameKey}-col-18-02`}>
            <select name="weight" id="weight" onChange={ e => { this.setState( { weight: e.currentTarget.value } ) } }>
              <option value="null">Kategoria</option>
              <option value="admin">Administrator</option>
              <option value="students">Uczeń</option>
              <option value="teachers">Nauczyciel</option>
            </select>
          </div>
        </div>
        <div className="row data-user" key={`${this.nameKey}-col-21`}>
          <div className="col-sm" key={`${this.nameKey}-col-21-01`}><button type="button" onClick={ this.save }>Zapisz</button></div>
        </div>
      </div>
    </div>
  }
}

export = CreateUsers;