import Player from "$/Player.ts";
import { AbsoluteResult } from "$/Result.ts";
import Tournament from "$/Tournament.ts";

const players = [
  new Player("1", 2000),
  new Player("2", 1800),
  new Player("3", 1666),
  new Player("4", 1666),
  new Player("5", 1500),
  new Player("6", 1200)
];

const tournament = new Tournament(players);
const pairings1 = tournament.getPairings();
tournament.savePairings(pairings1);

tournament.setPairingResult(0, 0, AbsoluteResult.WhiteWin);
tournament.setPairingResult(0, 1, AbsoluteResult.Draw);
tournament.setPairingResult(0, 2, AbsoluteResult.BlackWin);

const pairings2 = tournament.getPairings();
tournament.savePairings(pairings2);
tournament.setPairingResult(1, 0, AbsoluteResult.BlackWin);
tournament.setPairingResult(1, 1, AbsoluteResult.Draw);
tournament.setPairingResult(1, 2, AbsoluteResult.BlackWin);

const pairings3 = tournament.getPairings();
tournament.savePairings(pairings3);
tournament.setPairingResult(2, 0, AbsoluteResult.WhiteWin);
tournament.setPairingResult(2, 1, AbsoluteResult.BlackWin);
tournament.setPairingResult(2, 2, AbsoluteResult.WhiteWin);



const standings = tournament.getStandings();

console.table(
  standings.map((standing) => ({
    Id: standing.playerId,
    Pts: standing.points,
    BH: standing.buchholz,
    SB: standing.sonneborgBerger,
    CUM: standing.progressivePoints,
    W: standing.totalWins,
    games: standing.stringifyGames(standings).join(" ")
  }))
);