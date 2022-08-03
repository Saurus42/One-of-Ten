import React = require( 'react' );
import History = require( '../History' );

interface props {
  classes: any[]
  selectedClass( data: any ): void
}
interface state {}

export = class ListClasses extends React.Component<props, state> {
  private selectedClass({ index }: { index: number; }) {
    return ( event: React.MouseEvent<HTMLElement, MouseEvent> ) => {
      this.props.selectedClass( this.props.classes[index] );
      History.push( `/classes/${this.props.classes[index].name}` );
    }
  }

  render() {
    const tr: JSX.Element[] = []
    let index = 0;
    const tab: JSX.Element[] = [];
    for( let i = 0; i < this.props.classes.length; i++ ) {
      tr.push(
        <div className="class" key={ `class-${i}` } onClick={ this.selectedClass({ index: i }) }>
          {this.props.classes[i].name}
        </div>
      );
      index += 2;
      if( index >= 12 ) {
        tab.push( <div className="list-classes" key={ `class-list-${i}` }>{tr.splice( 0, tr.length )}</div> );
        index = 0;
      }
    }
    if( index <= 12 && index > 0 )
      tab.push( <div className="list-classes" key="class-list-last">{tr.splice( 0, tr.length )}</div> );
    return tab;
  }
}