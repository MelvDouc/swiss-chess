import Color, { type RealColor } from "$/constants/Color.ts";
import { RESULT_TO_POINTS } from "$/constants/Result.ts";
import type Pairing from "$/Pairing.ts";
import { default as Player, type PlayerId } from "$/Player.ts";

export default class PairingInfo {
  private static lastColorCount(colors: RealColor[]): number {
    let count = 0;

    for (let i = colors.length - 1; i > 0; i--) {
      count++;

      if (colors[i] !== colors[i - 1])
        break;
    }

    return count;
  }

  private readonly _opponentIds = new Set<PlayerId>();
  private readonly _colors: RealColor[] = [];
  private _points = 0;
  private _whiteGames = 0;
  private _lastColorCount = 0;

  public constructor(
    public readonly player: Player
  ) { }

  public get points(): number {
    return this._points;
  }

  public get whiteGames(): number {
    return this._whiteGames;
  }

  public get lastColor(): Color {
    return this.nthLastColor(1);
  }

  public get colorBalance(): number {
    /*
    blackGames = games - whiteGames
    whiteGames - blackGames
    = whiteGames - (games - whiteGames)
    = whiteGames - games + whiteGames
    = 2 * whiteGames - games
    */
    return 2 * this._whiteGames - this._colors.length;
  }

  public hasPlayedAgainst(opponentId: PlayerId): boolean {
    return this._opponentIds.has(opponentId);
  }

  public canBeenBye(maxSameColor: number): boolean {
    return !this.hasPlayedAgainst(Player.NULL_PLAYER.id)
      && this.dueColor(maxSameColor) !== Color.Black;
  }

  public dueColor(maxSameColor: number): Color {
    if (this._colors.length < maxSameColor)
      return Color.None;

    if (this._lastColorCount >= maxSameColor)
      return -this.lastColor;

    if (Math.abs(this.colorBalance) >= maxSameColor)
      return -Math.sign(this.colorBalance);

    return Color.None;
  }

  public idealColorAgainst(opponentInfo: PairingInfo, maxSameColor: number): Color {
    const thisDueColor = this.dueColor(maxSameColor);
    const opponentDueColor = opponentInfo.dueColor(maxSameColor);

    if (thisDueColor !== Color.None)
      return opponentDueColor === thisDueColor ? Color.None : thisDueColor;

    if (opponentDueColor !== Color.None)
      return -opponentDueColor;

    if (this.lastColor === -opponentInfo.lastColor)
      return opponentInfo.lastColor;

    const thisWhite = this._whiteGames < opponentInfo._whiteGames
      || this._points < opponentInfo._points
      || this.colorBalance < opponentInfo.colorBalance
      || this.player.rating < opponentInfo.player.rating
      || this.lastColor === Color.Black;
    return thisWhite ? Color.White : Color.Black;
  }

  public compare(other: PairingInfo): number {
    return this._points - other._points || this.player.rating - other.player.rating;
  }

  public update({ whitePlayer: white, blackPlayer: black, result }: Pairing): void {
    const isWhite = white.id === this.player.id;
    const color = isWhite ? Color.White : Color.Black;

    this._points += RESULT_TO_POINTS[color][result];
    this._opponentIds.add(isWhite ? black.id : white.id);
    this._lastColorCount = color === this.lastColor ? (this._lastColorCount + 1) : 1;
    this._colors.push(color);
    isWhite && this._whiteGames++;
  }

  public popUpdate({ whitePlayer: white, blackPlayer: black, result }: Pairing): void {
    const isWhite = white.id === this.player.id;
    const color = isWhite ? Color.White : Color.Black;

    this._points -= RESULT_TO_POINTS[color][result];
    this._opponentIds.delete(isWhite ? black.id : white.id);
    this._colors.pop();
    this._lastColorCount = PairingInfo.lastColorCount(this._colors);
    isWhite && this._whiteGames--;
  }

  private nthLastColor(n: number): Color {
    return this._colors.at(-n) ?? Color.None;
  }
}