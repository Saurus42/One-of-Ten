import React = require( 'react' );

interface props {
  content: string
}
interface state {}

class Message extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }

  render(): JSX.Element {
    return <p>{this.props.content}</p>
  }
}

export = Message;
