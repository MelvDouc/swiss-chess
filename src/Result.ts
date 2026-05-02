export const enum AbsoluteResult {
  None = "*",
  Draw = "1/2-1/2",
  WhiteWin = "1-0",
  BlackWin = "0-1"
}

export type RealAbsoluteResult = Exclude<AbsoluteResult, AbsoluteResult.None>;

export const enum RelativeResult {
  None,
  Draw,
  Win,
  Loss
}

export function absToRelResult(absResult: AbsoluteResult, isWhite: boolean): RelativeResult {
  switch (absResult) {
    case AbsoluteResult.None:
      return RelativeResult.None;
    case AbsoluteResult.Draw:
      return RelativeResult.Draw;
    case AbsoluteResult.WhiteWin:
      return isWhite ? RelativeResult.Win : RelativeResult.Loss;
    case AbsoluteResult.BlackWin:
      return isWhite ? RelativeResult.Loss : RelativeResult.Win;
  }
}

export function relToAbsResult(relResult: RelativeResult, isWhite: boolean): AbsoluteResult {
  switch (relResult) {
    case RelativeResult.None:
      return AbsoluteResult.None;
    case RelativeResult.Draw:
      return AbsoluteResult.Draw;
    case RelativeResult.Win:
      return isWhite ? AbsoluteResult.WhiteWin : AbsoluteResult.BlackWin;
    case RelativeResult.Loss:
      return isWhite ? AbsoluteResult.BlackWin : AbsoluteResult.WhiteWin;
  }
}