import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { getTestFilterAttribute } from '../../../test/attributes/attributes';
import { FilterAttributeType } from '../filter-attribute-type';
import { FilterOperator } from '../filter-operators';
import { FilterBuilderLookupService } from './filter-builder-lookup.service';
import { BooleanFilterBuilder } from './types/boolean-filter-builder';
import { NumberFilterBuilder } from './types/number-filter-builder';
import { StringFilterBuilder } from './types/string-filter-builder';
import { StringMapFilterBuilder } from './types/string-map-filter-builder';

describe('Filter Builder Lookup service', () => {
  let spectator: SpectatorService<FilterBuilderLookupService>;

  const buildService = createServiceFactory({
    service: FilterBuilderLookupService
  });

  beforeEach(() => {
    spectator = buildService();
  });

  test('correctly looks up registered filter builders', () => {
    expect(spectator.service.lookup(FilterAttributeType.Boolean)).toEqual(expect.any(BooleanFilterBuilder));
    expect(spectator.service.lookup(FilterAttributeType.Number)).toEqual(expect.any(NumberFilterBuilder));
    expect(spectator.service.lookup(FilterAttributeType.String)).toEqual(expect.any(StringFilterBuilder));
    expect(spectator.service.lookup(FilterAttributeType.StringMap)).toEqual(expect.any(StringMapFilterBuilder));
    expect(() => spectator.service.lookup(FilterAttributeType.Timestamp)).toThrowError();
  });

  test('correctly identify buildable types', () => {
    expect(spectator.service.isBuildableType(FilterAttributeType.Boolean)).toEqual(true);
    expect(spectator.service.isBuildableType(FilterAttributeType.Number)).toEqual(true);
    expect(spectator.service.isBuildableType(FilterAttributeType.String)).toEqual(true);
    expect(spectator.service.isBuildableType(FilterAttributeType.StringMap)).toEqual(true);
    expect(spectator.service.isBuildableType(FilterAttributeType.Timestamp)).toEqual(false);
  });

  test('can provide a builder to build filters for supported operators', () => {
    expect(
      spectator.service
        .lookup(FilterAttributeType.Boolean)
        .buildFiltersForSupportedOperators(getTestFilterAttribute(FilterAttributeType.Boolean), false)
    ).toEqual([
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Boolean),
        field: getTestFilterAttribute(FilterAttributeType.Boolean).name,
        operator: FilterOperator.Equals,
        value: false,
        userString: 'Boolean Attribute = false',
        urlString: 'booleanAttribute_eq_false'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Boolean),
        field: getTestFilterAttribute(FilterAttributeType.Boolean).name,
        operator: FilterOperator.NotEquals,
        value: false,
        userString: 'Boolean Attribute != false',
        urlString: 'booleanAttribute_neq_false'
      }
    ]);

    expect(
      spectator.service
        .lookup(FilterAttributeType.Number)
        .buildFiltersForSupportedOperators(getTestFilterAttribute(FilterAttributeType.Number), 217)
    ).toEqual([
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        operator: FilterOperator.Equals,
        value: 217,
        userString: 'Number Attribute = 217',
        urlString: 'numberAttribute_eq_217'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        operator: FilterOperator.NotEquals,
        value: 217,
        userString: 'Number Attribute != 217',
        urlString: 'numberAttribute_neq_217'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        operator: FilterOperator.LessThan,
        value: 217,
        userString: 'Number Attribute < 217',
        urlString: 'numberAttribute_lt_217'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        operator: FilterOperator.LessThanOrEqualTo,
        value: 217,
        userString: 'Number Attribute <= 217',
        urlString: 'numberAttribute_lte_217'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        operator: FilterOperator.GreaterThan,
        value: 217,
        userString: 'Number Attribute > 217',
        urlString: 'numberAttribute_gt_217'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        operator: FilterOperator.GreaterThanOrEqualTo,
        value: 217,
        userString: 'Number Attribute >= 217',
        urlString: 'numberAttribute_gte_217'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        operator: FilterOperator.In,
        value: 217,
        userString: 'Number Attribute IN 217',
        urlString: 'numberAttribute_in_217'
      }
    ]);

    expect(
      spectator.service
        .lookup(FilterAttributeType.String)
        .buildFiltersForSupportedOperators(getTestFilterAttribute(FilterAttributeType.String), 'test value')
    ).toEqual([
      {
        metadata: getTestFilterAttribute(FilterAttributeType.String),
        field: getTestFilterAttribute(FilterAttributeType.String).name,
        operator: FilterOperator.Equals,
        value: 'test value',
        userString: 'String Attribute = test value',
        urlString: 'stringAttribute_eq_test%20value'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.String),
        field: getTestFilterAttribute(FilterAttributeType.String).name,
        operator: FilterOperator.NotEquals,
        value: 'test value',
        userString: 'String Attribute != test value',
        urlString: 'stringAttribute_neq_test%20value'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.String),
        field: getTestFilterAttribute(FilterAttributeType.String).name,
        operator: FilterOperator.In,
        value: 'test value',
        userString: 'String Attribute IN test value',
        urlString: 'stringAttribute_in_test%20value'
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.String),
        field: getTestFilterAttribute(FilterAttributeType.String).name,
        operator: FilterOperator.Like,
        value: 'test value',
        userString: 'String Attribute ~ test value',
        urlString: 'stringAttribute_lk_test%20value'
      }
    ]);

    expect(
      spectator.service
        .lookup(FilterAttributeType.StringMap)
        .buildFilter(getTestFilterAttribute(FilterAttributeType.StringMap), FilterOperator.ContainsKey, 'myKey')
    ).toEqual({
      metadata: getTestFilterAttribute(FilterAttributeType.StringMap),
      field: getTestFilterAttribute(FilterAttributeType.StringMap).name,
      operator: FilterOperator.ContainsKey,
      value: 'myKey',
      userString: 'String Map Attribute CONTAINS_KEY myKey',
      urlString: 'stringMapAttribute_ck_myKey'
    });

    expect(
      spectator.service
        .lookup(FilterAttributeType.StringMap)
        .buildFilter(getTestFilterAttribute(FilterAttributeType.StringMap), FilterOperator.Equals, 'myValue', 'myKey')
    ).toEqual({
      metadata: getTestFilterAttribute(FilterAttributeType.StringMap),
      field: getTestFilterAttribute(FilterAttributeType.StringMap).name,
      subpath: 'myKey',
      operator: FilterOperator.Equals,
      value: 'myValue',
      userString: 'String Map Attribute.myKey = myValue',
      urlString: 'stringMapAttribute.myKey_eq_myValue'
    });
  });
});
