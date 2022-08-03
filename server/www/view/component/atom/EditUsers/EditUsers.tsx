import React = require( 'react' );

interface props {
  token: string
}
interface state {}

class EditUsers extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }

  render(): JSX.Element {
    return <></>;
  }
}

export = EditUsers;