interface RootObject {
  version: string;
  database: Database;
}

interface Database {
  login: string;
  password: string;
  host: string;
  port: number;
}

export = RootObject;