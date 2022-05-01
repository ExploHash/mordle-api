import * as dotenv from "dotenv";
import { connectToDatabase, collections } from "./services/Database";
import { PointsGame } from "./classes/gamemodes/PointsGame";
import { Game, GameStatus } from "./classes/Game";
import { User } from "./classes/User";
import { SocketServer } from "./sockets/SocketServer";
import { Words } from "./util/Words";

dotenv.config();

async function main(){
  Words.init();
  await connectToDatabase();
  await SocketServer.init();
}

main();