import { Letter } from "../../../classes/Letter";

export interface PointsGameUpdate {
  nickname: string;
  points: number;
  game: number;
  board: Letter[][];
  presentLetters?: string[];
  locatedLetters?: string[];
  missingLetters?: string[];
}