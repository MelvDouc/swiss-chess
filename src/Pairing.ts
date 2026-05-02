import Player from "$/Player.ts";
import { GameResult } from "$/constants/Result.ts";

/**
 * Useful information about two players paired together at a given round.
 */
export default class Pairing {
  public static byePairing(bye: Player, byePoints: number, round: number, board: number): Pairing {
    return new this(bye, byePoints, Player.NULL_PLAYER, 0, round, board, GameResult.WhiteWin);
  }

  public constructor(
    public readonly whitePlayer: Player,
    public readonly whitePoints: number,
    public readonly blackPlayer: Player,
    public readonly blackPoints: number,
    public readonly round: number,
    public readonly board: number,
    public result: GameResult = GameResult.None
  ) { }
}