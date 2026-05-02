import { COLOR_INITIALS, type RealColor } from "$/constants/Color.ts";
import type { Score } from "$/constants/Result.ts";
import type { PlayerId } from "$/Player.ts";

/**
 * The details of a game from one of the players' perspective.
 */
export default class Game {
  private static readonly SCORE_SIGNS = ["?", "=", "+", "-"] as const;

  public constructor(
    public readonly opponentId: PlayerId,
    public readonly color: RealColor,
    public readonly score: Score
  ) { }

  public asPublic(rankingRec: Record<PlayerId, number>): PublicStandingGame {
    return {
      opponentId: this.opponentId,
      color: this.color,
      score: this.score,
      notation: this.notation(rankingRec[this.opponentId] ?? 0)
    };
  }

  private notation(opponentRank: number): string {
    const resultSign = Game.SCORE_SIGNS[this.score];
    const color = COLOR_INITIALS[this.color];
    return resultSign + opponentRank.toString() + color;
  }
}

export type PublicStandingGame = {
  opponentId: PlayerId;
  color: RealColor;
  score: Score;
  notation: string;
};