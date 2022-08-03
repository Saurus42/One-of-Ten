import React = require( 'react' );

interface props {}
interface state {}

class StudentsMain extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }

  render(): JSX.Element {
    return <div className="row">
    <div className="col-sm">
      <p>Witam w kokpicie.</p>
    </div>
  </div>
  }
}

export = StudentsMain;
