import React = require( 'react' );
import send = require( '../../../../../functions/send' );

interface props {
  id: string
  token: string
  selected: string
  clear: () => void
}
interface state {}

class DeleteQuest extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
  }

  private deleteQuest = async () => {
    const config = require( '../../../../../config.json' );
    await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/questions?id=${this.props.selected}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    } )
    this.props.clear();
  }

  private showSelected(): JSX.Element {
    if( this.props.selected !== '' )
      return <div className="row">
        <div className="col-sm"><button type="button" onClick={ this.deleteQuest }>Usuń</button></div>
      </div>
    else
      return <></>
  }

  render(): JSX.Element {
    return <div className="row">
      <div className="col-sm">
        <div className="row">
          <div className="col-sm">Wybrane do usunięcia</div>
        </div>
        { this.showSelected() }
      </div>
    </div>
  }
}

export = DeleteQuest;
