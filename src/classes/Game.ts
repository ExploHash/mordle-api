import { ObjectId } from "mongodb";

export enum GameStatus {
  WaitingForPlayers = 'WaitingForPlayers',
  Started = 'Started',
  Finished = 'Finished'
}

export enum GameTypes {
  Points = 'points'
}

export class Game {
  _id?: ObjectId;
  playerIdentifiers: string[];
  status: GameStatus;
  type: GameTypes;

  constructor(type: GameTypes, playerIdentifiers: string[]) {
    this.playerIdentifiers = playerIdentifiers;
    this.type = type;
    this.status = GameStatus.WaitingForPlayers;
  }
}