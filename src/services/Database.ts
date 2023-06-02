import * as mongoDB from "mongodb";

import { Game } from "../classes/Game";
import { PointsGame } from "../classes/gamemodes/PointsGame";
import { User } from "../classes/User";

export const collections: {
  games?: mongoDB.Collection<Game>;
  pointsGames?: mongoDB.Collection<PointsGame>;
  users?: mongoDB.Collection<User>;
} = {};

export async function connectToDatabase() {
  // Create a new MongoDB client with the connection string from .env
  const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING);

  // Connect to the cluster
  await client.connect();

  // Connect to the database with the name specified in .env
  const db = client.db(process.env.DB_NAME);

  const collectionMapping = {
    games: "games",
    pointsGames: "games",
    users: "users",
  };

  for (const [propertyName, collectionName] of Object.entries(
    collectionMapping
  )) {
    // Check if the collection exists
    if (!(await db.listCollections({ name: collectionName }).hasNext())) {
      // Create the collection
      await db.createCollection(collectionName);
    }

    // Assign the collection to the collections object
    // @ts-ignore
    collections[propertyName] = db.collection(collectionName);
  }

  console.log("Connected");
}
