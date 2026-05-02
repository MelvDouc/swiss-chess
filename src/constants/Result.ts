import Color from "$/constants/Color.ts";

/**
 * A game's outcome based on colors.
 */
export const enum GameResult {
  None = "*",
  Draw = "1/2-1/2",
  WhiteWin = "1-0",
  BlackWin = "0-1"
}

/**
 * A game's outcome from one of the players' perspective.
 */
export const enum Score {
  None,
  Draw,
  Win,
  Loss
}

/**
 * How many points a player gains based on their color and the game result.
 */
export const RESULT_TO_POINTS = {
  [Color.Black]: {
    [GameResult.WhiteWin]: 0,
    [GameResult.Draw]: 0.5,
    [GameResult.BlackWin]: 1,
    [GameResult.None]: 0
  },
  [Color.White]: {
    [GameResult.WhiteWin]: 1,
    [GameResult.Draw]: 0.5,
    [GameResult.BlackWin]: 0,
    [GameResult.None]: 0
  }
} as const;


export function resultToScore(result: GameResult, isWhite: boolean): Score {
  switch (result) {
    case GameResult.None:
      return Score.None;
    case GameResult.Draw:
      return Score.Draw;
    case GameResult.WhiteWin:
      return isWhite ? Score.Win : Score.Loss;
    case GameResult.BlackWin:
      return isWhite ? Score.Loss : Score.Win;
  }
}

export function scoreToResult(score: Score, isWhite: boolean): GameResult {
  switch (score) {
    case Score.None:
      return GameResult.None;
    case Score.Draw:
      return GameResult.Draw;
    case Score.Win:
      return isWhite ? GameResult.WhiteWin : GameResult.BlackWin;
    case Score.Loss:
      return isWhite ? GameResult.BlackWin : GameResult.WhiteWin;
  }
}