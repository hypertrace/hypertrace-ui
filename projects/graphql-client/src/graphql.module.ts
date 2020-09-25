import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { InMemoryCache } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpBatchLink } from 'apollo-angular/http';
import {
  GraphQlQueryHandler,
  GRAPHQL_BATCH_SIZE,
  GRAPHQL_REQUEST_HANDLERS_TOKENS,
  GRAPHQL_URI
} from './graphql-config';
import { GraphQlRequestService } from './graphql-request.service';

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpBatchLink, uri: string, batchSize: number) => ({
        cache: new InMemoryCache(),
        link: httpLink.create({
          uri: uri,
          batchMax: batchSize
        })
      }),
      deps: [HttpBatchLink, GRAPHQL_URI, GRAPHQL_BATCH_SIZE]
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
