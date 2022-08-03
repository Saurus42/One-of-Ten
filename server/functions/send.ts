async function send( input: RequestInfo, init?: RequestInit | undefined ) {
  return await fetch( input, init );
}

export = send;