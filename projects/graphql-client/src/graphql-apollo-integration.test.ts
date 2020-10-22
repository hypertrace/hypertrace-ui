import { fakeAsync, flush, tick } from '@angular/core/testing';
import { createHttpFactory, HttpMethod, SpectatorHttp } from '@ngneat/spectator/jest';
import { Apollo, gql } from 'apollo-angular';
import { GRAPHQL_OPTIONS } from './graphql-config';
import { GraphQlModule } from './graphql.module';
import { GraphQlRequestBuilder } from './utils/builders/request/graphql-request-builder';

describe('GraphQl Apollo Integration Service', () => {
  const graphQlUri = '/graphql';
  const graphQlBatchSize = 1;
  let spectator: SpectatorHttp<Apollo>;

  const createService = createHttpFactory({
    service: Apollo,
    imports: [GraphQlModule],
    providers: [
      {
        provide: GRAPHQL_OPTIONS,
        useValue: {
          uri: graphQlUri,
          batchSize: graphQlBatchSize
        }
      }
    ]
  });

  const buildRequestString = (rootPath: string = 'test', params: string[] = [], fields: string[] = []): string =>
    new GraphQlRequestBuilder()
      .withSelects({
        path: rootPath,
        arguments: params.map(param => ({ name: param, value: param })),
        children: [{ path: 'id' }, { path: 'value' }, ...fields.map(field => ({ path: field }))]
      })
      .build();

  const buildRequestIdString = (rootPath: string = 'test', fields: string[] = []): string =>
    buildRequestString(rootPath, ['id'], fields);

  const buildServerResponse = (rootPath: string = 'test', fields: string[] = []) => ({
    data: {
      [rootPath]: {
        id: 'foo',
        value: 'bar',
        ...fields
          .map(field => ({ [field]: field }))
          .reduce((combinedObject, currentValue) => ({ ...combinedObject, ...currentValue }), {}),
        __typename: 'test-type'
      }
    }
  });

  const buildServerArrayResponse = (rootPath: string = 'test') => ({
    data: [
      {
        [rootPath]: {
          id: 'foo',
          value: 'bar',
          __typename: 'test-type'
        }
      }
    ]
  });

  test('fires queries in batches', fakeAsync(() => {
    spectator = createService({
      providers: [
        {
          provide: GRAPHQL_OPTIONS,
          useValue: {
            uri: graphQlUri,
            batchSize: 2
          }
        }
      ]
    });

    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();

    // Make second request
    spectator.service
      .query({
        query: gql(buildRequestString('test2')),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();

    // // Only one http request should be fired

    let httpRequest = spectator.expectOne(graphQlUri, HttpMethod.POST).request;

    expect(httpRequest.body).toEqual([
      {
        variables: {},
        query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
      },
      {
        variables: {},
        query: '{\n  test2 {\n    id\n    value\n    __typename\n  }\n}\n'
      }
    ]);

    // Make third request
    spectator.service
      .query({
        query: gql(buildRequestString('test3')),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    tick();
    flush();
    httpRequest = spectator.expectOne(graphQlUri, HttpMethod.POST).request;

    expect(httpRequest.body).toEqual([
      {
        variables: {},
        query: '{\n  test3 {\n    id\n    value\n    __typename\n  }\n}\n'
      }
    ]);

    spectator.controller.verify();
  }));

  test('caches on identical queries', fakeAsync(() => {
    spectator = createService();
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());

    // Make second request
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    spectator.controller.verify();
    flush();
  }));

  test('should not cache on identical queries when no cache policy is selected', fakeAsync(() => {
    spectator = createService();
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());

    // Make second request
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'no-cache'
      })
      .subscribe();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    spectator.controller.verify();
    flush();
  }));

  test('only fires queries that are subscribed', fakeAsync(() => {
    spectator = createService();
    const query$ = spectator.service.query({
      query: gql(buildRequestString()),
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    });
    tick();
    spectator.controller.expectNone(graphQlUri);
    query$.subscribe();

    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());
    flush();
  }));

  test('does not cache entities', fakeAsync(() => {
    spectator = createService();
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    tick();
    // Return an object to be cached
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerArrayResponse());

    // Make a new query, but tweak params so it's not cached and return same id with differen val
    const modifiedRequest = buildRequestString('test', ['a', 'b']);
    spectator.service
      .query({
        query: gql(modifiedRequest),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    tick();

    const modifiedResponse = buildServerArrayResponse('test');
    modifiedResponse.data[0].test.value = 'baz';

    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(modifiedResponse);

    // Now make the first request again - it should be the original result
    spectator.service
      .query({
        query: gql(buildRequestString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe(result => {
        expect((result.data as { test: { value: string } }[])[0].test.value).toEqual('bar');
      });
    // Tick, our responses are always async
    tick();
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerArrayResponse());
    flush();
  }));

  test('cache entity and merge response when they share an id', fakeAsync(() => {
    spectator = createService();
    spectator.service
      .query({
        query: gql(buildRequestIdString('test')),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    tick();
    // Return an object to be cached
    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(buildServerResponse());

    // Make a new query, but tweak params so it's not cached and return same id with differen val
    const modifiedRequest = buildRequestIdString('test', ['a', 'b']);
    spectator.service
      .query({
        query: gql(modifiedRequest),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe();
    tick();

    const modifiedResponse = buildServerResponse('test', ['a', 'b']);
    modifiedResponse.data.test.value = 'baz';

    spectator.expectOne(graphQlUri, HttpMethod.POST).flush(modifiedResponse);

    // Now make the first request again - it should show the merged value
    spectator.service
      .query({
        query: gql(buildRequestIdString()),
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      })
      .subscribe(result => {
        expect((result.data as { test: { value: string } }).test.value).toEqual('baz'); // Should not be bar
      });
    // Tick, our responses are always async
    tick();
    // Should not have fired any new query
    spectator.controller.expectNone(graphQlUri);
    flush();
  }));

  test('late subscribers to a query can trigger query and access results', fakeAsync(() => {
    spectator = createService();
    const query$ = spectator.service.query({
      query: gql(buildRequestString()),
      errorPolicy: 'all',
      fetchPolicy: 'no-cache'
    });
    tick();
    spectator.controller.expectNone(graphQlUri);

    tick(10);
    query$.subscribe();

    // Flush first request out, otherwise apollo deduping will always reuse an identical in flight query
    expect(spectator.expectOne(graphQlUri, HttpMethod.POST).request.body).toEqual([
      {
        variables: {},
        query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
      }
    ]);
    flush();
  }));

  test('resubscribing to a query triggers an immediate new request', fakeAsync(() => {
    spectator = createService();
    const query$ = spectator.service.query({
      query: gql(buildRequestString()),
      errorPolicy: 'all',
      fetchPolicy: 'no-cache'
    });
    query$.subscribe();
    tick();
    let testRequest = spectator.expectOne(graphQlUri, HttpMethod.POST);
    testRequest.flush(buildServerResponse());

    expect(testRequest.request.body).toEqual([
      {
        variables: {},
        query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
      }
    ]);

    query$.subscribe();
    tick();
    flush();
    testRequest = spectator.expectOne(graphQlUri, HttpMethod.POST);
    testRequest.flush(buildServerResponse());
    expect(testRequest.request.body).toEqual([
      {
        variables: {},
        query: '{\n  test {\n    id\n    value\n    __typename\n  }\n}\n'
      }
    ]);
    flush();
  }));
});
