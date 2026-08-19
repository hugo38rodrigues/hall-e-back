export class MatchNotFound extends Error {
  constructor(message:string) {
    super(message);
    this.name = "NotFoundMatchError";
  }
}