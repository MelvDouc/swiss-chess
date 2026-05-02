import Color from "$/constants/Color.ts";
import { resultToScore, Score } from "$/constants/Result.ts";
import type Pairing from "$/Pairing.ts";
import type { default as Player, PlayerId } from "$/Player.ts";
import StandingGame, { type PublicStandingGame } from "$/standings/StandingGame.ts";

export default class Standing {
  private static readonly SCORE_SORT_VALUES = [0, 0, 1, -1] as const;

  private _points = 0;
  private _buchholz = 0;
  private _sonnebornBerger = 0;
  private _progressivePoints = 0;
  private _totalWins = 0;
  private readonly _games: Map<PlayerId, StandingGame> = new Map();

  public constructor(public readonly player: Player) { }

  public get points(): number {
    return this._points;
  }

  public get buchholz(): number {
    return this._buchholz;
  }

  public get sonnebornBerger(): number {
    return this._sonnebornBerger;
  }

  public get progressivePoints(): number {
    return this._progressivePoints;
  }

  public get totalWins(): number {
    return this._totalWins;
  }

  public get games(): StandingGame[] {
    return [...this._games.values()];
  }

  public opponentAverages(standingMap: Map<PlayerId, Standing>) {
    let count = 0;
    let buchholz = 0;
    let rating = 0;

    for (const opponentId of this._games.keys()) {
      const opponentStanding = standingMap.get(opponentId);

      if (opponentStanding !== undefined) {
        count++;
        buchholz += opponentStanding.buchholz;
        rating += opponentStanding.player.rating;
      }
    }

    return {
      buchholz: buchholz / count,
      rating: rating / count
    };
  }

  public asPublic(rankingRec: Record<PlayerId, number>, rank: number): PublicStanding {
    return {
      rank,
      player: this.player,
      points: this.points,
      Buchholz: this.buchholz,
      SonnebornBerger: this.sonnebornBerger,
      progressiveScore: this.progressivePoints,
      wins: this.totalWins,
      games: this.games.map((game) => game.asPublic(rankingRec))
    };
  }

  public updatePoints(pairing: Pairing): this {
    const isWhite = this.player.id === pairing.whitePlayer.id;
    const score = resultToScore(pairing.result, isWhite);
    const opponentId = isWhite ? pairing.blackPlayer.id : pairing.whitePlayer.id;
    const color = isWhite ? Color.White : Color.Black;

    switch (score) {
      case Score.Draw:
        this._points += 0.5;
        break;
      case Score.Win:
        this._points += 1;
    }

    this._progressivePoints += this._points;
    this._games.set(opponentId, new StandingGame(opponentId, color, score));
    return this;
  }

  /**
   * Must be run after all standing points have been updated for all rounds.
   */
  public updateTieBreaks(standingRec: Record<PlayerId, Standing>): this {
    let defeatedOppPoints = 0;
    let drawnOppPoints = 0;

    this._games.forEach(({ score }, opponentId) => {
      const opponentPoints = standingRec[opponentId]?.points ?? 0;
      this._buchholz += opponentPoints;

      switch (score) {
        case Score.Draw:
          drawnOppPoints += opponentPoints;
          break;
        case Score.Win:
          defeatedOppPoints += opponentPoints;
          this._totalWins++;
      }
    });

    this._sonnebornBerger = defeatedOppPoints + drawnOppPoints / 2;
    return this;
  }

  public compare(other: Standing): number {
    const diff = this._points - other._points
      || this._buchholz - other._buchholz
      || this._sonnebornBerger - other._sonnebornBerger
      || this._progressivePoints - other._progressivePoints
      || this._totalWins - other._totalWins;

    if (diff)
      return diff;

    const game = this._games.get(other.player.id);
    return game ? Standing.SCORE_SORT_VALUES[game.score] : 0;
  }
}

export type PublicStanding = {
  rank: number;
  player: Player;
  points: number;
  Buchholz: number;
  SonnebornBerger: number;
  progressiveScore: number;
  wins: number;
  games: PublicStandingGame[];
};