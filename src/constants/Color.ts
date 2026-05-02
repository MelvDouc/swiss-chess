/**
 * Represents a player's color during a game.
 * It can be `None` when, for example, a player can be given either color in their next pairing.
 */
const enum Color {
  None,
  White,
  Black = -White
}

/**
 * Color abbreviations as used in standing tables.
 */
const COLOR_INITIALS = {
  [Color.White]: "W",
  [Color.Black]: "B"
} as const;


/**
 * Either black or white, no `None` color.
 */
type RealColor = Color.White | Color.Black;

export {
  Color as default,
  COLOR_INITIALS,
  type RealColor
};