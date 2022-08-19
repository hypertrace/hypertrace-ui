import { NavigationService, QueryParamObject } from '@hypertrace/common';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { getAllTestFilterAttributes, getTestFilterAttribute } from '../../test/attributes/attributes';
import { NumberFilterBuilder } from './builder/types/number-filter-builder';
import { StringFilterBuilder } from './builder/types/string-filter-builder';
import { StringMapFilterBuilder } from './builder/types/string-map-filter-builder';
import { Filter, IncompleteFilter } from './filter';
import { FilterAttribute } from './filter-attribute';
import { FilterAttributeType } from './filter-attribute-type';
import { FilterOperator } from './filter-operators';
import { FilterUrlService } from './filter-url.service';

describe('Filter URL service', () => {
  let spectator: SpectatorService<FilterUrlService>;

  const attributes: FilterAttribute[] = getAllTestFilterAttributes();

  const filters: Filter[] = [
    new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.NotEquals,
      217
    ),
    new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.NotEquals,
      415
    ),
    new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.LessThanOrEqualTo,
      707
    ),
    new StringFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.String),
      FilterOperator.Equals,
      'test'
    ),
    new StringMapFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.StringMap),
      FilterOperator.Equals,
      'myValue',
      'myKey'
    )
  ];

  const expectedQueryParamObject = {
    filter: [
      'numberAttribute_neq_217',
      'numberAttribute_neq_415',
      'numberAttribute_lte_707',
      'stringAttribute_eq_test',
      'stringMapAttribute.myKey_eq_myValue'
    ]
  };

  let testQueryParamObject: QueryParamObject = {};

  const buildService = createServiceFactory({
    service: FilterUrlService,
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        addQueryParametersToUrl: (paramObject: QueryParamObject) =>
          (testQueryParamObject = { ...testQueryParamObject, ...paramObject }),
        getAllValuesForQueryParameter: (param: string) => testQueryParamObject[param] ?? []
      })
    ]
  });

  beforeEach(() => {
    testQueryParamObject = {};
    spectator = buildService();
  });

  test('correctly gets filters from url', () => {
    testQueryParamObject = expectedQueryParamObject;
    expect(spectator.service.getUrlFilters(attributes)).toEqual(filters);
  });

  test('correctly sets filters in url', () => {
    spectator.service.setUrlFilters(filters);
    expect(testQueryParamObject).toEqual(expectedQueryParamObject);
  });

  test('clears filters in url if provided an empty array', () => {
    testQueryParamObject = expectedQueryParamObject;
    spectator.service.setUrlFilters([]);

    expect(testQueryParamObject).toEqual({});
  });

  test('correctly adds filters to url', () => {
    /*
     * Add a string filter that should not replace any existing filters
     */
    spectator.service.addUrlFilter(
      attributes,
      new StringFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.String),
        FilterOperator.NotEquals,
        'test'
      )
    );

    /*
     * Add a left bound number filter
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.Number),
        FilterOperator.GreaterThanOrEqualTo,
        217
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_gte_217']
    });

    /*
     * Add a left bound number filter that should replace the existing
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.Number),
        FilterOperator.GreaterThanOrEqualTo,
        415
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_gte_415']
    });

    /*
     * Add a right bound number filter
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.Number),
        FilterOperator.LessThanOrEqualTo,
        707
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_gte_415', 'numberAttribute_lte_707']
    });

    /*
     * Add a right bound number filter that should replace the existing
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.Number),
        FilterOperator.LessThanOrEqualTo,
        949
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_gte_415', 'numberAttribute_lte_949']
    });

    /*
     * Add a not equals that should not replace any existing filters
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.Number),
        FilterOperator.NotEquals,
        2020
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: [
        'stringAttribute_neq_test',
        'numberAttribute_gte_415',
        'numberAttribute_lte_949',
        'numberAttribute_neq_2020'
      ]
    });

    /*
     * Add an equals that should replace all other number filters
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.Number),
        FilterOperator.Equals,
        2020
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_eq_2020']
    });

    /*
     * Add a not equals that should replace the equals filter
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.Number),
        FilterOperator.NotEquals,
        2020
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_neq_2020']
    });

    /*
     * Add an IN that should replace all existing number filters
     */
    spectator.service.addUrlFilter(
      attributes,
      new NumberFilterBuilder().buildFilter(getTestFilterAttribute(FilterAttributeType.Number), FilterOperator.In, 1984)
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_in_1984']
    });

    /*
     * Add a StringMap EQUALS that should not replace any existing filters
     */
    spectator.service.addUrlFilter(
      attributes,
      new StringMapFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.StringMap),
        FilterOperator.Equals,
        'myValue',
        'myKey'
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_neq_test', 'numberAttribute_in_1984', 'stringMapAttribute.myKey_eq_myValue']
    });

    /*
     * Add a second StringMap EQUALS that should not replace any existing filters
     */
    spectator.service.addUrlFilter(
      attributes,
      new StringMapFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.StringMap),
        FilterOperator.Equals,
        'myValue',
        'mySecondKey'
      )
    );
    expect(testQueryParamObject).toEqual({
      filter: [
        'stringAttribute_neq_test',
        'numberAttribute_in_1984',
        'stringMapAttribute.myKey_eq_myValue',
        'stringMapAttribute.mySecondKey_eq_myValue'
      ]
    });

    /*
     * Add a StringMap CONTAINS_KEY that should not replace any existing filters
     */
    spectator.service.addUrlFilter(
      attributes,
      new StringMapFilterBuilder().buildFilter(
        getTestFilterAttribute(FilterAttributeType.StringMap),
        FilterOperator.ContainsKey,
        'myTestKey'
      )
    );

    expect(testQueryParamObject).toEqual({
      filter: [
        'stringAttribute_neq_test',
        'numberAttribute_in_1984',
        'stringMapAttribute.myKey_eq_myValue',
        'stringMapAttribute.mySecondKey_eq_myValue',
        'stringMapAttribute_ck_myTestKey'
      ]
    });
  });

  test('correctly removes filter from url when matching attribute', () => {
    spectator.service.setUrlFilters(filters);

    const testFilter: IncompleteFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.NotEquals,
      0
    );
    testFilter.operator = undefined;
    testFilter.value = undefined;

    spectator.service.removeUrlFilter(attributes, testFilter);

    expect(testQueryParamObject).toEqual({
      filter: ['stringAttribute_eq_test', 'stringMapAttribute.myKey_eq_myValue']
    });
  });

  test('correctly removes filter from url when matching attribute and operator', () => {
    spectator.service.setUrlFilters(filters);

    const testFilter: IncompleteFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.NotEquals,
      0
    );
    testFilter.value = undefined;

    spectator.service.removeUrlFilter(attributes, testFilter);

    expect(testQueryParamObject).toEqual({
      filter: ['numberAttribute_lte_707', 'stringAttribute_eq_test', 'stringMapAttribute.myKey_eq_myValue']
    });
  });

  test('correctly removes filter from url when matching attribute, operator, and value', () => {
    spectator.service.setUrlFilters(filters);

    const test1Filter: IncompleteFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.NotEquals,
      415
    );

    const test2Filter: IncompleteFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.LessThanOrEqualTo,
      707
    );

    spectator.service.removeUrlFilter(attributes, test1Filter);

    expect(testQueryParamObject).toEqual({
      filter: [
        'numberAttribute_neq_217',
        'numberAttribute_lte_707',
        'stringAttribute_eq_test',

        'stringMapAttribute.myKey_eq_myValue'
      ]
    });

    spectator.service.removeUrlFilter(attributes, test2Filter);

    expect(testQueryParamObject).toEqual({
      filter: ['numberAttribute_neq_217', 'stringAttribute_eq_test', 'stringMapAttribute.myKey_eq_myValue']
    });
  });

  test('correctly gets filters and group by from url', () => {
    testQueryParamObject = {
      ...expectedQueryParamObject,
      ['group-by']: ['field1,field2']
    };
    expect(spectator.service.getUrlFilters(attributes)).toEqual(filters);
    expect(spectator.service.getUrlGroupBy()).toEqual(['field1', 'field2']);
  });

  test('correctly sets filters and group by in url', () => {
    spectator.service.setUrlGroupBy(['field1', 'field2']);
    spectator.service.setUrlFilters(filters);

    expect(testQueryParamObject).toEqual({
      ...expectedQueryParamObject,
      ['group-by']: ['field1,field2']
    });
  });

  test('correctly build url filters and group by nav query params', () => {
    expect(
      spectator.service.buildUrlFiltersAndGroupByNavQueryParams(filters.slice(0, 1), attributes.slice(0, 1))
    ).toMatchObject({ filter: ['numberAttribute_neq_217'], 'group-by': ['booleanAttribute'] });
  });
});
