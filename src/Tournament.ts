import Color from "$/constants/Color.ts";
import Symbols from "$/constants/Symbols.ts";
import TournamentError from "$/errors/TournamentError.ts";
import Pairing from "$/Pairing.ts";
import PairingInfo from "$/PairingInfo.ts";
import Player, { type PlayerId } from "$/Player.ts";
import Standing, { type PublicStanding } from "$/standings/Standing.ts";
import { arrayToRecord } from "$/utils.ts";

export default class Tournament {
  /**
   * @param nbPlayers Number of players.
   * @returns How many rounds a tournament should have **at most**.
   */
  public static idealNumberOfRounds(nbPlayers: number): number {
    return Math.ceil(Math.log2(nbPlayers));
  }

  /**
   * How many rounds will be played in total.
   * Generating more rounds than this number will likely lead to failure.
   */
  public readonly nbRounds: number;
  /**
   * The players of this tournament.
   * Note that this is a **copy** of the array passed to the constructor.
   * Therefore modifying the latter (e.g. to add a player) will have no effect.
   */
  public readonly players: Player[];
  private readonly rounds: Pairing[][] = [];
  private readonly pairingInfoRecord: Record<PlayerId, PairingInfo>;

  public constructor(players: Player[], nbRounds: number) {
    this.nbRounds = nbRounds;
    this.players = [...players];
    this.pairingInfoRecord = arrayToRecord(players, (player) => [player.id, new PairingInfo(player)]);
  }

  public [Symbols.getPairingInfo](playerId: PlayerId): PairingInfo {
    return this.pairingInfoRecord[playerId];
  }

  /**
   * Add a new player. Can be done at any round.
   */
  public addPlayer(player: Player): void {
    this.players.push(player);
    this.pairingInfoRecord[player.id] = new PairingInfo(player);
  }

  /**
   * Mark a player as active or inactive,
   * inactive meaning they won't be paired up in future rounds.
   */
  public setPlayerActive(playerId: PlayerId, active: boolean): void {
    this.pairingInfoRecord[playerId].player.active = active;
  }

  /**
   * Get next round's pairings.
   * Note: These must be saved using the `savePairings` method.
   */
  public generatePairings(): Pairing[] {
    return this.rounds.length === 0
      ? this.firstRoundPairings()
      : this.subsequentRoundPairings();
  }

  /**
   * @param roundIndex Zero-based.
   * @returns Previously saved pairings.
   */
  public getSavedPairings(roundIndex: number): Pairing[] {
    return this.rounds[roundIndex];
  }

  /**
   * Save these pairings and update the player's info (points, white games etc.) accordingly.
   */
  public savePairings(pairings: Pairing[]): void {
    pairings.forEach((pairing) => {
      this.pairingInfoRecord[pairing.whitePlayer.id]?.update(pairing);
      this.pairingInfoRecord[pairing.blackPlayer.id]?.update(pairing);
    });
    this.rounds.push(pairings);
  }

  /**
   * Delete last round's pairings.
   */
  public popPairings(): void {
    const pairings = this.rounds.pop();

    if (pairings)
      pairings.forEach((pairing) => {
        this.pairingInfoRecord[pairing.whitePlayer.id]?.popUpdate(pairing);
        this.pairingInfoRecord[pairing.blackPlayer.id]?.popUpdate(pairing);
      });
  }

  /**
   * @param roundIndex Standings up to and including this round (zero-based).
   */
  public getStandings(roundIndex?: number): PublicStanding[] {
    const standingRec = this.rounds
      .slice(0, roundIndex ? (roundIndex + 1) : this.rounds.length)
      .reduce((acc, round) => {
        round.forEach((pairing) => {
          acc[pairing.whitePlayer.id] ??= new Standing(pairing.whitePlayer);
          acc[pairing.whitePlayer.id].updatePoints(pairing);

          if (pairing.blackPlayer.id !== Player.NULL_PLAYER.id) {
            acc[pairing.blackPlayer.id] ??= new Standing(pairing.blackPlayer);
            acc[pairing.blackPlayer.id].updatePoints(pairing);
          }
        });

        return acc;
      }, {} as Record<PlayerId, Standing>);

    const standings = Object.values(standingRec)
      .map((standing) => standing.updateTieBreaks(standingRec))
      .sort((a, b) => b.compare(a));

    const rankingRec = arrayToRecord(standings, ({ player }, i) => [player.id, i + 1]);
    return standings.map((standing, i) => standing.asPublic(rankingRec, i + 1));
  }

  private firstRoundPairings(): Pairing[] {
    const players = this.players
      .filter(({ active }) => active)
      .sort((a, b) => b.rating - a.rating);
    const round = 0;
    const halfLen = Math.floor(players.length / 2);

    const pairings: Pairing[] = Array.from({ length: halfLen }, (_, board) => {
      const p1 = players[board],
        p2 = players[board + halfLen];
      const [white, black] = board % 2 === 0 ? [p1, p2] : [p2, p1];
      return new Pairing(white, 0, black, 0, round, board);
    });

    if (players.length % 2 === 1) {
      const bye = players[players.length - 1];
      const board = pairings.length;
      pairings.push(Pairing.byePairing(bye, 0, round, board));
    }

    return pairings;
  }

  private subsequentRoundPairings(): Pairing[] {
    const round = this.rounds.length;
    const maxSameColor = round === this.nbRounds - 1 ? 3 : 2;
    const infoRec = this.pairingInfoRecord;
    const players = this.playersSortedByPairingInfo();
    const bye = players.length % 2 === 1 ? this.removeBye(players, maxSameColor) : null;
    const matchups: [PlayerId, PlayerId][] = [];
    const success = this.tryMatchups(players, new Set(), matchups, maxSameColor, 0);

    if (!success)
      throw TournamentError.pairingFailure();

    const pairings = matchups.map(([whiteId, blackId], board) => {
      const { player: whitePlayer, points: whitePoints } = infoRec[whiteId];
      const { player: blackPlayer, points: blackPoints } = infoRec[blackId];
      return new Pairing(whitePlayer, whitePoints, blackPlayer, blackPoints, round, board);
    });

    if (bye) {
      const byePoints = infoRec[bye.id].points;
      const board = pairings.length;
      pairings.push(Pairing.byePairing(bye, byePoints, round, board));
    }

    return pairings;
  }

  private playersSortedByPairingInfo(): Player[] {
    return this.players
      .filter(({ active }) => active)
      .sort((a, b) => this.pairingInfoRecord[b.id].compare(this.pairingInfoRecord[a.id]));
  }

  private removeBye(players: Player[], maxSameColor: number): Player {
    for (let i = players.length - 1; i >= 0; i--) {
      const pairingInfo = this.pairingInfoRecord[players[i].id];

      if (pairingInfo.canBeenBye(maxSameColor))
        return players.splice(i, 1)[0];
    }

    throw TournamentError.noByeFound();
  }

  private tryMatchups(
    players: Player[],
    memo: Set<PlayerId>,
    matchups: [PlayerId, PlayerId][],
    maxSameColor: number,
    i: number,
  ): boolean {
    while (i < players.length && memo.has(players[i].id))
      i++;

    if (i >= players.length)
      return true;

    const p1 = players[i];
    const info1 = this.pairingInfoRecord[p1.id];

    for (let j = i + 1; j < players.length; j++) {
      const p2 = players[j];
      if (memo.has(p2.id) || info1.hasPlayedAgainst(p2.id)) continue;

      const info2 = this.pairingInfoRecord[p2.id];
      const color = info1.idealColorAgainst(info2, maxSameColor);
      if (color === Color.None) continue;

      matchups.push(color === Color.White ? [p1.id, p2.id] : [p2.id, p1.id]);
      memo.add(p1.id).add(p2.id);

      if (this.tryMatchups(players, memo, matchups, maxSameColor, i + 1))
        return true;

      matchups.pop();
      memo.delete(p1.id);
      memo.delete(p2.id);
    }

    return false;
  }
}