/*
 * Public API Surface of graphql-client
 */

export { GraphQlRequestService, RequestTypeForHandler, ResponseTypeForHandler } from './graphql-request.service';
export {
  GraphQlHandler,
  GraphQlQueryHandler,
  GraphQlMutationHandler,
  GraphQlRequestOptions,
  GraphQlRequestCacheability,
  GraphQlHandlerType,
  GRAPHQL_OPTIONS
} from './graphql-config';
export { GraphQlSelection } from './model/graphql-selection';
export * from './model/graphql-argument';
export { GraphQlModule } from './graphql.module';
