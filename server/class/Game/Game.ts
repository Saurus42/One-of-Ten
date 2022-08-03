import Database = require( "../Database" );
import Type = require( '../../configureTypes' );
import nano = require("nano");

interface question {
  teacher: string
  category: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  question: string
  goodAnswer: string
}

interface classesI {
  students: string[]
  name: string
  educator: string
  quests?: string[]
}

class Game {
  private database: Database<question>
  private questions: Map<string, question>
  private pastQuestion: Set<question>
  private users: Set<string>
  private _teacher: string
  private ids: string[]
  private idClass: string
  constructor( teacher: string, idClass: string ) {
    this._teacher = teacher;
    this.ids = [];
    this.idClass = idClass;
    const config: Type = require( '../../configure.json' );
    this.questions = new Map();
    this.pastQuestion = new Set();
    this.users = new Set();
    this.database = new Database( config.database.login, config.database.password, config.database.host, config.database.port );
    this.getClass().then( () => { this.getAllQuestions(); } )
  }

  private async getClass() {
    this.database.connect( 'classes' );
    const classes = await this.database.get( this.idClass ) as any as nano.DocumentGetResponse & classesI;
    if( classes.quests === undefined )
      classes.quests = [];
    this.ids = classes.quests;
  }

  private async getAllQuestions() {
    this.database.connect( 'questions' );
    const question = await Promise.all( this.ids.map( async id => await this.database.get( id ) as any as nano.DocumentGetResponse & question) );
    for( const quest of question ) {
      if( quest.teacher !== this.teacher )
        continue;
      this.questions.set( quest._id, quest );
    }
  }

  private random = ( min: number, max: number ) => Math.floor( Math.random() * ( max - min ) + min )

  randomQuestion() {
    let num = this.random( 0, this.questions.size );
    for( const [ key, value ] of this.questions ) {
      if( num === 0 ) {
        this.pastQuestion.add( value );
        this.questions.delete( key );
        return value;
      }
      num--;
    }
    return null;
  }

  addUser( newUser: string ) {
    this.users.add( newUser );
  }

  deleteUser( newUser: string ) {
    this.users.delete( newUser );
  }

  get players() {
    const tab: string[] = []
    for( const user of this.users ) {
      tab.push( user );
    }
    return tab;
  }

  get teacher() {
    return this._teacher;
  }

  clear() {
    this.questions.clear();
    this.pastQuestion.clear();
  }
}

export = Game;
