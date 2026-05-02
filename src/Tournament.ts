import Pairing from "$/Pairing.ts";
import PairingData from "$/PairingData.ts";
import Player, { type PlayerId } from "$/Player.ts";
import { AbsoluteResult } from "$/Result.ts";
import Standing from "$/Standing.ts";
import { backtrackPairings, createTable } from "$/utils.ts";

export default class Tournament {
  private readonly players: Player[];
  private readonly rounds: Pairing[][];

  public constructor(players: Player[]) {
    this.players = players;
    this.rounds = [];
  }

  public get currentRoundIndex(): number {
    return this.rounds.length;
  }

  public get hasBye(): boolean {
    return this.players.length % 2 === 1;
  }

  public getPairings(): Pairing[] {
    // TODO: check if all results set
    return this.currentRoundIndex === 0
      ? this.firstRoundPairings()
      : this.subsequentRoundPairings();
  }

  public savePairings(pairings: Pairing[]): void {
    this.rounds.push(pairings);
  }

  public setPairingResult(roundIndex: number, board: number, absResult: AbsoluteResult): void {
    // TODO: check indices
    const pairing = this.rounds[roundIndex][board];
    pairing.absResult = absResult;
  }

  public getStandings(): Standing[] {
    // TODO: select round
    const table = createTable(this.players, ({ id }) => [id, new Standing(id)]);

    this.rounds.forEach((round) => {
      round.forEach((pairing) => {
        table[pairing.whiteId].updatePoints(pairing);
        table[pairing.blackId]?.updatePoints(pairing);
      });
    });

    return Object.values(table)
      .map((standing) => standing.updateTieBreaks(table))
      .sort((a, b) => b.compare(a));
  }

  private firstRoundPairings(): Pairing[] {
    const players = [...this.players].sort((a, b) => b.rating - a.rating);
    const bye = this.hasBye ? players.pop() as Player : null;
    const len = players.length / 2;

    const round = Array.from({ length: len }, (_, i) => {
      const player1 = players[i * 2];
      const player2 = players[i * 2 + 1];
      const whiteId = i % 2 === 0 ? player1.id : player2.id;
      const blackId = whiteId === player1.id ? player2.id : player1.id;

      return new Pairing(whiteId, 0, blackId, 0);
    });

    if (bye)
      round.push(new Pairing(bye.id, 0, Player.NULL_ID, 0, AbsoluteResult.WhiteWin));

    return round;
  }

  private subsequentRoundPairings(): Pairing[] {
    const sortedData = this.getSortedPairingData();
    const bye = this.hasBye ? this.findBye(sortedData) : null;
    const paired = new Set<PlayerId>();
    const round: Pairing[] = [];

    backtrackPairings(sortedData, paired, round, 0);

    if (bye !== null) {
      const [byeId, byePoints] = bye;
      round.push(new Pairing(byeId, byePoints, Player.NULL_ID, 0, AbsoluteResult.WhiteWin));
    }

    return round;
  }

  private getSortedPairingData(): PairingData[] {
    const pairingData = createTable(this.players, ({ id }) => [id, new PairingData(id)]);

    this.rounds.forEach((round) => {
      round.forEach((pairing) => {
        pairingData[pairing.whiteId].update(pairing);
        pairingData[pairing.blackId]?.update(pairing);
      });
    });

    return Object.values(pairingData).sort((a, b) => b.points - a.points);
  }

  private findBye(sortedData: PairingData[]): [PlayerId, number] {
    const index = sortedData.findLastIndex(({ opponentIds }) => {
      return !opponentIds.has(Player.NULL_ID);
    });
    const [bye] = sortedData.splice(index, 1);
    return [bye.playerId, bye.points];
  }
}