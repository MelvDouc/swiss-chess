import { GameResult, Pairing, Player, Tournament } from "$/mod.ts";
import { arrayToRecord } from "$/utils.ts";
import { randomIntegerBetween as randomInt } from "@std/random";

export { randomInt };

export function randomOddInt(min: number, max: number): number {
  min = (min - 1) / 2;
  max = (max - 1) / 2;
  return randomInt(min, max) * 2 + 1;
}

export function randomResult(pairing: Pairing): GameResult {
  const delta = (pairing.blackPlayer?.rating ?? 0) - pairing.whitePlayer.rating;
  const expectedWhite = 1 / (10 ** (delta / 400) + 1);
  const rand = Math.random();

  if (rand < expectedWhite * 0.85)
    return GameResult.WhiteWin;

  if (rand > 1 - (1 - expectedWhite) * 0.85)
    return GameResult.BlackWin;

  return GameResult.Draw;
}

export function createRandomPlayers(nbPlayers: number): Player[] {
  return Array.from({ length: nbPlayers }, (_, i) => {
    const id = (i + 1).toString();
    return new Player(id, randomInt(1000, 2900));
  });
}

export function playRandomTournament(nbPlayers: number, nbRounds: number): Tournament {
  const players = createRandomPlayers(nbPlayers);
  const tournament = new Tournament(players, nbRounds);

  for (let r = 1; r <= nbRounds; r++) {
    const pairings = tournament.generatePairings();
    // Don't set bye pairing result.
    const evenNbPairings = pairings.length & ~1;

    for (let i = 0; i < evenNbPairings; i++)
      pairings[i].result = randomResult(pairings[i]);

    tournament.savePairings(pairings);
  }

  return tournament;
}

export function printStandings(tournament: Tournament): void {
  console.table(
    tournament.getStandings().map((s) => ({
      player: s.player.id,
      BH: s.Buchholz,
      SB: s.SonnebornBerger,
      CUM: s.progressiveScore,
      wins: s.wins,
      games: s.games.map(({ notation }) => notation).join(" "),
      points: s.points
    }))
  );
}

export function printPairings(tournament: Tournament): void {
  console.table(
    tournament.generatePairings().map(({ whitePlayer: white, whitePoints, blackPlayer: black, blackPoints, result }) => ({
      white: white.id,
      whitePoints,
      result,
      blackPoints,
      black: black?.id ?? "EXEMPT"
    }))
  );
}

export function parseTournamentJson(json: TournamentJson): Tournament {
  const players = json.players.map(({ id, rating }) => new Player(id, rating));
  const playerRec = arrayToRecord(players, (player) => [player.id, player]);
  const pointRec = arrayToRecord(players, (player) => [player.id, 0]);
  const tournament = new Tournament(players, json.rounds.length);

  json.rounds.forEach((item, round) => {
    const pairings = item.map(({ whiteId, blackId, result: r }, board) => {
      const white = playerRec[whiteId];
      const whitePoints = pointRec[whiteId];
      const black = blackId === null ? Player.NULL_PLAYER : playerRec[blackId];
      const blackPoints = blackId !== null ? pointRec[blackId] : 0;
      const result = r as GameResult;

      switch (result) {
        case GameResult.WhiteWin:
          pointRec[whiteId] += 1;
          break;
        case GameResult.BlackWin:
          pointRec[black.id] += 1;
          break;
        case GameResult.Draw:
          pointRec[whiteId] += 0.5;
          pointRec[black.id] += 0.5;
      }

      return new Pairing(white, whitePoints, black, blackPoints, round, board, result);
    });

    tournament.savePairings(pairings);
  });

  return tournament;
}

type TournamentJson = {
  players: {
    id: string;
    rating: number;
  }[];
  rounds: {
    whiteId: string;
    blackId: string | null;
    result: string;
  }[][];
};