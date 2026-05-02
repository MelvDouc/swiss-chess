import type Pairing from "$/Pairing.ts";
import type { PlayerId } from "$/Player.ts";
import { absToRelResult, RelativeResult } from "$/Result.ts";

/*
  - score
  - cumulative score = cumulative sum of scores after each round
  - number of wins
  - Buchholz = sum of opp scores
  - (after tallying indiv. scores) Sonneborg-Berger = sum of defeated opp scores + half sum of draw opp scores
  - (tie-break) = head-to-head encounter
  - (after sorting) for each round: opp rank + rel result
*/
export default class Standing {
  private static readonly RESULT_SORT_VALUES = [0, 0, 1, -1] as const;

  public readonly playerId: PlayerId;
  public points = 0;
  public buchholz = 0;
  public sonneborgBerger = 0;
  public progressivePoints = 0;
  public totalWins = 0;
  private readonly games: Game[] = [];

  public constructor(playerId: PlayerId) {
    this.playerId = playerId;
  }

  public updatePoints(pairing: Pairing): this {
    const isWhite = this.playerId === pairing.whiteId;
    const relResult = absToRelResult(pairing.absResult, isWhite);
    const opponentId = isWhite ? pairing.blackId : pairing.whiteId;

    switch (relResult) {
      case RelativeResult.Draw:
        this.points += 0.5;
        break;
      case RelativeResult.Win:
        this.points += 1;
    }

    this.progressivePoints += this.points;
    this.games.push({ opponentId, relResult, color: isWhite ? "W" : "B" });
    return this;
  }

  /**
   * Must be run after all standing points have been updated for all rounds.
   */
  public updateTieBreaks(table: Record<PlayerId, Standing>): this {
    let defeatedOppPoints = 0;
    let drawnOppPoints = 0;

    this.games.forEach(({ opponentId, relResult }) => {
      const oppPoints = table[opponentId].points;
      this.buchholz += oppPoints;

      switch (relResult) {
        case RelativeResult.Draw:
          drawnOppPoints += oppPoints;
          break;
        case RelativeResult.Win:
          defeatedOppPoints += oppPoints;
          this.totalWins++;
      }
    });

    this.sonneborgBerger = defeatedOppPoints + drawnOppPoints / 2;
    return this;
  }

  public compare(other: Standing): number {
    const diff = this.points - other.points
      || this.buchholz - other.buchholz
      || this.sonneborgBerger - other.sonneborgBerger
      || this.progressivePoints - other.progressivePoints
      || this.totalWins - other.totalWins;

    if (diff)
      return diff;

    for (const { opponentId, relResult } of this.games)
      if (opponentId === other.playerId)
        return Standing.RESULT_SORT_VALUES[relResult];

    return 0;
  }

  public stringifyGames(standings: Standing[]): string[] {
    return this.games.map(({ opponentId, relResult, color }) => {
      const oppRank = standings.findIndex(({ playerId }) => playerId === opponentId) + 1;

      switch (relResult) {
        case RelativeResult.None:
          return `?${oppRank + color}`;
        case RelativeResult.Draw:
          return `=${oppRank + color}`;
        case RelativeResult.Win:
          return `+${oppRank + color}`;
        case RelativeResult.Loss:
          return `-${oppRank + color}`;
      }
    });
  }
}

type Game = {
  readonly opponentId: PlayerId;
  readonly relResult: RelativeResult;
  readonly color: "W" | "B";
};