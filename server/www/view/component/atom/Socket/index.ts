import Socket = require( 'socket.io-client' );
export function createSocket( path: string ) {
  return new ClinetSocket( Socket.io( `${location.protocol}//${location.host}/`, {
    path,
    extraHeaders: {
      'Authorization': `Bearer ${localStorage.getItem( 'token' )}`
    }
  } ) );
}

class ClinetSocket {
  private socket: Socket.Socket;
  constructor( socket: Socket.Socket ) {
    this.socket = socket;
  }
  get client() {
    return this.socket;
  }
}

interface sock {
  saved: ClinetSocket | undefined
  save( socket?: ClinetSocket ): void
}

export const socket: sock = {
  save(socket?: ClinetSocket) {
    this.saved = socket;
  },
  saved: undefined
}