export class GraphqlExecutionError extends Error {
  public constructor(public readonly message: string, public readonly requestString: string) {
    super(message);
  }
}
