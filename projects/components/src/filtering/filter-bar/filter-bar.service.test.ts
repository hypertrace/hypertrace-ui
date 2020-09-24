import { NavigationService } from '@hypertrace/common';
import { FilterAttribute, FilterType } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { FilterBarService } from './filter-bar.service';
import { NumberFilterBuilder } from './filter/builder/number-filter-builder';
import { StringFilterBuilder } from './filter/builder/string-filter-builder';
import { Filter, UserFilterOperator } from './filter/filter-api';
import { FilterParserLookupService } from '../filter/parser/filter-parser.service';

describe('Filter Bar service', () => {
  let spectator: SpectatorService<FilterBarService>;
  let navigationService: NavigationService;

  const attributes: FilterAttribute[] = [
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: FilterType.Number
    },
    {
      name: 'apiName',
      displayName: 'API Name',
      units: '',
      type: FilterType.String
    }
  ];

  const filters: Filter[] = [
    new NumberFilterBuilder().buildFilter(attributes[0], UserFilterOperator.GreaterThanOrEqualTo, 50),
    new StringFilterBuilder().buildFilter(attributes[1], UserFilterOperator.NotEquals, 'test')
  ];

  const buildService = createServiceFactory({
    service: FilterBarService,
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        addQueryParametersToUrl: jest.fn(),
        getAllValuesForQueryParameter: () => ['duration_gte_50']
      }),
      mockProvider(FilterParserLookupService, {
        parseUrlFilterString: () => filters[0]
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
      filter: ['duration_gte_50', 'apiName_neq_test']
    });
  });

  test('correctly decodes filters string from url and build filter objects', () => {
    expect(spectator.service.getUrlFilters(attributes)).toEqual([filters[0]]);
  });

  test('clears filters in url if provided an empty array', () => {
    spectator.service.setUrlFilters([]);

    expect(navigationService.addQueryParametersToUrl).toHaveBeenCalledWith({
      filter: undefined
    });
  });
});
