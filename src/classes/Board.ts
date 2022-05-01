import { Letter } from "./Letter";
import { Words } from "../util/Words";
import { EventEmitter } from "events";

export class Board extends EventEmitter{
  word: string;
  letters: Letter[][] = [];
  currentRowIndex: number = 0;
  status: BoardStatus = BoardStatus.Guessing;

  protected rowSize: number = 5;
  protected boardSize: number = 6;

  constructor(){
    super();
    //Initialize empty rows
    for(let i = 0; i < this.boardSize; i++){
      this.letters.push([]);
    }
  }

  initializeBoard(word: string){
    this.word = word;
  }

  get currentRow(){
    return this.letters[this.currentRowIndex];
  }

  get anonLetters(): Letter[][] {
    const letters = [];

    for(const row of this.letters){
      const anonRow = [];
      for(const letter of row){
        anonRow.push({...letter, value: ""});
      }
      letters.push(anonRow);
    }

    return letters;
  }

  placeLetter(letter: string){
    if(this.status !== BoardStatus.Guessing){
      throw new Error("Modifying board with a failed state")
    }

    if(this.currentRow.length < 5){
      this.currentRow.push(new Letter(letter));
    }
  }

  enter(){
    if(this.currentRow.length < 5){
      this.emit("message", "Please fill in a complete word");
      return false;
    }
    if(!Words.wordExists(this.currentRow.map(w => w.value).join(""))){
      this.emit("message", "Word not in word list");
      return false;
    }

    let amountLocated: number = 0;

    for(let [index, letter] of Object.entries(this.currentRow)){
      if(this.word[index] === letter.value){
        letter.located = true;
        amountLocated++;
      }
    }

    const wordPresentIndexes = [];

    for(let [index, letter] of Object.entries(this.currentRow)){
      if(!letter.located){
        const letterEntries = Object.entries(this.word.split(""))
          .filter(([index, foundLetter]) => foundLetter === letter.value);
  
        if(letterEntries.length){
          //Find letters who haven't been located yet
          for(const [index, char] of letterEntries){
            const nIndex = parseInt(index);
            if((this.currentRow[nIndex].value !== char || !this.currentRow[nIndex].located) && !wordPresentIndexes.includes(nIndex)){
              letter.present = true;
              wordPresentIndexes.push(nIndex);
              break;
            }
          }
        }
      }
    }

    if(amountLocated === this.rowSize){
      this.emit("message", "Correct! Well done");
      this.status = BoardStatus.Solved;
    }else if(this.currentRowIndex + 1 === this.boardSize){
      this.emit("message", "Wasn't it: " + this.word);
      this.status = BoardStatus.Failed;
    }else{
      this.currentRowIndex++;
    }

    return true;
  }

  backspace(){
    this.currentRow.pop();
  }
}

export enum BoardStatus {
  Guessing = "guessing",
  Solved = "solved",
  Failed = "failed"
}