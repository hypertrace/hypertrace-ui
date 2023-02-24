import { GraphQlSelection } from '../../model/graphql-selection';
import { GraphQlRequestBuilder } from '../builders/request/graphql-request-builder';
import { GraphQlDataExtractor } from './graphql-data-extractor';

describe('GraphQL Data Extractor', () => {
  const extractor = new GraphQlDataExtractor();
  const keyLookupMap = new Map<GraphQlSelection, string>();
  let mockRequestBuilder: GraphQlRequestBuilder;

  beforeEach(() => {
    // tslint:disable-next-line: no-object-literal-type-assertion
    mockRequestBuilder = {
      // tslint:disable-next-line: strict-boolean-expressions
      getKeyForSelection: jest.fn((selection: GraphQlSelection) => {
        if (keyLookupMap.has(selection)) {
          return keyLookupMap.get(selection)!;
        }

        return selection.path;
      })
    } as Pick<GraphQlRequestBuilder, 'getKeyForSelection'> as GraphQlRequestBuilder;
    keyLookupMap.clear();
  });

  test('can retrieve single values from response objects', () => {
    expect(
      extractor.extract<number>({ path: 'property' }, mockRequestBuilder, {
        property: 15
      })
    ).toBe(15);
  });

  test('can retrieve arrays from response objects', () => {
    expect(
      extractor.extract<number[]>({ path: 'wrapper', children: [{ path: 'property' }] }, mockRequestBuilder, {
        wrapper: [{ property: 5 }, { property: 10 }]
      })
    ).toEqual([{ property: 5 }, { property: 10 }]);
  });

  test('can retrieve properties with injected keys', () => {
    const selection = { path: 'property' };
    keyLookupMap.set(selection, 'property1');
    expect(extractor.extract<number>(selection, mockRequestBuilder, { property1: 15 })).toBe(15);
  });

  test('result has injected keys removed', () => {
    const selection = { path: 'property', children: [{ path: 'child' }] };
    keyLookupMap.set(selection.children[0], 'child1');
    expect(
      extractor.extract<object>(selection, mockRequestBuilder, {
        property: { child1: 15 }
      })
    ).toEqual({ child: 15 });
  });

  test('result uses alias even if replaced with injected key', () => {
    const selection = {
      path: 'property',
      children: [{ path: 'child', alias: 'childAlias' }]
    };
    keyLookupMap.set(selection.children[0], 'child1');
    expect(
      extractor.extract<object>(selection, mockRequestBuilder, {
        property: { child1: 15 }
      })
    ).toEqual({
      childAlias: 15
    });
  });

  test('supports removing injected keys inside array', () => {
    const selection = {
      path: 'property',
      children: [{ path: 'child', alias: 'childAlias' }]
    };
    keyLookupMap.set(selection.children[0], 'child1');
    expect(
      extractor.extract<object>(selection, mockRequestBuilder, {
        property: [{ child1: 15 }, { child1: 20 }]
      })
    ).toEqual([{ childAlias: 15 }, { childAlias: 20 }]);
  });

  test('supports multiple injected keys in child objects', () => {
    const selection = {
      path: 'property',
      children: [
        { path: 'child', alias: 'firstchild' },
        { path: 'child', alias: 'secondchild' }
      ]
    };
    keyLookupMap.set(selection.children[0], 'child1');
    keyLookupMap.set(selection.children[1], 'child2');

    expect(
      extractor.extract<object>(selection, mockRequestBuilder, {
        property: { child1: 15, child2: 20 }
      })
    ).toEqual({
      firstchild: 15,
      secondchild: 20
    });
  });
});
