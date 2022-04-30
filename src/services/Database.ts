import * as mongoDB from "mongodb";

import { Game } from "../classes/Game";
import { User } from "../classes/User";

export const collections: {
  games?: mongoDB.Collection<Game>,
  users?: mongoDB.Collection<User>,
} = {};

export async function connectToDatabase() {
    // Create a new MongoDB client with the connection string from .env
    const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING);

    // Connect to the cluster
    await client.connect();

    // Connect to the database with the name specified in .env
    const db = client.db(process.env.DB_NAME);

    const collectionNames = ["games", "users"];

    for(const collectionName of collectionNames) {
      await db.listCollections({name: collectionName}).next(async (err, collinfo) => {
        if (!collinfo) {
          await db.createCollection(collectionName);
        }
      });

      collections[collectionName] = db.collection(collectionName);
    }

    console.log("Connected");
}