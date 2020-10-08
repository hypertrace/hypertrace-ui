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
import { FilterUrlService } from './filter-url.service';
import { FilterParserLookupService } from './parser/filter-parser-lookup.service';
import { ComparisonFilterParser } from './parser/types/comparison-filter-parser';

describe('Filter URL service', () => {
  let spectator: SpectatorService<FilterUrlService>;
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
    service: FilterUrlService,
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
});
