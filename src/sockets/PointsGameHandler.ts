import { Socket } from "socket.io";
import { Game, GameStatus } from "../classes/Game";
import { CustomGameCreate } from "../events/client/CustomGameCreate";
import { GameIdentifier } from "../events/client/GameIdentifier";
import { CustomGameResponse } from "../events/server/CustomGameResponse";
import { collections } from "../services/Database";
import { ObjectId } from "mongodb";
import { PointsGame } from "../classes/gamemodes/PointsGame";
import { User } from "../classes/User";
import { PointsGameUpdate } from "../events/server/pointsGame/PointsGameUpdate";
import { InputEvent } from "../events/client/InputEvent";

export abstract class PointsGameHandler {
    public static attach(socket: Socket) {
        socket.on("joinPointsGame", (data, callback) => this.joinPointsGame(socket, data, callback));
        socket.on("inputPointsGame", (data, callback) => this.inputPointsGame(socket, data, callback));
    }

    public static async joinPointsGame(socket: Socket, gameIdentifier: GameIdentifier, callback){
      //grab game
      console.log(gameIdentifier);
      const result: PointsGame = await collections.pointsGames.findOne({
        _id: new ObjectId(gameIdentifier.id),
      });

      const game = Object.assign(new PointsGame(), result);

      if (!game) {
          throw new Error("Game not found");
      }

      console.log(game);
      //Join player
      const user: User = socket.data.user;
      await game.joinPlayer(socket.data.user);
      game.unfuck();

      //Update database
      await collections.pointsGames.replaceOne({
        _id: new ObjectId(gameIdentifier.id),
      }, game);

      if(game.status === GameStatus.Started){
        //First update myself
        const userState = game.userStates.find(userState => userState.user.identifier === user.identifier);
        
        const myData: PointsGameUpdate = {
          nickname: user.nickname,
          points: userState.points,
          game: userState.boardIndex + 1,
          board: userState.currentBoard?.letters || [],
          locatedLetters: userState.currentBoard?.locatedLetters || [],
          presentLetters: userState.currentBoard?.presentLetters || [],
          missingLetters: userState.currentBoard?.missingLetters || []
        }

        socket.emit("pointsGameUpdate", myData);

        //Update myself with enemy
        const enemyUserState = game.userStates.find(userState => userState.user.identifier !== user.identifier);
        
        const enemyUser = await collections.users.findOne({identifier: enemyUserState.user.identifier});

        socket.to(enemyUser.socketId).emit("pointsGameUpdate", {
          ...myData,
          board: userState.currentBoard?.anonLetters || []
        });

        const enemyData: PointsGameUpdate = {
          nickname: enemyUserState.user.nickname,
          points: enemyUserState.points,
          game: enemyUserState.boardIndex + 1,
          board: enemyUserState.currentBoard.anonLetters
        }

        socket.emit("pointsGameUpdate", enemyData);

        socket.to(enemyUser.socketId).emit("pointsGameUpdate", {
          ...enemyData,
          board: enemyUserState.currentBoard?.letters || []
        });
      }
    }

    public static async inputPointsGame(socket: Socket, inputEvent: InputEvent, callback){
      //grab game
      const result: PointsGame = await collections.pointsGames.findOne({
        _id: new ObjectId(inputEvent.gameId),
      });

      const game = Object.assign(new PointsGame(), result);
      game.unfuck();

      if (!game) {
          throw new Error("Game not found");
      }

      //Listen for messages
      const userState = game.userStates.find(userState => userState.user.identifier === socket.data.user.identifier);
      userState.currentBoard.on("message", (message) => {
        socket.emit("pointsGameMessage", message);
      });
      //Add input
      game.input(socket.data.user, inputEvent.character);

      //check for winner
      const enemyIdentifier = game.playerIdentifiers.find(id => id !== socket.data.user.identifier);
      const enemyUser = await collections.users.findOne({ identifier: enemyIdentifier });

      if(game.winner){
        if(game.winner.identifier === socket.data.user.identifier){
          socket.emit("pointsGameMessage", "You won! Congratz!");
          socket.to(enemyUser.socketId).emit("You lost :( Better next time");
        }else{
          socket.to(enemyUser.socketId).emit("pointsGameMessage", "You won! Congratz!");
          socket.emit("pointsGameMessage", "You lost :( Better next time");
        }
      }

      //Update database
      await collections.pointsGames.replaceOne({
        _id: new ObjectId(inputEvent.gameId),
      }, game);

      //Send update
      const res = await this.sendUpdate(socket, game, socket.data.user);
    }

    public static async sendUpdate(socket: Socket, game: PointsGame, user: User){
      //First update myself
      const userState = game.userStates.find(userState => userState.user.identifier === user.identifier);
      
      const myData: PointsGameUpdate = {
        nickname: user.nickname,
        points: userState.points,
        game: userState.boardIndex + 1,
        board: userState.currentBoard.letters,
        locatedLetters: userState.currentBoard?.locatedLetters || [],
        presentLetters: userState.currentBoard?.presentLetters || [],
        missingLetters: userState.currentBoard?.missingLetters || []
      }

      await socket.emit("pointsGameUpdate", myData);

      //Update enemy
      const enemyData: PointsGameUpdate = {
        ...myData,
        board: userState.currentBoard.anonLetters
      }

      const enemyIdentifier = game.playerIdentifiers.find(id => id !== user.identifier);
      const enemyUser = await collections.users.findOne({ identifier: enemyIdentifier });

      await socket.to(enemyUser.socketId).emit("pointsGameUpdate", enemyData);
    }
}