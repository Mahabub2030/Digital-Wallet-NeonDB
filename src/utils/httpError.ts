// Throw this anywhere: the error middleware turns it into a clean JSON answer
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
