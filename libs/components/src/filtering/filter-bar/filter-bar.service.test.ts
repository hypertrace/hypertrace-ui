import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { getTestFilterAttribute } from '../../test/attributes/attributes';
import { BooleanFilterBuilder } from '../filter/builder/types/boolean-filter-builder';
import { NumberFilterBuilder } from '../filter/builder/types/number-filter-builder';
import { StringFilterBuilder } from '../filter/builder/types/string-filter-builder';
import { StringMapFilterBuilder } from '../filter/builder/types/string-map-filter-builder';
import { Filter } from '../filter/filter';
import { FilterAttributeType } from '../filter/filter-attribute-type';
import { FilterOperator } from '../filter/filter-operators';
import { FilterBarService } from './filter-bar.service';

describe('Filter Bar service', () => {
  let spectator: SpectatorService<FilterBarService>;

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
      'myValue'
    ),
    new StringMapFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.StringMap),
      FilterOperator.Equals,
      'myValue',
      'myKey'
    )
  ];

  const buildService = createServiceFactory({
    service: FilterBarService,
    providers: []
  });

  beforeEach(() => {
    spectator = buildService();
  });

  test('correctly adds filters', () => {
    let testFilters: Filter[] = [];

    /*
     * Add a string filter that should not replace existing filters
     */

    const stringFilter = new StringFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.String),
      FilterOperator.NotEquals,
      'test'
    );

    testFilters = spectator.service.addFilter(testFilters, stringFilter);

    expect(testFilters).toEqual([stringFilter]);

    /*
     * Add a left bound number filter
     */

    const leftBoundNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.GreaterThanOrEqualTo,
      217
    );

    testFilters = spectator.service.addFilter(testFilters, leftBoundNumberFilter);

    expect(testFilters).toEqual([stringFilter, leftBoundNumberFilter]);

    /*
     * Add a left bound number filter that should replace the existing filter
     */

    const replacementLeftBoundNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.GreaterThan,
      415
    );

    testFilters = spectator.service.addFilter(testFilters, replacementLeftBoundNumberFilter);

    expect(testFilters).toEqual([stringFilter, replacementLeftBoundNumberFilter]);

    /*
     * Add a right bound number filter
     */

    const rightBoundNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.LessThanOrEqualTo,
      707
    );

    testFilters = spectator.service.addFilter(testFilters, rightBoundNumberFilter);

    expect(testFilters).toEqual([stringFilter, replacementLeftBoundNumberFilter, rightBoundNumberFilter]);

    /*
     * Add a right bound number filter that should replace the existing filter
     */

    const replacementRightBoundNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.LessThan,
      949
    );

    testFilters = spectator.service.addFilter(testFilters, replacementRightBoundNumberFilter);

    expect(testFilters).toEqual([stringFilter, replacementLeftBoundNumberFilter, replacementRightBoundNumberFilter]);

    /*
     * Add a not equals that should not replace any existing filters
     */

    const notEqualsNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.NotEquals,
      2020
    );

    testFilters = spectator.service.addFilter(testFilters, notEqualsNumberFilter);

    expect(testFilters).toEqual([
      stringFilter,
      replacementLeftBoundNumberFilter,
      replacementRightBoundNumberFilter,
      notEqualsNumberFilter
    ]);

    /*
     * Add an equals that should replace all other existing number filters
     */

    const equalsNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.Equals,
      2020
    );

    testFilters = spectator.service.addFilter(testFilters, equalsNumberFilter);

    expect(testFilters).toEqual([stringFilter, equalsNumberFilter]);

    /*
     * Add a not equals that should replace the existing equals filter
     */

    const replacementNotEqualsNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.NotEquals,
      2020
    );

    testFilters = spectator.service.addFilter(testFilters, replacementNotEqualsNumberFilter);

    expect(testFilters).toEqual([stringFilter, replacementNotEqualsNumberFilter]);

    /*
     * Add an IN that should replace all other existing number filters
     */

    const inNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.In,
      1984
    );

    testFilters = spectator.service.addFilter(testFilters, inNumberFilter);

    expect(testFilters).toEqual([stringFilter, inNumberFilter]);

    /*
     * Add a StringMap EQUALS should not replace any existing filters
     */

    const firstStringMapFilter = new StringMapFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.StringMap),
      FilterOperator.Equals,
      'myValue',
      'myKey'
    );

    testFilters = spectator.service.addFilter(testFilters, firstStringMapFilter);

    expect(testFilters).toEqual([stringFilter, inNumberFilter, firstStringMapFilter]);
    /*
     * Add a second StringMap EQUALS filters with a different key should not replace any existing filters
     */

    const secondStringMapFilter = new StringMapFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.StringMap),
      FilterOperator.Equals,
      'myValue',
      'mySecondKey'
    );

    testFilters = spectator.service.addFilter(testFilters, secondStringMapFilter);

    expect(testFilters).toEqual([stringFilter, inNumberFilter, firstStringMapFilter, secondStringMapFilter]);

    /*
     * Add a StringMap CONTAINS_KEY that should not replace any existing filters
     */

    const ckStringMapFilter = new StringMapFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.StringMap),
      FilterOperator.ContainsKey,
      'myTestKey'
    );

    testFilters = spectator.service.addFilter(testFilters, ckStringMapFilter);

    expect(testFilters).toEqual([
      stringFilter,
      inNumberFilter,
      firstStringMapFilter,
      secondStringMapFilter,
      ckStringMapFilter
    ]);
  });

  test('correctly updates filters', () => {
    const testBooleanFilter = new BooleanFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Boolean),
      FilterOperator.NotEquals,
      true
    );

    const testStringMapFilter = new StringMapFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.StringMap),
      FilterOperator.Equals,
      'myTestValue',
      'myTestKey'
    );

    const testNumberFilter = new NumberFilterBuilder().buildFilter(
      getTestFilterAttribute(FilterAttributeType.Number),
      FilterOperator.LessThanOrEqualTo,
      2020
    );

    /*
     * Updates without incompatible filters
     */
    const testFilters1 = spectator.service.updateFilter(filters, filters[1], testBooleanFilter);

    expect(testFilters1).toEqual([filters[0], testBooleanFilter, filters[2], filters[3], filters[4]]);

    /*
     * Updates with incompatible filters
     */
    const testFilters2 = spectator.service.updateFilter(testFilters1, filters[3], testStringMapFilter);
    const testFilters3 = spectator.service.updateFilter(testFilters2, filters[0], testNumberFilter);

    expect(testFilters3).toEqual([testNumberFilter, testBooleanFilter, testStringMapFilter, filters[4]]);
  });

  test('correctly deletes filters', () => {
    expect(spectator.service.deleteFilter(filters, filters[1])).toEqual([
      filters[0],
      filters[2],
      filters[3],
      filters[4]
    ]);

    expect(spectator.service.deleteFilter(filters, filters[3])).toEqual([
      filters[0],
      filters[1],
      filters[2],
      filters[4]
    ]);
  });
});
