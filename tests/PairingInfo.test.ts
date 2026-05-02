import Pairing from "$/Pairing.ts";
import PairingInfo from "$/PairingInfo.ts";
import Player from "$/Player.ts";
import Color from "$/constants/Color.ts";
import { GameResult } from "$/constants/Result.ts";
import { assertEquals } from "@std/assert";

Deno.test("Pairing info should be updated correctly.", () => {
  const player1 = new Player("1", 2800);
  const player2 = new Player("2", 2800);
  const player3 = new Player("3", 2800);
  const pairingInfo = new PairingInfo(player1);

  const pairing1 = new Pairing(player1, 0, player2, 0, 0, 0, GameResult.WhiteWin);
  pairingInfo.update(pairing1);

  const pairing2 = new Pairing(player3, 0, player1, 1, 1, 0, GameResult.BlackWin);
  pairingInfo.update(pairing2);

  assertEquals(pairingInfo.points, 2);
  assertEquals(pairingInfo.whiteGames, 1);
  assertEquals(pairingInfo.colorBalance, 0);
  assertEquals(pairingInfo.dueColor(2), Color.None);
});

Deno.test("A due color should be given after 2 games with the same color.", () => {
  const player1 = new Player("1", 2800);
  const player2 = new Player("2", 2800);
  const player3 = new Player("3", 2800);
  const pairingInfo = new PairingInfo(player1);

  const pairing1 = new Pairing(player1, 0, player2, 0, 0, 0, GameResult.WhiteWin);
  pairingInfo.update(pairing1);

  const pairing2 = new Pairing(player1, 0, player3, 1, 1, 0, GameResult.WhiteWin);
  pairingInfo.update(pairing2);

  assertEquals(pairingInfo.dueColor(2), Color.Black);
});

Deno.test("Pairing updates can be undone.", () => {
  const player1 = new Player("1", 2800);
  const player2 = new Player("2", 2800);
  const player3 = new Player("3", 2800);
  const pairingInfo = new PairingInfo(player1);

  const pairing1 = new Pairing(player1, 0, player2, 0, 0, 0, GameResult.WhiteWin);
  pairingInfo.update(pairing1);

  const pairing2 = new Pairing(player1, 0, player3, 1, 1, 0, GameResult.WhiteWin);
  pairingInfo.update(pairing2);

  pairingInfo.popUpdate(pairing2);
  pairingInfo.popUpdate(pairing1);

  assertEquals(pairingInfo.points, 0);
  assertEquals(pairingInfo.lastColor, Color.None);
  assertEquals(pairingInfo.colorBalance, 0);
  assertEquals(pairingInfo.whiteGames, 0);
});