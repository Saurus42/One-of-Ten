import socket = require( 'socket.io' );

class ServerRTC extends socket.Server {
  constructor( opts?: Partial<socket.ServerOptions> ) {
    super( opts );
  }
}

export = ServerRTC;