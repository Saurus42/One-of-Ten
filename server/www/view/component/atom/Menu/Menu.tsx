import React = require( 'react' );
import { Link } from 'react-router-dom';

interface props {
  name: string[]|JSX.Element[]
  path: string[]
  vertical: boolean
  submenu?: boolean
}
interface state {}

class Menu extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }

  createContext = ( value: string | JSX.Element, index: number ) => {
    return <Link className={ this.props.vertical ? 'menu-vertical' : 'menu-horizontal' } key={`item-${index}`} to={ this.props.path[index] }>{value}</Link>
  }

  render(): JSX.Element {
    let className = 'menu';
    let key = 'menu';
    if( this.props.submenu ) {
      className = `sub${className}`;
      key += `sub${key}`;
    }
    return <nav className={ className } key={ key }>
      { this.props.name.map( this.createContext ) }
    </nav>;
  }
}

export = Menu;
