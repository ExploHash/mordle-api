import { Socket } from "socket.io";
import { Game } from "../classes/Game";
import { CustomGameCreate } from "../events/client/CustomGameCreate";
import { GameIdentifier } from "../events/client/GameIdentifier";
import { CustomGameResponse } from "../events/server/CustomGameResponse";
import { collections } from "../services/Database";
import { ObjectId } from "mongodb";

export abstract class GameHandler {
    public static attach(socket: Socket) {
        socket.on("customGameCreate", (data, callback) => this.customGameCreate(socket, data, callback));
        socket.on("customGameJoin", (data, callback) => this.customGameJoin(socket, data, callback));
    }

    public static async customGameCreate(socket: Socket, customGameCreate: CustomGameCreate, callback) {
        const game = new Game();
        game.initializeGame(customGameCreate.type, [socket.data.user.identifier]);
        
        const result = await collections.games.insertOne(game);
        const response: CustomGameResponse = {
            id: result.insertedId.toHexString(),
            type: game.type,
        }
        
        await callback(response);
    }

    public static async customGameJoin(socket: Socket, gameIdentifier: GameIdentifier, callback) {
        console.log(gameIdentifier);
       
        //get game by _id from database
        const game = await collections.games.findOne({
            _id: new ObjectId(gameIdentifier.id),
        });

        if (!game) {
            throw new Error("Game not found");
        }

        if (game.status === "WaitingForPlayers") {    
            if(!game.playerIdentifiers.includes(socket.data.user.identifier))
                game.playerIdentifiers.push(socket.data.user.identifier);
    
            await collections.games.updateOne(
                {
                    _id: game._id,
                },
                {
                    $set: {
                        playerIdentifiers: game.playerIdentifiers,
                    },
                }
            );
        }

        const response: CustomGameResponse = {
            id: game._id.toHexString(),
            type: game.type,
        }

        await callback(response);
    }
}