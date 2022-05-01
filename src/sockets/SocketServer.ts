import { Server } from "socket.io";
import { User } from "../classes/User";
import { CustomGameResponse } from "../events/server/CustomGameResponse";
import { CustomGameCreate } from "../events/client/CustomGameCreate";
import { SessionHandler } from "./SessionHandler";
import { GameHandler } from "./GameHandler";
import { PointsGameHandler } from "./PointsGameHandler";
import { PointsGameUpdate } from "../events/server/pointsGame/PointsGameUpdate";

interface ServerToClientEvents {
  CustomGameResponse: CustomGameResponse;
  
}

interface ClientToServerEvents {
  InputEvent: InputEvent;
  CustomGameCreate: CustomGameCreate;
  PointsGameUpdate: PointsGameUpdate;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  authenticated: true;
  user: User;
}

export abstract class SocketServer {
  public static io: Server;

  public static init() {
    this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(6969, {
      cors: {
        origin: "http://localhost:3000"
      }
    });

    this.io.on("connection", (socket) => {
      console.log("User connected");
      SessionHandler.attach(socket);
      GameHandler.attach(socket);
      PointsGameHandler.attach(socket);
    });
  }
}
