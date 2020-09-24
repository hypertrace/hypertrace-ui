import { FilterAttribute, FilterType } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { FilterBuilderLookupService } from '../builder/filter-builder.service';
import { NumberFilterBuilder } from '../../filter-bar/filter/builder/number-filter-builder';
import { StringFilterBuilder } from '../../filter-bar/filter/builder/string-filter-builder';
import { UserFilterOperator } from '../../filter-bar/filter/filter-api';
import { FilterParserLookupService } from './filter-parser.service';

describe('Filter Parser service', () => {
  let spectator: SpectatorService<FilterParserLookupService>;

  const attributes: FilterAttribute[] = [
    {
      name: 'callMeMaybe',
      displayName: "Here's my number",
      units: '',
      type: FilterType.String
    },
    {
      name: 'call',
      displayName: 'Call count',
      units: '',
      type: FilterType.Number
    },
    {
      name: 'serviceName',
      displayName: 'Service Name',
      units: '',
      type: FilterType.String
    }
  ];

  const numberBuilder = new NumberFilterBuilder();
  const stringBuilder = new StringFilterBuilder();

  const buildService = createServiceFactory({
    service: FilterParserLookupService,
    providers: [
      mockProvider(FilterBuilderLookupService, {
        lookup: (attribute: FilterAttribute) => {
          switch (attribute.type) {
            case FilterType.Number:
              return numberBuilder;
            case FilterType.String:
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

  test('correctly parses complete url filter string to Filter', () => {
    expect(spectator.service.parseUrlFilterString('call_eq_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.Equals, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_neq_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.NotEquals, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_lt_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.LessThan, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_lte_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.LessThanOrEqualTo, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_gt_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.GreaterThan, 100)
    );

    expect(spectator.service.parseUrlFilterString('serviceName_in_shippingservice%2Cuserservice', attributes)).toEqual(
      stringBuilder.buildFilter(attributes[2], UserFilterOperator.In, ['shippingservice', 'userservice'])
    );
  });

  test('correctly parses complete user filter string to Filter', () => {
    const expectedNumber = numberBuilder.buildFilter(attributes[1], UserFilterOperator.GreaterThanOrEqualTo, 100);
    const expectedString = stringBuilder.buildFilter(attributes[2], UserFilterOperator.In, [
      'shippingservice',
      'userservice'
    ]);

    expect(spectator.service.parseUserFilterString('call count >= 100', attributes[1])).toEqual(expectedNumber);
    expect(spectator.service.parseUserFilterString('  call count   >=    100   ', attributes[1])).toEqual(
      expectedNumber
    );
    expect(spectator.service.parseUserFilterString('calls >= 100', attributes[1])).not.toEqual(expectedNumber);

    expect(
      spectator.service.parseUserFilterString('Service Name IN shippingservice,userservice', attributes[2])
    ).toEqual(expectedString);
    expect(
      spectator.service.parseUserFilterString('service name IN shippingservice, userservice', attributes[2])
    ).toEqual(expectedString);
  });
});
