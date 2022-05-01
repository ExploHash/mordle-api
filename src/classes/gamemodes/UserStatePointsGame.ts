import { User } from "../User";
import { PointsBoard } from "./PointsBoard";

export class UserStatePointsGame {
  user: User;
  boards: PointsBoard[] = [];
  boardIndex: number = 0;

  get currentBoard(){
    return this.boards[this.boardIndex];
  }

  get points(){
    return this.boards.reduce((points, board) => points + board.score, 0);
  }

  constructor(){}

  unfuck(){
    this.boards = this.boards.map(board => {
      const pointsBoard = new PointsBoard();
      Object.assign(pointsBoard, board);
      return pointsBoard;
    });
  }

  initalizeUserStatePointsGame(user: User, gamesAmount: number, words: string[]){
    this.user = user;
    for(let i = 0; i < gamesAmount; i++){
      const board = new PointsBoard();
      board.initializeBoard(words[i]);
      this.boards.push(board);
    }
  }
}