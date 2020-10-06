import { NavigationService } from '@hypertrace/common';
import { FilterAttribute, FilterAttributeType } from '@hypertrace/components';
import { getTestFilterAttribute } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { FilterBuilderLookupService } from './builder/filter-builder-lookup.service';
import { NumberFilterBuilder } from './builder/types/number-filter-builder';
import { StringFilterBuilder } from './builder/types/string-filter-builder';
import { Filter } from './filter';
import { FilterOperator } from './filter-operators';
import { FilterService } from './filter.service';
import { FilterParserLookupService } from './parser/filter-parser-lookup.service';
import { ComparisonFilterParser } from './parser/types/comparison-filter-parser';

describe('Filter service', () => {
  let spectator: SpectatorService<FilterService>;
  let navigationService: NavigationService;

  const attributes: FilterAttribute[] = [
    getTestFilterAttribute(FilterAttributeType.Number),
    getTestFilterAttribute(FilterAttributeType.String)
  ];

  const filters: Filter[] = [
    new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.GreaterThanOrEqualTo,
      50
    ),
    new StringFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.String),
      FilterOperator.NotEquals,
      'test'
    )
  ];

  const buildService = createServiceFactory({
    service: FilterService,
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        addQueryParametersToUrl: jest.fn(),
        getAllValuesForQueryParameter: () => ['numberAttribute_gte_50', 'stringAttribute_neq_test']
      }),
      mockProvider(FilterBuilderLookupService, {
        isBuildableType: () => true,
        lookup: (type: FilterAttributeType) =>
          type === FilterAttributeType.Number ? new NumberFilterBuilder() : new StringFilterBuilder()
      }),
      mockProvider(FilterParserLookupService, {
        lookup: () => new ComparisonFilterParser()
      })
    ]
  });

  beforeEach(() => {
    spectator = buildService();
    navigationService = spectator.inject(NavigationService);
  });

  test('correctly sets filters in url', () => {
    spectator.service.setUrlFilters(filters);

    expect(navigationService.addQueryParametersToUrl).toHaveBeenCalledWith({
      filter: ['numberAttribute_gte_50', 'stringAttribute_neq_test']
    });
  });

  test('correctly decodes filters string from url and build filter objects', () => {
    expect(spectator.service.getUrlFilters(attributes)).toEqual(filters);
  });

  test('clears filters in url if provided an empty array', () => {
    spectator.service.setUrlFilters([]);

    expect(navigationService.addQueryParametersToUrl).toHaveBeenCalledWith({
      filter: undefined
    });
  });

  test('correctly sets filters in url', () => {
    spectator.service.applyUrlFilter(attributes, filters[0]);
    spectator.service.applyUrlFilter(attributes, filters[1]);

    expect(navigationService.addQueryParametersToUrl).toHaveBeenCalledWith({
      filter: ['numberAttribute_gte_50', 'stringAttribute_neq_test']
    });
  });

  test('correctly finds matching filters with no user text', () => {
    expect(spectator.service.autocompleteFilters(attributes)).toEqual([
      {
        metadata: attributes[0],
        field: attributes[0].name,
        userString: attributes[0].displayName
      },
      {
        metadata: attributes[1],
        field: attributes[1].name,
        userString: attributes[1].displayName
      }
    ]);
  });

  test('correctly finds matching filters with partial user text', () => {
    expect(spectator.service.autocompleteFilters(attributes, 'attr')).toEqual([
      {
        metadata: attributes[0],
        field: attributes[0].name,
        userString: attributes[0].displayName
      },
      {
        metadata: attributes[1],
        field: attributes[1].name,
        userString: attributes[1].displayName
      }
    ]);

    expect(spectator.service.autocompleteFilters(attributes, 'nu')).toEqual([
      {
        metadata: attributes[0],
        field: attributes[0].name,
        userString: attributes[0].displayName
      }
    ]);
  });

  test('correctly builds operator filters when field is matched', () => {
    expect(spectator.service.autocompleteFilters(attributes, 'String Attribute')).toEqual([
      {
        metadata: attributes[1],
        field: attributes[1].name,
        operator: FilterOperator.Equals,
        userString: `${attributes[1].displayName} ${FilterOperator.Equals}`
      },
      {
        metadata: attributes[1],
        field: attributes[1].name,
        operator: FilterOperator.NotEquals,
        userString: `${attributes[1].displayName} ${FilterOperator.NotEquals}`
      },
      {
        metadata: attributes[1],
        field: attributes[1].name,
        operator: FilterOperator.In,
        userString: `${attributes[1].displayName} ${FilterOperator.In}`
      }
    ]);
  });
});
