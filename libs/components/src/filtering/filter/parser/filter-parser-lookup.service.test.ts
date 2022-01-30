import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { getTestFilterAttribute } from '../../../test/attributes/attributes';
import { FilterAttributeType } from '../filter-attribute-type';
import { FilterOperator } from '../filter-operators';
import { FilterParserLookupService } from './filter-parser-lookup.service';
import { ComparisonFilterParser } from './types/comparison-filter-parser';
import { ContainsFilterParser } from './types/contains-filter-parser';
import { InFilterParser } from './types/in-filter-parser';

describe('Filter Parser Lookup service', () => {
  let spectator: SpectatorService<FilterParserLookupService>;

  const buildService = createServiceFactory({
    service: FilterParserLookupService
  });

  beforeEach(() => {
    spectator = buildService();
  });
  test('correctly looks up registered filter parsers', () => {
    expect(spectator.service.lookup(FilterOperator.Equals)).toEqual(expect.any(ComparisonFilterParser));
    expect(spectator.service.lookup(FilterOperator.NotEquals)).toEqual(expect.any(ComparisonFilterParser));
    expect(spectator.service.lookup(FilterOperator.LessThan)).toEqual(expect.any(ComparisonFilterParser));
    expect(spectator.service.lookup(FilterOperator.LessThanOrEqualTo)).toEqual(expect.any(ComparisonFilterParser));
    expect(spectator.service.lookup(FilterOperator.GreaterThan)).toEqual(expect.any(ComparisonFilterParser));
    expect(spectator.service.lookup(FilterOperator.GreaterThanOrEqualTo)).toEqual(expect.any(ComparisonFilterParser));

    expect(spectator.service.lookup(FilterOperator.In)).toEqual(expect.any(InFilterParser));

    expect(spectator.service.lookup(FilterOperator.ContainsKey)).toEqual(expect.any(ContainsFilterParser));
  });

  test('correctly identify parsable operators for a type', () => {
    expect(spectator.service.isParsableOperatorForType(FilterOperator.Equals, FilterAttributeType.Boolean)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.Equals, FilterAttributeType.Number)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.Equals, FilterAttributeType.String)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.Equals, FilterAttributeType.StringMap)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.Equals, FilterAttributeType.Timestamp)).toEqual(
      false
    );

    expect(spectator.service.isParsableOperatorForType(FilterOperator.NotEquals, FilterAttributeType.Boolean)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.NotEquals, FilterAttributeType.Number)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.NotEquals, FilterAttributeType.String)).toEqual(
      true
    );
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.NotEquals, FilterAttributeType.StringMap)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.NotEquals, FilterAttributeType.Timestamp)
    ).toEqual(false);

    expect(spectator.service.isParsableOperatorForType(FilterOperator.LessThan, FilterAttributeType.Boolean)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.LessThan, FilterAttributeType.Number)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.LessThan, FilterAttributeType.String)).toEqual(
      true
    );

    expect(spectator.service.isParsableOperatorForType(FilterOperator.LessThan, FilterAttributeType.Timestamp)).toEqual(
      false
    );

    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.LessThanOrEqualTo, FilterAttributeType.Boolean)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.LessThanOrEqualTo, FilterAttributeType.Number)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.LessThanOrEqualTo, FilterAttributeType.String)
    ).toEqual(true);

    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.LessThanOrEqualTo, FilterAttributeType.Timestamp)
    ).toEqual(false);

    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThan, FilterAttributeType.Boolean)
    ).toEqual(true);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.GreaterThan, FilterAttributeType.Number)).toEqual(
      true
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.GreaterThan, FilterAttributeType.String)).toEqual(
      true
    );

    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThan, FilterAttributeType.Timestamp)
    ).toEqual(false);

    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThanOrEqualTo, FilterAttributeType.Boolean)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThanOrEqualTo, FilterAttributeType.Number)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThanOrEqualTo, FilterAttributeType.String)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThanOrEqualTo, FilterAttributeType.Timestamp)
    ).toEqual(false);

    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.Boolean)).toEqual(false);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.Number)).toEqual(true);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.String)).toEqual(true);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.StringMap)).toEqual(true);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.Timestamp)).toEqual(
      false
    );

    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKey, FilterAttributeType.Boolean)
    ).toEqual(false);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.ContainsKey, FilterAttributeType.Number)).toEqual(
      false
    );
    expect(spectator.service.isParsableOperatorForType(FilterOperator.ContainsKey, FilterAttributeType.String)).toEqual(
      false
    );
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKey, FilterAttributeType.StringMap)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKey, FilterAttributeType.Timestamp)
    ).toEqual(false);
  });

  test('can provide a parser to parse split filters', () => {
    expect(
      spectator.service.lookup(FilterOperator.Equals).parseSplitFilter({
        attribute: getTestFilterAttribute(FilterAttributeType.Boolean),
        operator: FilterOperator.Equals,
        rhs: 'false'
      })
    ).toEqual({
      field: 'booleanAttribute',
      operator: FilterOperator.Equals,
      value: false
    });

    expect(
      spectator.service.lookup(FilterOperator.LessThanOrEqualTo).parseSplitFilter({
        attribute: getTestFilterAttribute(FilterAttributeType.Number),
        operator: FilterOperator.LessThanOrEqualTo,
        rhs: '217'
      })
    ).toEqual({
      field: 'numberAttribute',
      operator: FilterOperator.LessThanOrEqualTo,
      value: 217
    });

    expect(
      spectator.service.lookup(FilterOperator.NotEquals).parseSplitFilter({
        attribute: getTestFilterAttribute(FilterAttributeType.String),
        operator: FilterOperator.NotEquals,
        rhs: 'myString'
      })
    ).toEqual({
      field: 'stringAttribute',
      operator: FilterOperator.NotEquals,
      value: 'myString'
    });

    expect(
      spectator.service.lookup(FilterOperator.In).parseSplitFilter({
        attribute: getTestFilterAttribute(FilterAttributeType.String),
        operator: FilterOperator.In,
        rhs: 'myStr, myString'
      })
    ).toEqual({
      field: 'stringAttribute',
      operator: FilterOperator.In,
      value: ['myStr', 'myString']
    });

    expect(
      spectator.service.lookup(FilterOperator.ContainsKey).parseSplitFilter({
        attribute: getTestFilterAttribute(FilterAttributeType.StringMap),
        operator: FilterOperator.ContainsKey,
        rhs: 'myKey'
      })
    ).toEqual({
      field: 'stringMapAttribute',
      operator: FilterOperator.ContainsKey,
      value: 'myKey'
    });

    expect(
      spectator.service.lookup(FilterOperator.Equals).parseSplitFilter({
        attribute: getTestFilterAttribute(FilterAttributeType.StringMap),
        subpath: 'myKey',
        operator: FilterOperator.Equals,
        rhs: 'myValue'
      })
    ).toEqual({
      field: 'stringMapAttribute',
      subpath: 'myKey',
      operator: FilterOperator.Equals,
      value: 'myValue'
    });

    // Not supported
    expect(
      spectator.service.lookup(FilterOperator.Equals).parseSplitFilter({
        attribute: getTestFilterAttribute(FilterAttributeType.Boolean),
        operator: FilterOperator.Equals,
        rhs: '601578015330'
      })
    ).toEqual(undefined);
  });
});
