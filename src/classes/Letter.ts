export class Letter {
  value: string;
  present: boolean = false;
  located: boolean =  false;

  constructor(letter: string){
    this.value = letter;
  }
}