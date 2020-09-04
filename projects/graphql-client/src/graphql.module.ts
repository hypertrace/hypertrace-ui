import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClientOptions } from 'apollo-client';
import { GraphQlQueryHandler, GRAPHQL_REQUEST_HANDLERS_TOKENS, GRAPHQL_URI } from './graphql-config';
import { GraphQlRequestService } from './graphql-request.service';

// tslint:disable-next-line: only-arrow-functions
export function createApollo(httpLink: HttpLink, uri: string): ApolloClientOptions<NormalizedCacheObject> {
  return {
    link: httpLink.create({ uri: uri }),
    cache: new InMemoryCache({
      // Never assume an object with an ID is safe to cache, use the whole request path as the key only
      dataIdFromObject: () => undefined
    })
  };
}

@NgModule({
  imports: [HttpLinkModule, ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, GRAPHQL_URI]
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
