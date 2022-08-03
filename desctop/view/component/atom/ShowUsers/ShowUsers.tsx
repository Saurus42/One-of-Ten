import React = require( 'react' );
import send = require( '../../../../functions/send' );

interface props {}

interface state {
  users: usersI[]
  sorted: usersI[]
  searched: usersI[]
  isSort: boolean
  filtered: usersI[]
  filterCategory: string
  isFilter: boolean
  isSearch: boolean
}

interface usersI {
  login: string
  password: string
  firstName: string
  lastName: string
  surname: string
  address: string
  weight: string
  points: string
  [key: string]: string
}

class ShowUsers extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      users: [],
      sorted: [],
      searched: [],
      isSort: false,
      isFilter: false,
      filtered: [],
      filterCategory: '',
      isSearch: false
    }
  }

  async componentDidMount(): Promise<unknown> {
    if( this.state.users.length === 0 ) {
      const config = require( '../../../../config.json' );
      try {
        const response = await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
          },
          method: 'GET'
        } ).then( res => res.json() );
        const users: usersI[] = response;
        this.setState( { users } );
      } catch( e ) {
        return e;
      }
    }
  }

  private setFilter = ( event: React.SyntheticEvent<HTMLSelectElement, Event> ) => {
    const category = event.currentTarget.value;
    if( category !== 'null' ) {
      this.setState( { filterCategory: category } );
    }
  }

  private filter( value: string ): (user: usersI) => boolean {
    return ( user: usersI ) => {
      return user[this.state.filterCategory]?.includes( value )
    }
  }

  private listSort( user1: usersI, user2: usersI ): 1 | -1 | 0 {
    if( user1.surname < user2.surname )
      return -1;
    else if( user1.surname > user2.surname )
      return 1;
    else
      return 0;
  }

  private listSortReverse( user1: usersI, user2: usersI ): 1 | -1 | 0 {
    if( user1.surname < user2.surname )
      return 1;
    else if( user1.surname > user2.surname )
      return -1;
    else
      return 0;
  }

  private sort = ( event: React.SyntheticEvent<HTMLSelectElement, Event> ) => {
    const sortIcon = event.currentTarget.value;
    if( this.state.isFilter ) {
      if( sortIcon === 'a-z' )
        this.setState( { isSort: true, isFilter: false, sorted: this.state.filtered.sort( this.listSort ) } );
      else if( sortIcon === 'z-a' )
        this.setState( { isSort: true, isFilter: false, sorted: this.state.filtered.sort( this.listSortReverse ) } );
    } else if( this.state.isSearch ) {
      if( sortIcon === 'a-z' )
        this.setState( { isSort: true, isSearch: false, sorted: this.state.searched.sort( this.listSort ) } );
      else if( sortIcon === 'z-a' )
        this.setState( { isSort: true, isSearch: false, sorted: this.state.searched.sort( this.listSortReverse ) } );
    } else {
      if( sortIcon === 'a-z' )
        this.setState( { isSort: true, sorted: this.state.users.sort( this.listSort ) } );
      else if( sortIcon === 'z-a' )
        this.setState( { isSort: true, sorted: this.state.users.sort( this.listSortReverse ) } );
    }
  }

  private search( users: usersI[], value: string ): usersI[] {
    const tab: usersI[] = [];
    for( let i = 0; i < users.length; i++ ) {
      users[i].firstName = users[i].firstName === undefined ? '' : users[i].firstName;
      users[i].lastName = users[i].lastName === undefined ? '' : users[i].lastName;
      users[i].surname = users[i].surname === undefined ? '' : users[i].surname;
      if( users[i].firstName.includes( value ) || users[i].lastName.includes( value ) || users[i].surname.includes( value ) )
        tab.push( users[i] );
    }
    return tab;
  }

  private searchNames = ( event: React.ChangeEvent<HTMLInputElement> ) => {
    const sts = { isSearch: true, isFilter: false, isSort: false, searched: [] };
    if( this.state.isSort )
      sts.searched = this.search( this.state.sorted, event.currentTarget.value ) as any;
    else if( this.state.isFilter )
      sts.searched = this.search( this.state.filtered, event.currentTarget.value ) as any;
    else
      sts.searched = this.search( this.state.users, event.currentTarget.value ) as any;
    this.setState( sts );
  }

  private searchFilter = ( event: React.ChangeEvent<HTMLInputElement> ) => {
    const sts = { isFilter: true, isSearch: false, isSort: false, filtered: [] };
    if( this.state.isSort )
      sts.filtered = this.state.sorted.filter( this.filter( event.currentTarget.value ) ) as any;
    else if( this.state.isSearch )
      sts.filtered = this.state.searched.filter( this.filter( event.currentTarget.value ) ) as any;
    else
      sts.filtered = this.state.users.filter( this.filter( event.currentTarget.value ) ) as any;
    this.setState( sts );
  }

  private clear = ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    this.setState( { isFilter: false, isSort: false, isSearch: false, sorted: [], filtered: [], searched: [] } );
  }

  private showUsers( header = false ): JSX.Element[] {
    const tr: JSX.Element[] = [];
    tr.push( <div className="row" key="users-list-menu">
      <div className="col-sm" key="users-list-menu-item-one">
        <select name="sort" id="sort" onChange={ this.sort }>
          <option value="null">Sortowanie</option>
          <option value="a-z">Od A do Z</option>
          <option value="z-a">Od Z do A</option>
        </select>
      </div>
      <div className="col-sm" key="users-list-menu-item-two">
        <input type="text" name="search-filter" id="search-filter" onChange={ this.searchFilter } />
        <select name="filter" id="filter" onChange={ this.setFilter }>
          <option value="null">Filtrowanie</option>
          <option value="weight">Kategoria</option>
          <option value="classes">Klasa</option>
        </select>
      </div>
      <div className="col-sm" key="users-list-menu-item-three">
        <input type="text" name="search-name" id="search-name" onChange={ this.searchNames } />
        Nazwisko i Imię
      </div>
      <div className="col-sm" key="users-list-menu-item-four">
        <button type="button" onClick={ this.clear }>Wyczyść</button>
      </div>
    </div> );
    let index = 0;
    let i = 0;
    if( this.state.isSort ) {
      for( const user of this.state.sorted ) {
        const td: JSX.Element[] = [];
        const headers: JSX.Element[] = [];
        for( const param in user ) {
          if( param === '_id' || param === '_rev' || param === 'password' || param === 'iat' || param === 'addresses' || param === 'points' || param === 'from' || param === 'to' || param === 'walue' )
            continue;
          if( header && index === 0 )
            headers.push( <div className="col-sm user" key={`users-list-header-param-${param}-${i}`}><b>{param}</b></div> );
          td.push( <div className="col-sm user" key={`users-list-table-sort-content-${param}-${i}`}>{user[param]}</div> );
        }
        if( header && index++ === 0 )
          tr.push( <div className="row list-users" key="users-list-header">{headers}</div> );
        tr.push( <div className="row list-users" key={`users-list-table-sort-${i++}`}>{td}</div> );
      }
    } else if(this.state.isFilter) {
      for( const user of this.state.filtered ) {
        const td: JSX.Element[] = [];
        const headers: JSX.Element[] = [];
        for( const param in user ) {
          if( param === '_id' || param === '_rev' || param === 'password' || param === 'iat' || param === 'addresses' || param === 'points' || param === 'from' || param === 'to' || param === 'walue' )
            continue;
          if( header && index === 0 )
            headers.push( <div className="col-sm user" key={`users-list-header-param-${param}-${i}`}><b>{param}</b></div> );
          td.push( <div className="col-sm user" key={`users-list-table-filter-content-${param}-${i}`}>{user[param]}</div> );
        }
        if( header && index++ === 0 )
          tr.push( <div className="row list-users" key="users-list-header">{headers}</div> );
        tr.push( <div className="row list-users" key={`users-list-table-filter-${i++}`}>{td}</div> );
      }
    } else if( this.state.isSearch ) {
      for( const user of this.state.searched ) {
        const td: JSX.Element[] = [];
        const headers: JSX.Element[] = [];
        for( const param in user ) {
          if( param === '_id' || param === '_rev' || param === 'password' || param === 'iat' || param === 'addresses' || param === 'points' || param === 'from' || param === 'to' || param === 'walue' )
            continue;
          if( header && index === 0 )
            headers.push( <div className="col-sm user" key={`users-list-header-param-${param}-${i}`}><b>{param}</b></div> );
          td.push( <div className="col-sm user" key={`users-list-table-search-content-${param}-${i}`}>{user[param]}</div> );
        }
        if( header && index++ === 0 )
          tr.push( <div className="row list-users" key="users-list-header">{headers}</div> );
        tr.push( <div className="row list-users" key={`users-list-table-search-${i++}`}>{td}</div> );
      }
    } else {
      for( let i = 0; i < this.state.users.length; i++ ) {
        const user = this.state.users[i];
        const td: JSX.Element[] = [];
        const headers: JSX.Element[] = [];
        for( const param in user ) {
          if( param === '_id' || param === '_rev' || param === 'password' || param === 'iat' || param === 'addresses' || param === 'points' || param === 'from' || param === 'to' || param === 'walue' )
            continue;
          if( header && index === 0 )
            headers.push( <div className="col-sm user" key={`users-list-header-param-${param}-${i}`}><b>{param}</b></div> );
          td.push( <div className="col-sm user" key={`users-list-table-content-${param}-${i}`}>{user[param]}</div> );
        }
        if( header && index++ === 0 )
          tr.push( <div className="row list-users" key="users-list-header">{headers}</div> );
        tr.push( <div className="row list-users" key={`users-list-table-${i}`}>{td}</div> );
      }
    }
    return tr;
  }

  render(): JSX.Element {
    return <div className="row" key="users-list">
      <div className="col-sm" key="users-list-content">
        {this.showUsers( true )}
      </div>
    </div>;
  }
}

export = ShowUsers;