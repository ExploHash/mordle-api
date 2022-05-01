import { readFileSync } from "fs"


export class Words {
  static words: string[];

  static init(){
    //Grab random word from file
    const words = readFileSync("./res/words.txt", "utf8");
    this.words = words.split("\n");
  }

  static randomWord(){
    var randomIndex = Math.floor(Math.random() * this.words.length);
    return this.words[randomIndex].toUpperCase();
  }

  static wordExists(word){
    return this.words.includes(word.toLowerCase());
  }
}