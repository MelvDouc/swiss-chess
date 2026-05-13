/**
 * A tournament contestant.
 * It's recommended to extend this class in order to add extra information,
 * such as a name and federation.
 */
export default class Player {
  /**
   * A dummy player added when a tournament has an odd number of active players.
   * It is handled internally so do not include it in your player list.
   */
  public static readonly NULL_PLAYER: Player = new this(Symbol(), 0);

  public constructor(
    /**
     * A **unique** identifier.
     */
    public readonly id: PlayerId,
    /**
     * An indicator of a player' strength, such as a FIDE rating.
     * Used for sorting.
     */
    public readonly rating: number,
    /**
     * Once added, a player cannot be removed from a tournament.
     * They can however be marked inactive
     * to indicate that they shouldn't be paired up in the next rounds.
     */
    public active = true
  ) { }
}

/**
 * A **unique** player identifier.
 */
export type PlayerId = string | symbol;