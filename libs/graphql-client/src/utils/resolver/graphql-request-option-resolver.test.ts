import { GraphQlRequestCacheability } from '../../graphql-config';
import { GraphQlRequestOptionResolver } from './graphql-request-option-resolver';

describe('GraphQl request option resolver', () => {
  const request1 = {};
  const request2 = {};
  const cacheable = () => ({
    cacheability: GraphQlRequestCacheability.Cacheable
  });

  const notCacheable = () => ({
    cacheability: GraphQlRequestCacheability.NotCacheable
  });

  test('resolves provided options by priority', () => {
    const resolver = new GraphQlRequestOptionResolver(notCacheable());

    expect(resolver.groupQueriesByResolvedOptions({ request: request1 })).toEqual(
      new Map([[notCacheable(), [request1]]])
    );
    expect(resolver.groupQueriesByResolvedOptions({ request: request1, handlerOptions: cacheable() })).toEqual(
      new Map([[cacheable(), [request1]]])
    );
    expect(
      resolver.groupQueriesByResolvedOptions({
        request: request1,
        handlerOptions: cacheable(),
        requestOptions: notCacheable()
      })
    ).toEqual(new Map([[notCacheable(), [request1]]]));
  });

  test('groups together requests with matching options', () => {
    const resolver = new GraphQlRequestOptionResolver(cacheable());

    expect(resolver.groupQueriesByResolvedOptions({ request: request1 }, { request: request2 })).toEqual(
      new Map([[cacheable(), [request1, request2]]])
    );

    expect(
      resolver.groupQueriesByResolvedOptions({ request: request1 }, { request: request2, handlerOptions: cacheable() })
    ).toEqual(new Map([[cacheable(), [request1, request2]]]));
  });

  test('separates requests with conflicting options', () => {
    const resolver = new GraphQlRequestOptionResolver(cacheable());

    expect(
      resolver.groupQueriesByResolvedOptions(
        { request: request1 },
        { request: request2, handlerOptions: notCacheable() }
      )
    ).toEqual(
      new Map([
        [cacheable(), [request1]],
        [notCacheable(), [request2]]
      ])
    );
  });
});
