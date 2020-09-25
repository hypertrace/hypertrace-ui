import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { GraphQlQueryHandler, GRAPHQL_REQUEST_HANDLERS_TOKENS, GRAPHQL_URI } from './graphql-config';
import { GraphQlRequestService } from './graphql-request.service';
import { InMemoryCache } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpBatchLink } from 'apollo-angular/http';

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpBatchLink, uri: string) {
        return {
          cache: new InMemoryCache({
            typePolicies: {
              Query: {
                fields: {
                  actor: (_, {args, toReference}) => {
                    return toReference({
                      __typename: 'Actor',
                      id: args?.id,
                    });
                  }
                }
              },
              ActorResultSet: {
                keyFields: []
              },
              Actor: {
                keyFields: (object, _context ) => object.id as string
              }
            }
          }),
          link: httpLink.create({
            uri: uri,
            batchMax: 4
          })
        };
      },
      deps: [HttpBatchLink, GRAPHQL_URI]
    },
    {
      provide: GRAPHQL_REQUEST_HANDLERS_TOKENS,
      useValue: [],
      multi: true
    }
  ]
})
// tslint:disable-next-line: no-unnecessary-class
export class GraphQlModule {
  public constructor(
    graphQlRequestService: GraphQlRequestService,
    injector: Injector,
    @Inject(GRAPHQL_REQUEST_HANDLERS_TOKENS) handlerTokens: InjectionToken<GraphQlQueryHandler<unknown, unknown>>[][]
  ) {
    handlerTokens
      .flat()
      .map(token => injector.get(token))
      .forEach(handler => graphQlRequestService.registerHandler(handler));
  }

  public static withHandlerProviders(handlerTokens: unknown[]): ModuleWithProviders<GraphQlModule> {
    return {
      ngModule: GraphQlModule,
      providers: [
        {
          provide: GRAPHQL_REQUEST_HANDLERS_TOKENS,
          useValue: handlerTokens,
          multi: true
        }
      ]
    };
  }
}
