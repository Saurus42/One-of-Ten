import React = require( 'react' );

interface props {}
interface state {}

class AdminMain extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {}
  }

  render(): JSX.Element {
    return <div className="row">
      <div className="col-sm">
        <p>Witaj w panelu administracyjnym.</p>
      </div>
    </div>
  }
}

export = AdminMain;