import { Server } from "socket.io";
import { User } from "../classes/User";
import { CustomGameResponse } from "../events/server/CustomGameResponse";
import { CustomGameCreate } from "../events/client/CustomGameCreate";
import { SessionHandler } from "./SessionHandler";
import { GameHandler } from "./GameHandler";

interface ServerToClientEvents {
  CustomGameResponse: CustomGameResponse;
}

interface ClientToServerEvents {
  InputEvent: InputEvent;
  CustomGameCreate: CustomGameCreate;
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
      SessionHandler.init(socket);
      GameHandler.init(socket);
    });
  }
}
