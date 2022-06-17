import { Entity, Property, PrimaryKey, SerializedPrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "mongodb";

@Entity()
export class User {
  @PrimaryKey()
  _id: ObjectId;

  @SerializedPrimaryKey()
  id!: string; // won't be saved in the database

  @Property()
  nickname: string;

  @Property()
  identifier: string;
  
  @Property()
  socketId: string;

  constructor(nickname: string, identifier: string) {
    this.nickname = nickname;
    this.identifier = identifier;
  }
}