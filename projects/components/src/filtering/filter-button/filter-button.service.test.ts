import { NavigationService } from '@hypertrace/common';
import { Filter, FilterAttribute, FilterType, UserFilterOperator } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { NumberFilterBuilder } from '../filter-bar/filter/builder/number-filter-builder';
import { StringFilterBuilder } from '../filter-bar/filter/builder/string-filter-builder';
import { FilterParserService } from '../filter-bar/filter/parser/filter-parser.service';
import { FilterButtonService } from './filter-button.service';

describe('Filter Button service', () => {
  let spectator: SpectatorService<FilterButtonService>;
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
    service: FilterButtonService,
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        addQueryParametersToUrl: jest.fn(),
        getAllValuesForQueryParameter: () => ['duration_gte_50']
      }),
      mockProvider(FilterParserService, {
        parseUrlFilterString: () => filters[0]
      })
    ]
  });

  beforeEach(() => {
    spectator = buildService();
    navigationService = spectator.inject(NavigationService);
  });

  test('correctly sets filters in url', () => {
    spectator.service.applyUrlFilter(attributes, filters[0]);
    spectator.service.applyUrlFilter(attributes, filters[1]);

    expect(navigationService.addQueryParametersToUrl).toHaveBeenCalledWith({
      filter: ['duration_gte_50', 'apiName_neq_test']
    });
  });
});
