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
    expect(spectator.service.lookup(FilterOperator.ContainsKeyValue)).toEqual(expect.any(ContainsFilterParser));
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
      false
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
    ).toEqual(false);
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
    expect(spectator.service.isParsableOperatorForType(FilterOperator.LessThan, FilterAttributeType.StringMap)).toEqual(
      false
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
      spectator.service.isParsableOperatorForType(FilterOperator.LessThanOrEqualTo, FilterAttributeType.StringMap)
    ).toEqual(false);
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
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThan, FilterAttributeType.StringMap)
    ).toEqual(false);
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
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThanOrEqualTo, FilterAttributeType.StringMap)
    ).toEqual(false);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.GreaterThanOrEqualTo, FilterAttributeType.Timestamp)
    ).toEqual(false);

    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.Boolean)).toEqual(false);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.Number)).toEqual(true);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.String)).toEqual(true);
    expect(spectator.service.isParsableOperatorForType(FilterOperator.In, FilterAttributeType.StringMap)).toEqual(
      false
    );
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

    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKeyValue, FilterAttributeType.Boolean)
    ).toEqual(false);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKeyValue, FilterAttributeType.Number)
    ).toEqual(false);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKeyValue, FilterAttributeType.String)
    ).toEqual(false);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKeyValue, FilterAttributeType.StringMap)
    ).toEqual(true);
    expect(
      spectator.service.isParsableOperatorForType(FilterOperator.ContainsKeyValue, FilterAttributeType.Timestamp)
    ).toEqual(false);
  });

  test('can provide a parser to parse user filter strings', () => {
    expect(
      spectator.service
        .lookup(FilterOperator.Equals)
        .parseFilterString(getTestFilterAttribute(FilterAttributeType.Boolean), 'Boolean Attribute = false')
    ).toEqual({
      field: 'booleanAttribute',
      operator: FilterOperator.Equals,
      value: false
    });

    expect(
      spectator.service
        .lookup(FilterOperator.LessThanOrEqualTo)
        .parseFilterString(getTestFilterAttribute(FilterAttributeType.Number), 'Number Attribute <= 217')
    ).toEqual({
      field: 'numberAttribute',
      operator: FilterOperator.LessThanOrEqualTo,
      value: 217
    });

    expect(
      spectator.service
        .lookup(FilterOperator.NotEquals)
        .parseFilterString(getTestFilterAttribute(FilterAttributeType.String), 'String Attribute != myString')
    ).toEqual({
      field: 'stringAttribute',
      operator: FilterOperator.NotEquals,
      value: 'myString'
    });

    expect(
      spectator.service
        .lookup(FilterOperator.In)
        .parseFilterString(getTestFilterAttribute(FilterAttributeType.String), 'String Attribute IN myStr, myString')
    ).toEqual({
      field: 'stringAttribute',
      operator: FilterOperator.In,
      value: ['myStr', 'myString']
    });

    expect(
      spectator.service
        .lookup(FilterOperator.ContainsKey)
        .parseFilterString(
          getTestFilterAttribute(FilterAttributeType.StringMap),
          'String Map Attribute CONTAINS_KEY myKey'
        )
    ).toEqual({
      field: 'stringMapAttribute',
      operator: FilterOperator.ContainsKey,
      value: ['myKey']
    });

    expect(
      spectator.service
        .lookup(FilterOperator.ContainsKeyValue)
        .parseFilterString(
          getTestFilterAttribute(FilterAttributeType.StringMap),
          'String Map Attribute CONTAINS_KEY_VALUE myKey:myValue'
        )
    ).toEqual({
      field: 'stringMapAttribute',
      operator: FilterOperator.ContainsKeyValue,
      value: ['myKey', 'myValue']
    });

    expect(
      spectator.service
        .lookup(FilterOperator.Equals)
        .parseFilterString(getTestFilterAttribute(FilterAttributeType.Boolean), 'Timestamp Attribute = 1601578015330')
    ).toEqual(undefined);
  });

  test('can provide a parser to parse various URL filter strings', () => {
    expect(
      spectator.service
        .lookup(FilterOperator.Equals)
        .parseUrlFilterString(getTestFilterAttribute(FilterAttributeType.Boolean), 'booleanAttribute_eq_false')
    ).toEqual({
      field: 'booleanAttribute',
      operator: FilterOperator.Equals,
      value: false
    });

    expect(
      spectator.service
        .lookup(FilterOperator.LessThanOrEqualTo)
        .parseUrlFilterString(getTestFilterAttribute(FilterAttributeType.Number), 'numberAttribute_lte_217')
    ).toEqual({
      field: 'numberAttribute',
      operator: FilterOperator.LessThanOrEqualTo,
      value: 217
    });

    expect(
      spectator.service
        .lookup(FilterOperator.In)
        .parseUrlFilterString(getTestFilterAttribute(FilterAttributeType.Number), 'numberAttribute_in_217%2C415%2C707')
    ).toEqual({
      field: 'numberAttribute',
      operator: FilterOperator.In,
      value: [217, 415, 707]
    });

    expect(
      spectator.service
        .lookup(FilterOperator.NotEquals)
        .parseUrlFilterString(getTestFilterAttribute(FilterAttributeType.String), 'stringAttribute_neq_myString')
    ).toEqual({
      field: 'stringAttribute',
      operator: FilterOperator.NotEquals,
      value: 'myString'
    });

    expect(
      spectator.service
        .lookup(FilterOperator.In)
        .parseUrlFilterString(getTestFilterAttribute(FilterAttributeType.String), 'stringAttribute_in_myStr%2CmyString')
    ).toEqual({
      field: 'stringAttribute',
      operator: FilterOperator.In,
      value: ['myStr', 'myString']
    });

    expect(
      spectator.service
        .lookup(FilterOperator.ContainsKey)
        .parseUrlFilterString(getTestFilterAttribute(FilterAttributeType.StringMap), 'stringMapAttribute_ck_myKey')
    ).toEqual({
      field: 'stringMapAttribute',
      operator: FilterOperator.ContainsKey,
      value: ['myKey']
    });

    expect(
      spectator.service
        .lookup(FilterOperator.ContainsKeyValue)
        .parseUrlFilterString(
          getTestFilterAttribute(FilterAttributeType.StringMap),
          'stringMapAttribute_ckv_myKey%3AmyValue'
        )
    ).toEqual({
      field: 'stringMapAttribute',
      operator: FilterOperator.ContainsKeyValue,
      value: ['myKey', 'myValue']
    });

    expect(
      spectator.service
        .lookup(FilterOperator.Equals)
        .parseUrlFilterString(
          getTestFilterAttribute(FilterAttributeType.Timestamp),
          'timestampAttribute_eq_1601578015330'
        )
    ).toEqual(undefined);
  });
});
