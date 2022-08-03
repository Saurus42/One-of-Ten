import React = require( 'react' );

class Html {
  static generate( App: JSX.Element, styles: string[], scripts: [string, boolean][] ) {
    return <html>
      <head>
        <meta charSet="utf-8" />
        { styles.map( style => <link rel="stylesheet" href={ style } /> ) }
        { scripts.map( script => <script type="module" async={ script[1] } defer={ !script[1] } src={ script[0] }></script> ) }
      </head>
      <body>
        <div id="root">{App}</div>
      </body>
    </html>
  }
}

export = Html;
