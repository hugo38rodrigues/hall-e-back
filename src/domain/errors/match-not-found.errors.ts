export class MatchNotFoundError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "NotFoundMatchError";
  }
}