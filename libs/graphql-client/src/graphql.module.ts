import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { InMemoryCache } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpBatchLink } from 'apollo-angular/http';
import {
  GraphQlOptions,
  GraphQlQueryHandler,
  GRAPHQL_OPTIONS,
  GRAPHQL_REQUEST_HANDLERS_TOKENS
} from './graphql-config';
import { GraphQlRequestService } from './graphql-request.service';

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpBatchLink, options: GraphQlOptions) => ({
        cache: new InMemoryCache(),
        link: httpLink.create({
          uri: options.uri,
          batchMax: options.batchSize ?? 5,
          batchInterval: 0 // We are already adding debounce time while merging the query. No need to add batch Interval here
        })
      }),
      deps: [HttpBatchLink, GRAPHQL_OPTIONS]
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
