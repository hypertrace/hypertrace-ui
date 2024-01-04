import { GraphqlExecutionError } from './graphql-execution-error';
import { GraphQlRequest } from './graphql-request.api';

export class GraphqlRequestError extends GraphqlExecutionError {
  public constructor(public readonly error: GraphqlExecutionError, public readonly request: GraphQlRequest) {
    super(error.message, error.requestString);
    this.name = error.name;
    this.stack = error.stack;
  }
}
