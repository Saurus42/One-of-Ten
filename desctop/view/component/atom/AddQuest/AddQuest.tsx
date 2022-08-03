import React = require( 'react' );
import send = require( '../../../../functions/send' );

interface props {}
interface state {
  category: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  checked: string
  question: string
  goodAnswer: string
  [key: string]: string
}
interface questI {
  category: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  question: string
  goodAnswer: string
  teacher: string | null
}

class AddQuest extends React.Component<props, state> {
  constructor( props: props ) {
    super( props );
    this.state = {
      category: '',
      answerA: '',
      answerB: '',
      answerC: '',
      answerD: '',
      checked: '',
      goodAnswer: '',
      question: ''
    };
  }

  private sendQuest = async ( e: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
    const config = require( '../../../../config.json' );
    const data: questI = {
      category: this.state.category,
      answerA: this.state.answerA,
      answerB: this.state.answerB,
      answerC: this.state.answerC,
      answerD: this.state.answerD,
      goodAnswer: this.state.goodAnswer,
      question: this.state.question,
      teacher: localStorage.getItem( 'ID' )
    }
    const respond =  await send( `${location.protocol}//${location.host}:${config.port}/${config.api}/questions`, {
      body: JSON.stringify( data ),
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem( 'token' )}`,
        'Content-Type': 'application/json'
      }
    } ).then( res => res.json() );
    if( respond.ok ) {
      console.log( 'Dodano pytanie.' );
      this.setState( { category: '', answerA: '', answerB: '', answerC: '', answerD: '', goodAnswer: '', question: '' } );
    } else 
      console.error( 'Zapis się nie powiódł.' );
  }

  private checked = ( e: React.ChangeEvent<HTMLInputElement>, key: string, value: string ) => {
    this.setState( { checked: e.currentTarget.value, [key]: value } );
  }

  private setValue( key: string, value: string ): (e: React.ChangeEvent<HTMLInputElement>) => void {
    return ( e: React.ChangeEvent<HTMLInputElement> ) => {
      this.checked( e, key, value );
    }
  }

  render(): JSX.Element {
    return <div className="add-quest">
      <div className="row-quest">
        <div className="col-sm-2">Kategoria</div>
        <div className="col-sm"></div>
        <div className="col-sm-9"><input type="text" onChange={ e => this.setState( { category: e.currentTarget.value } ) } /></div>
      </div>
      <div className="row-quest">
        <div className="col-sm-2">Odpowiedź A</div>
        <div className="col-sm"><input type="radio" value="answerA" checked={ this.state.checked === 'answerA' } onChange={ this.setValue( 'answerA', this.state.answerA ) } /></div>
        <div className="col-sm-9"><input type="text" onChange={ e => this.setState( { answerA: e.currentTarget.value } ) } /></div>
      </div>
      <div className="row-quest">
        <div className="col-sm-2">Odpowiedź B</div>
        <div className="col-sm"><input type="radio" value="answerB" checked={ this.state.checked === 'answerB' } onChange={ this.setValue( 'answerB', this.state.answerB ) } /></div>
        <div className="col-sm-9"><input type="text" onChange={ e => this.setState( { answerB: e.currentTarget.value } ) } /></div>
      </div>
      <div className="row-quest">
        <div className="col-sm-2">Odpowiedź C</div>
        <div className="col-sm"><input type="radio" value="answerC" checked={ this.state.checked === 'answerC' } onChange={ this.setValue( 'answerC', this.state.answerC ) } /></div>
        <div className="col-sm-9"><input type="text" onChange={ e => this.setState( { answerC: e.currentTarget.value } ) } /></div>
      </div>
      <div className="row-quest">
        <div className="col-sm-2">Odpowiedź D</div>
        <div className="col-sm"><input type="radio" value="answerD" checked={ this.state.checked === 'answerD' } onChange={ this.setValue( 'answerD', this.state.answerD ) } /></div>
        <div className="col-sm-9"><input type="text" onChange={ e => this.setState( { answerD: e.currentTarget.value } ) } /></div>
      </div>
      <div className="row-quest">
        <div className="col-sm">Treść pytania</div>
        <div className="col-sm-9"><textarea cols={50} rows={20} onChange={ e => this.setState( { question: e.currentTarget.value } ) }></textarea></div>
      </div>
      <div className="row-quest">
        <div className="col-sm"><button type="button" onClick={ this.sendQuest }>Dodaj</button></div>
      </div>
    </div>;
  }
}

export = AddQuest;
