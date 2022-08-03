async function sendAll( input: string[], init?: any[] ) {
  return await Promise.all( input.map( ( v, i ) => {
    if( init )
      return fetch( v, init[i] ).then( res => res.json() );
    else
      return fetch( v ).then( res => res.json() );
  } ) );
}

export = sendAll;