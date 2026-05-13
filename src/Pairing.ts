import Player from "$/Player.ts";
import { GameResult } from "$/constants/Result.ts";

/**
 * Useful information about two players paired together at a given round.
 */
export default class Pairing {
  /**
   * Create a pairing for an exempt player.
   */
  public static byePairing(bye: Player, byePoints: number, round: number, board: number): Pairing {
    return new this(bye, byePoints, Player.NULL_PLAYER, 0, round, board, GameResult.WhiteWin);
  }

  public constructor(
    /**
     * Who plays white.
     */
    public readonly whitePlayer: Player,
    /**
     * How many points white has before the game.
    */
    public readonly whitePoints: number,
    /**
     * Who plays black.
     */
    public readonly blackPlayer: Player,
    /**
     * How many points black has before the game.
     */
    public readonly blackPoints: number,
    /**
     * The zero-based round number.
     */
    public readonly round: number,
    /**
     * The zero-based board number.
     */
    public readonly board: number,
    /**
     * The result of the game.
     */
    public result: GameResult = GameResult.None
  ) { }
}