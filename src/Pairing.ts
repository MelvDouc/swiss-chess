import type { PlayerId } from "$/Player.ts";
import { AbsoluteResult } from "$/Result.ts";

export default class Pairing {
  public constructor(
    public readonly whiteId: PlayerId,
    public readonly whitePoints: number,
    public readonly blackId: PlayerId,
    public readonly blackPoints: number,
    public absResult: AbsoluteResult = AbsoluteResult.None
  ) { }
}