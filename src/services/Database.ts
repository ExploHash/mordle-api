import { PointsGame } from "../classes/gamemodes/PointsGame";
import { User } from "../classes/User";
import { MikroORM } from "@mikro-orm/core";
import type { MongoDriver } from '@mikro-orm/mongodb'; // or any other SQL driver package

const clientUrl = process.env.DB_CONNECTION_STRING;

export var orm: MikroORM<MongoDriver>;

export async function connectToDatabase() {
    orm = await MikroORM.init<MongoDriver>({
      entities: [PointsGame, User],
      dbName: 'test',
      clientUrl,
      type: 'mongo',
    });
}