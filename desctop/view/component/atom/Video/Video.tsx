import React = require( 'react' );

interface props {
  stream?: MediaStream
  onLoadedMetadata?: ( event: React.SyntheticEvent<HTMLVideoElement, Event> ) => void
  id: string
  className: string
}
interface state {
  ref: React.RefObject<HTMLVideoElement>
}

class Video extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      ref: React.createRef<HTMLVideoElement>()
    }
  }

  render(): JSX.Element {
    return <video ref={ this.state.ref } onLoadedMetadata={ this.props.onLoadedMetadata } id={ this.props.id } className={ this.props.className }></video>;
  }

  componentDidMount(): void {
    this.updateVideoStream();
  }

  componentDidUpdate(): void {
    this.updateVideoStream();
  }

  updateVideoStream(): void {
    let stream = this.props.stream ? this.props.stream : null
    if( this.state.ref.current )
      if( this.state.ref.current.srcObject !== stream )
        this.state.ref.current.srcObject = stream;
  }
}

export = Video;
