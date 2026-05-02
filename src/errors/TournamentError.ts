import ErrorKind from "$/errors/ErrorKind.ts";

export default class TournamentError extends Error {
  public static noByeFound(): TournamentError {
    return new this(ErrorKind.NoByeFound);
  }

  public static pairingFailure(): TournamentError {
    return new this(ErrorKind.PairingFailure);
  }

  public readonly kind: ErrorKind;

  public constructor(kind: ErrorKind) {
    super();
    this.kind = kind;
  }
}