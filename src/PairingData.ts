import Pairing from "$/Pairing.ts";
import type { PlayerId } from "$/Player.ts";
import { AbsoluteResult } from "$/Result.ts";

/**
 * A class keeping track of a player's points, opponents and played colors.
 * Used for generating pairings after round 1.
 */
export default class PairingData {
  public readonly playerId: PlayerId;
  public points = 0;
  public colorBalance = 0;
  public lastPlayedWhite: boolean | null = null;
  public lastColorCount = 0;
  public readonly opponentIds = new Set<PlayerId>();

  public constructor(playerId: PlayerId) {
    this.playerId = playerId;
  }

  public update(pairing: Pairing): void {
    const isWhite = pairing.whiteId === this.playerId;
    this.colorBalance += isWhite ? 1 : -1;
    this.lastColorCount = this.lastPlayedWhite === isWhite ? this.lastColorCount + 1 : 1;
    this.lastPlayedWhite = isWhite;
    this.opponentIds.add(isWhite ? pairing.blackId : pairing.whiteId);

    switch (pairing.absResult) {
      case AbsoluteResult.WhiteWin:
        isWhite && (this.points++);
        break;
      case AbsoluteResult.BlackWin:
        !isWhite && (this.points++);
        break;
      case AbsoluteResult.Draw:
        this.points += 0.5;
    }
  }

  public getPairingWith(other: PairingData): Pairing | null {
    if (this.opponentIds.has(other.playerId))
      return null;

    if (!other.mustAlternateColors()) {
      const white = this.lastPlayedWhite ? other : this;
      const black = white === this ? other : this;
      return new Pairing(white.playerId, white.points, black.playerId, black.points);
    }

    if (!this.mustAlternateColors() || this.lastPlayedWhite !== other.lastPlayedWhite) {
      const white = other.lastPlayedWhite ? this : other;
      const black = white === this ? other : this;
      return new Pairing(white.playerId, white.points, black.playerId, black.points);
    }

    return null;
  }

  private mustAlternateColors(): boolean {
    return Math.abs(this.colorBalance) >= 2 || this.lastColorCount >= 2;
  }
}