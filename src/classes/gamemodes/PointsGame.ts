import { Game, GameStatus, GameTypes } from '../Game';
import { User } from '../User';
import { UserStatePointsGame } from './UserStatePointsGame';
import { collections } from '../../services/Database';
import { BoardStatus } from '../Board';
import { Words } from '../../util/Words';

export class PointsGame extends Game {
  gamesAmount: number = 3;
  joinedUsers: string[] = [];

  userStates: UserStatePointsGame[] = [];
  winner: User;
  
  constructor() {
    super()
  }

  initializePointsGame(playerIdentifiers: string[]){
    super.initializeGame(GameTypes.Points, playerIdentifiers);
  }

  unfuck(){
  this.userStates = this.userStates.map(userState => {
      const state = new UserStatePointsGame();
      Object.assign(state, userState);
      state.unfuck();
      return state;
    });
  }

  async start(){
    //Grab words
    let words: string[] = [];
    for(let i = 0; i < this.gamesAmount; i++){
      words.push(Words.randomWord());
    }
    //Grab users
    const users = await Promise.all(this.playerIdentifiers.map(id => {
      return collections.users.findOne({identifier: id});
    }));

    this.userStates = users.map(user => {
      const state = new UserStatePointsGame();
      state.initalizeUserStatePointsGame(user, this.gamesAmount, words);
      return state;
    });

    //Set state
    this.status = GameStatus.Started;
  }

  public async joinPlayer(user: User){
    if(!this.joinedUsers.includes(user.identifier)){
      this.joinedUsers.push(user.identifier);

      if(this.joinedUsers.length === 2){
        await this.start();
      }
    }

  }

  input(user: User, char: string){
    const userState = this.userStates.find(userState => userState.user.identifier === user.identifier);
    const { currentBoard } = userState;

    switch(char){
      case "{enter}":
        currentBoard.enter();
        break;
      case "{bksp}":
        currentBoard.backspace();
        break;
      default:
        currentBoard.placeLetter(char);
        break;
    }

    if(currentBoard.status !== BoardStatus.Guessing){
      //Start new game
      if(this.gamesAmount > userState.boardIndex + 1) userState.boardIndex++;
      
      //Check for game end
      if(this.userStates.every(userState => userState.boardIndex === this.gamesAmount - 1 && userState.currentBoard.status !== BoardStatus.Guessing)){
        this.status = GameStatus.Finished;
        //Set winner
        this.winner = this.userStates.reduce((topUserState, currentUserState) => {
          return topUserState.points < currentUserState.points ? currentUserState : topUserState;
        }, this.userStates[0]).user;
      }
    }
  }
}