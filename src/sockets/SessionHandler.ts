import { Socket } from "socket.io";
import { User } from "../classes/User";

import { collections } from "../services/Database";

export abstract class SessionHandler {
  public static attach(socket: Socket) {
    socket.on("register", async (user: User, callback) => {
      console.log("User registered: " + user.nickname);
      //Save to socketdata
      socket.data.authenticated = true;
      socket.data.user = user;
      //Also save to database
      user.socketId = socket.id;
      console.log(socket.id);
      //Try to get the user from the database
      const userFromDB = await collections.users.findOne({
        identifier: user.identifier,
      });

      if (userFromDB) {
        //If the user is found, update the socketId
        await collections.users.updateOne(
          {
            _id: userFromDB._id,
          },
          {
            $set: {
              socketId: socket.id,
            },
          }
        );
      }else {
        await collections.users.insertOne(user);
      }

      if(callback) callback();
    });
  }
}