export class User {
  nickname: string;
  identifier: string;
  socketId: string;

  constructor(nickname: string, identifier: string) {
    this.nickname = nickname;
    this.identifier = identifier;
  }
}