import React = require( 'react' );
import Menu = require( '../../atom/Menu' );

interface props {
  names: string[]
  paths: string[]
  vertical: boolean
}
interface state {}

class Theme extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }

  render(): JSX.Element {
    return <div className="container">
      <div className="images">
        <img src="/images/header.jpg"/>
      </div>
      <Menu name={ this.props.names } path={ this.props.paths } vertical={ this.props.vertical } />
      <div className="content">{this.props.children}</div>
    </div>
  }
}

export = Theme;
