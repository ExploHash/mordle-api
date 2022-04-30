import { Game, GameTypes } from '../Game';

export class PointsGame extends Game {
  userStates: 
  constructor(playerIdentifiers: string[]) {
    super(GameTypes.Points, playerIdentifiers);
  }
}

e