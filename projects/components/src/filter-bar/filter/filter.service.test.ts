import { FilterAttribute, FilterType } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { FilterBuilderService } from './builder/filter-builder.service';
import { NumberFilterBuilder } from './builder/number-filter-builder';
import { StringFilterBuilder } from './builder/string-filter-builder';
import { UserFilterOperator } from './filter-api';
import { FilterService } from './filter.service';

describe('Filter service', () => {
  let spectator: SpectatorService<FilterService>;

  const attributes: FilterAttribute[] = [
    {
      name: 'calls',
      displayName: 'Calls',
      units: '',
      type: FilterType.Number
    },
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: FilterType.Number
    },
    {
      name: 'durationSelf',
      displayName: 'Self Latency',
      units: 'ms',
      type: FilterType.String
    }
  ];

  const numberBuilder = new NumberFilterBuilder();
  const stringBuilder = new StringFilterBuilder();

  const buildService = createServiceFactory({
    service: FilterService,
    providers: [
      mockProvider(FilterBuilderService, {
        isSupportedType: () => true,
        lookup: (attribute: FilterAttribute) => {
          switch (attribute.type) {
            case 'LONG':
              return numberBuilder;
            case 'STRING':
            default:
              return stringBuilder;
          }
        }
      })
    ]
  });

  beforeEach(() => {
    spectator = buildService();
  });

  test('correctly finds matching filters with no user text', () => {
    expect(spectator.service.lookupAvailableMatchingFilters(attributes)).toEqual([
      {
        metadata: attributes[0],
        field: attributes[0].name,
        userString: attributes[0].displayName
      },
      {
        metadata: attributes[1],
        field: attributes[1].name,
        userString: attributes[1].displayName
      },
      {
        metadata: attributes[2],
        field: attributes[2].name,
        userString: attributes[2].displayName
      }
    ]);
  });

  test('correctly finds matching filters with partial user text', () => {
    expect(spectator.service.lookupAvailableMatchingFilters(attributes, 'a')).toEqual([
      {
        metadata: attributes[0],
        field: attributes[0].name,
        userString: attributes[0].displayName
      },
      {
        metadata: attributes[1],
        field: attributes[1].name,
        userString: attributes[1].displayName
      },
      {
        metadata: attributes[2],
        field: attributes[2].name,
        userString: attributes[2].displayName
      }
    ]);

    expect(spectator.service.lookupAvailableMatchingFilters(attributes, 'Laten')).toEqual([
      {
        metadata: attributes[1],
        field: attributes[1].name,
        userString: attributes[1].displayName
      },
      {
        metadata: attributes[2],
        field: attributes[2].name,
        userString: attributes[2].displayName
      }
    ]);
  });

  test('correctly builds operator filters when field is matched', () => {
    expect(spectator.service.lookupAvailableMatchingFilters(attributes, 'calls')).toEqual([
      numberBuilder.buildFilter(attributes[0], UserFilterOperator.Equals),
      numberBuilder.buildFilter(attributes[0], UserFilterOperator.NotEquals),
      numberBuilder.buildFilter(attributes[0], UserFilterOperator.LessThan),
      numberBuilder.buildFilter(attributes[0], UserFilterOperator.LessThanOrEqualTo),
      numberBuilder.buildFilter(attributes[0], UserFilterOperator.GreaterThan),
      numberBuilder.buildFilter(attributes[0], UserFilterOperator.GreaterThanOrEqualTo),
      numberBuilder.buildFilter(attributes[0], UserFilterOperator.In)
    ]);
  });
});
