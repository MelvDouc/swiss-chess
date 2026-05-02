# Swiss Chess

Manage Swiss chess tournaments.

## Player

Extend the `Player` class to add extra info.

```typescript
import { Player as BasePlayer, type PlayerId } from "@melvdouc/swiss-chess";

class Player extends BasePlayer {
  public readonly name: string;
  public readonly federation: string;

  public constructor(id: PlayerId, rating: number, name: string, federation: string) {
    super(id, rating);
    this.name = name;
    this.federation = federation;
  }
}
```

## Tournament

Create a tournament.

```typescript
import { Tournament, GameResult } from "@melvdouc/swiss-chess";

const players = [
  new Player("1503014", 2840, "Carlsen, Magnus", "NOR"),
  new Player("2016192", 2792, "Nakamura, Hikaru", "USA"),
  new Player("2020009", 2788, "Caruana, Fabiano", "USA"),
  new Player("14204118", 2780, "Abdusattorov, Nodirbek", "UZB")
];
const tournament = new Tournament(players, 2);

const firstRoundPairings = tournament.generatePairings();
firstRoundPairings[0].result = GameResult.WhiteWin;
firstRoundPairings[1].result = GameResult.Draw;
tournament.savePairings(firstRoundPairings);
```

## Standings

Print a nicely formatted standing table.

```typescript
console.table(
  tournament.getStandings().map((s) => ({
    player: (s.player as Player).name,
    BH: s.Buchholz,
    SB: s.SonnebornBerger,
    CUM: s.progressiveScore,
    wins: s.wins,
    games: s.games.map(({ notation }) => notation).join(" "),
    points: s.points
  }))
);
```

| (idx) | player                 | BH  | SB   | CUM | wins | games | points |
|-------|------------------------|-----|------|-----|------|-------|--------|
| 0     | Carlsen, Magnus        | 0   | 0    | 1   | 1    | +4W   | 1      |
| 1     | Nakamura, Hikaru       | 0.5 | 0.25 | 0.5 | 0    | =3B   | 0.5    |
| 2     | Abdusattorov, Nodirbek | 0.5 | 0.25 | 0.5 | 0    | =2W   | 0.5    |
| 3     | Caruana, Fabiano       | 1   | 0    | 0   | 0    | -1B   | 0      |

## Pairings

Though not recommended, pairings can also be done by hand.

```typescript
import { Pairing } from "@melvdouc/swiss-chess";

const round = 0;

const pairings = [
  new Pairing(player1, 0, player3, 0, round, 0, GameResult.WhiteWin),
  new Pairing(player4, 0, player2, 0, round, 0, GameResult.BlackWin)
];

tournament.savePairings(pairings);
```

## Error handling

`generatePairings()` can throw if too many rounds for the number of players are generated.

```typescript
import { ErrorKind, TournamentError } from "@melvdouc/swiss-chess";

try {
  const pairings = tournament.generatePairings();
} catch (error) {
  if (error instanceof TournamentError) {
    switch (error.kind) {
      case ErrorKind.NoByeFound:
        console.error("No bye found!");
        break;
      case ErrorKind.PairingFailure:
        console.error("Pairings failed!");
    }
  }
}
```
