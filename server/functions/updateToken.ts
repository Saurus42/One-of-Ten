import send = require( './send' );
import History = require( '../www/view/component/atom/History' );
import Cookie = require( '../modules/cookie-browser' );

function updateToken() {
  const cookie = new Cookie();
  const token1 = cookie.get( 'token' );
  const token2 = localStorage.getItem( 'token' );
  const config = require( '../config.json' );
  if( token1 === token2 ) {
    const token = token1;
    send( `${location.protocol}//${location.host}:${config.port}/${config.api}/key`, {
      headers: {
        'Content-Type': `Bearer ${token}`
      }
    } ).then( res => res.text() ).then(key => {
      // @ts-ignore
      importSPKI( key, 'RS256' ).then(key => {
        // @ts-ignore
        jwtVerify( token, key, { algorithms: ['RS256'] } ).then( value => {
          const { payload } = value;
          const { role, id } = payload;
          localStorage.setItem( 'role', role );
          localStorage.setItem( 'ID', id );
          History.push(`/${role}`);
        } );
      } );
    } );
  }
}

export = updateToken;