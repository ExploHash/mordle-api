import { Board, BoardStatus } from "../Board";
import { Letter } from "../Letter";

export class PointsBoard extends Board {
  score: number = 0;
  presentLetters: string[] = [];
  locatedLetters: string[] = [];
  missingLetters: string[] = [];

  initializePointsBoard(word: string) {
    super.initializeBoard(word);
  }

  enter(): boolean {
    const rowIndex = this.currentRowIndex;
    //Call super
    const response = super.enter();
    if(!response) return false;

    //Calculate points for new present letters
    const newPresentLetters: Letter[] = this.letters[rowIndex]
      .filter(r => r.present)
      .filter(r => !this.presentLetters.includes(r.value));

    this.score += newPresentLetters.length * 5;
    this.presentLetters.push(...newPresentLetters.map(l => l.value));

    //Calculate scores for new located letters
    const newLocatedLetters: Letter[] = this.letters[rowIndex]
      .filter(r => r.located)
      .filter(r => !this.locatedLetters.includes(r.value));

    this.score += newLocatedLetters.length * 10;
    this.locatedLetters.push(...newLocatedLetters.map(l => l.value));

    //Add missing letters
    const newMissingLetters: Letter[] = this.letters[rowIndex]
      .filter(r => !r.located && !r.present)
      .filter(r => !this.presentLetters.includes(r.value))
      .filter(r => !this.locatedLetters.includes(r.value))
      .filter(r => !this.missingLetters.includes(r.value));

    this.missingLetters.push(...newMissingLetters.map(m => m.value));

    //Add bonus of solved
    if(this.status === BoardStatus.Solved){
      this.score += Math.floor(50 * ((this.boardSize - this.currentRowIndex + 1) / this.boardSize));
    }

    return true;
  }
}