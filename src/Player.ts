export default class Player {
  public static readonly NULL_ID = Symbol();

  public constructor(
    public readonly id: PlayerId,
    public readonly rating: number
  ) { }
}

export type PlayerId = string | symbol;