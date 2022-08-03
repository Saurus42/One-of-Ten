import nano = require( 'nano' );

class Database<T> {
  private connected: nano.ServerScope
  private DB?: nano.DocumentScope<T>
  constructor( user: string, password: string, host: string, port: number ) {
    this.connected = nano( `http://${user}:${password}@${host}:${port}` );
  }
  connect( name: string ) {
    this.DB = this.connected.use<T>( name );
  }
  static async createDocument( name: string, user: string, password: string, host: string, port: number  ) {
    try {
      const doc = await nano( `http://${user}:${password}@${host}:${port}` ).db.create( name );
      return doc.ok === undefined ? false : doc.ok;
    } catch {
      return false;
    }
  }
  static async removeDocument( name: string, user: string, password: string, host: string, port: number  ) {
    try {
      const doc = await nano( `http://${user}:${password}@${host}:${port}` ).db.destroy( name );
      return doc.ok === undefined ? false : doc.ok;
    } catch {
      return false;
    }
  }
  get list() {
    return new Promise<nano.DocumentListResponse<T>>( async ( resolve, reject ) => {
      const list = await this.DB?.list();
      if( list )
        resolve( list );
      else
        reject( undefined );
    } );
  }
  async get( docname: string ) {
    return await this.DB?.get( docname );
  }
  async post( data: nano.ViewDocument<T> | (T & nano.MaybeDocument ) ) {
    return await this.DB?.insert( data );
  }
  async put( data: nano.ViewDocument<T> | (T & nano.MaybeDocument ) ) {
    return await this.DB?.insert( data );
  }
  async delete( data: (nano.DocumentGetResponse & T) ) {
    return await this.DB?.destroy( data._id, data._rev );
  }
}
export = Database;
