import { Color, Player, Tournament } from "$/mod.ts";
import { assert, assertEquals } from "@std/assert";
import { randomIntegerBetween as randomInt } from "@std/random";
import t1 from "./data/tournament1.json" with { type: "json" };
import t2 from "./data/tournament2.json" with { type: "json" };
import {
  createRandomPlayers,
  parseTournamentJson,
  playRandomTournament,
  randomOddInt,
  randomResult
} from "./test-utils.ts";

Deno.test("Null player is always in last pairing as black.", () => {
  const nbPlayers = randomOddInt(7, 65);
  const nbRounds = Tournament.idealNumberOfRounds(nbPlayers);
  const players = createRandomPlayers(nbPlayers);
  const tournament = new Tournament(players, nbRounds);

  for (let r = 1; r <= nbRounds; r++) {
    const pairings = tournament.generatePairings();
    const lastPairing = pairings[pairings.length - 1];
    assert(lastPairing.blackPlayer.id === Player.NULL_PLAYER.id);

    for (let i = 0; i < pairings.length - 1; i++) {
      pairings[i].result = randomResult(pairings[i]);
    }

    tournament.savePairings(pairings);
  }
});

Deno.test("Bye isn't played more than once and always as white.", () => {
  const nbPlayers = randomOddInt(15, 45);
  const nbRounds = Tournament.idealNumberOfRounds(nbPlayers);
  const tournament = playRandomTournament(nbPlayers, nbRounds);

  tournament.getStandings().forEach(({ games }) => {
    let playedBye = false;

    games.forEach(({ color, opponentId }) => {
      if (opponentId !== Player.NULL_PLAYER.id)
        return;

      assert(!playedBye);
      assertEquals(color, Color.White);
      playedBye = true;
    });
  });
});

Deno.test("Everyone should play the same number of games.", () => {
  const nbPlayers = randomInt(10, 80);
  const nbRounds = Tournament.idealNumberOfRounds(nbPlayers);
  const tournament = playRandomTournament(nbPlayers, nbRounds);

  tournament.getStandings().forEach(({ games }) => {
    assertEquals(games.length, nbRounds);
  });
});

Deno.test("No one should play the same color 3 times in a row.", () => {
  const x = randomInt(25, 250);

  for (let i = 0; i < 15; i++) {
    const nbPlayers = x - i;
    const nbRounds = Tournament.idealNumberOfRounds(nbPlayers);
    const tournament = playRandomTournament(nbPlayers, nbRounds);
    const standings = tournament.getStandings();

    for (const { games } of standings) {
      for (let g = 0; g < games.length - 2; g++) {
        const a = games[g];
        const b = games[g + 1];
        const c = games[g + 2];

        if (a.color === b.color && b.color === c.color)
          assertEquals(g + 2, nbRounds - 1);
      }
    }
  }
});

Deno.test("Pairings point differences shouldn't deviate too far from average.", () => {
  const x = randomInt(10, 250);

  for (let i = 0; i < 20; i++) {
    const nbPlayers = x + i;
    const nbRounds = Tournament.idealNumberOfRounds(nbPlayers);
    const players = createRandomPlayers(nbPlayers);
    const tournament = new Tournament(players, nbRounds);

    for (let r = 1; r <= nbRounds; r++) {
      const pairings = tournament.generatePairings();
      const nonByePairings = nbPlayers % 2 === 0 ? pairings : pairings.slice(0, -1);
      const pointDiffTotal = nonByePairings.reduce((acc, { whitePoints, blackPoints }) => {
        return acc + Math.abs(whitePoints - blackPoints);
      }, 0);
      const pointDiffAvg = pointDiffTotal / nonByePairings.length;

      nonByePairings.forEach((pairing) => {
        const diff = Math.abs(pairing.whitePoints - pairing.blackPoints);
        assert(Math.abs(pointDiffAvg - diff) <= 2);

        pairing.result = randomResult(pairing);
      });

      tournament.savePairings(pairings);
    }
  }
});

Deno.test("tie-breaks", () => {
  const tournament = parseTournamentJson(t1);
  const standings = tournament.getStandings();
  const [first, second, third] = standings;

  assertEquals(first.player.id, "b");
  assertEquals(second.player.id, "d");
  assertEquals(second.progressiveScore, 1.5);
  assertEquals(third.player.id, "a");
});

Deno.test("real tournament", () => {
  const tournament = parseTournamentJson(t2);
  const standings = tournament.getStandings();
  const first = standings[0];

  assertEquals(first.player.id, "SUMETS Andrey");
  assertEquals(first.points, 7);
});