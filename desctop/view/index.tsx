import React = require( 'react' );
import ReactDOM = require( 'react-dom' );
import { Router } from 'react-router-dom';
import Root = require( './component/organizm/Root' );
import History = require( './component/atom/History' );

ReactDOM.render( <Router history={ History }><Root /></Router>, document.getElementById( 'root' ) );