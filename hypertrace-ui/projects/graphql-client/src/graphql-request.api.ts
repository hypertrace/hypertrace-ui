import { GraphQlHandler } from './graphql-config';

export const enum GraphQlResultStatus {
  Success = 'SUCCESS',
  Error = 'ERROR',
}

export type GraphQlRequest = unknown;

export type RequestTypeForHandler<T extends GraphQlHandler<unknown, unknown>> = T extends GraphQlHandler<
  infer TRequest,
  unknown
>
  ? TRequest
  : never;

export type ResponseTypeForHandler<T extends GraphQlHandler<unknown, unknown>> = T extends GraphQlHandler<
  unknown,
  infer TResponse
>
  ? TResponse
  : never;
