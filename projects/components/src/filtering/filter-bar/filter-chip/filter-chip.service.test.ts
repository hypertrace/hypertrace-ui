import { assertUnreachable } from '@hypertrace/common';
import { getTestFilterAttribute } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { FilterBuilderLookupService } from '../../filter/builder/filter-builder-lookup.service';
import { BooleanFilterBuilder } from '../../filter/builder/types/boolean-filter-builder';
import { NumberFilterBuilder } from '../../filter/builder/types/number-filter-builder';
import { StringFilterBuilder } from '../../filter/builder/types/string-filter-builder';
import { StringMapFilterBuilder } from '../../filter/builder/types/string-map-filter-builder';
import { FilterAttribute } from '../../filter/filter-attribute';
import { FilterAttributeType } from '../../filter/filter-attribute-type';
import { FilterOperator } from '../../filter/filter-operators';
import { FilterParserLookupService } from '../../filter/parser/filter-parser-lookup.service';
import { ComparisonFilterParser } from '../../filter/parser/types/comparison-filter-parser';
import { ContainsFilterParser } from '../../filter/parser/types/contains-filter-parser';
import { InFilterParser } from '../../filter/parser/types/in-filter-parser';
import { FilterChipService } from './filter-chip.service';

describe('Filter Chip service', () => {
  let spectator: SpectatorService<FilterChipService>;

  const attributes: FilterAttribute[] = [
    getTestFilterAttribute(FilterAttributeType.Boolean),
    getTestFilterAttribute(FilterAttributeType.Number),
    getTestFilterAttribute(FilterAttributeType.String),
    getTestFilterAttribute(FilterAttributeType.StringMap)
  ];

  const buildService = createServiceFactory({
    service: FilterChipService,
    providers: [
      mockProvider(FilterBuilderLookupService, {
        isBuildableType: (type: FilterAttributeType) => type !== FilterAttributeType.Timestamp,
        lookup: (type: FilterAttributeType) => {
          switch (type) {
            case FilterAttributeType.Boolean:
              return new BooleanFilterBuilder();
            case FilterAttributeType.Number:
              return new NumberFilterBuilder();
            case FilterAttributeType.String:
              return new StringFilterBuilder();
            case FilterAttributeType.StringMap:
              return new StringMapFilterBuilder();
            case FilterAttributeType.StringArray:
            case FilterAttributeType.Timestamp:
              return undefined;
            default:
              assertUnreachable(type);
          }
        }
      }),
      mockProvider(FilterParserLookupService, {
        lookup: (operator: FilterOperator) => {
          switch (operator) {
            case FilterOperator.Equals:
            case FilterOperator.NotEquals:
            case FilterOperator.LessThan:
            case FilterOperator.LessThanOrEqualTo:
            case FilterOperator.GreaterThan:
            case FilterOperator.GreaterThanOrEqualTo:
            case FilterOperator.Like:
              return new ComparisonFilterParser();
            case FilterOperator.In:
              return new InFilterParser();
            case FilterOperator.ContainsKey:
              return new ContainsFilterParser();
            default:
              assertUnreachable(operator);
          }
        }
      })
    ]
  });

  beforeEach(() => {
    spectator = buildService();
  });

  test('correctly autocompletes matching filters with no user text', () => {
    expect(spectator.service.autocompleteFilters(attributes)).toEqual([
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Boolean),
        field: getTestFilterAttribute(FilterAttributeType.Boolean).name,
        userString: getTestFilterAttribute(FilterAttributeType.Boolean).displayName
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        userString: getTestFilterAttribute(FilterAttributeType.Number).displayName
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.String),
        field: getTestFilterAttribute(FilterAttributeType.String).name,
        userString: getTestFilterAttribute(FilterAttributeType.String).displayName
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.StringMap),
        field: getTestFilterAttribute(FilterAttributeType.StringMap).name,
        userString: getTestFilterAttribute(FilterAttributeType.StringMap).displayName
      }
    ]);
  });

  test('correctly autocompletes matching filters with partial user text', () => {
    expect(spectator.service.autocompleteFilters(attributes, 'attr')).toEqual([
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Boolean),
        field: getTestFilterAttribute(FilterAttributeType.Boolean).name,
        userString: getTestFilterAttribute(FilterAttributeType.Boolean).displayName
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        userString: getTestFilterAttribute(FilterAttributeType.Number).displayName
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.String),
        field: getTestFilterAttribute(FilterAttributeType.String).name,
        userString: getTestFilterAttribute(FilterAttributeType.String).displayName
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.StringMap),
        field: getTestFilterAttribute(FilterAttributeType.StringMap).name,
        userString: getTestFilterAttribute(FilterAttributeType.StringMap).displayName
      }
    ]);

    expect(spectator.service.autocompleteFilters(attributes, 'str')).toEqual([
      {
        metadata: getTestFilterAttribute(FilterAttributeType.String),
        field: getTestFilterAttribute(FilterAttributeType.String).name,
        userString: getTestFilterAttribute(FilterAttributeType.String).displayName
      },
      {
        metadata: getTestFilterAttribute(FilterAttributeType.StringMap),
        field: getTestFilterAttribute(FilterAttributeType.StringMap).name,
        userString: getTestFilterAttribute(FilterAttributeType.StringMap).displayName
      }
    ]);

    expect(spectator.service.autocompleteFilters(attributes, 'nu')).toEqual([
      {
        metadata: getTestFilterAttribute(FilterAttributeType.Number),
        field: getTestFilterAttribute(FilterAttributeType.Number).name,
        userString: getTestFilterAttribute(FilterAttributeType.Number).displayName
      }
    ]);
  });

  test('correctly autocompletes operator filters for boolean attribute once space key is entered', () => {
    const attribute = getTestFilterAttribute(FilterAttributeType.Boolean);

    expect(spectator.service.autocompleteFilters(attributes, 'Boolean Attribute ')).toEqual([
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.Equals,
        userString: `${attribute.displayName} ${FilterOperator.Equals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.NotEquals,
        userString: `${attribute.displayName} ${FilterOperator.NotEquals}`
      }
    ]);
  });

  test('correctly autocompletes operator filters for number attribute once space key is entered', () => {
    const attribute = getTestFilterAttribute(FilterAttributeType.Number);

    expect(spectator.service.autocompleteFilters(attributes, 'Number Attribute ')).toEqual([
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.Equals,
        userString: `${attribute.displayName} ${FilterOperator.Equals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.NotEquals,
        userString: `${attribute.displayName} ${FilterOperator.NotEquals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.LessThan,
        userString: `${attribute.displayName} ${FilterOperator.LessThan}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.LessThanOrEqualTo,
        userString: `${attribute.displayName} ${FilterOperator.LessThanOrEqualTo}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.GreaterThan,
        userString: `${attribute.displayName} ${FilterOperator.GreaterThan}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.GreaterThanOrEqualTo,
        userString: `${attribute.displayName} ${FilterOperator.GreaterThanOrEqualTo}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.In,
        userString: `${attribute.displayName} ${FilterOperator.In}`
      }
    ]);
  });

  test('correctly autocompletes operator filters for string attribute once space key is entered', () => {
    const attribute = getTestFilterAttribute(FilterAttributeType.String);

    expect(spectator.service.autocompleteFilters(attributes, 'String Attribute ')).toEqual([
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.Equals,
        userString: `${attribute.displayName} ${FilterOperator.Equals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.NotEquals,
        userString: `${attribute.displayName} ${FilterOperator.NotEquals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.In,
        userString: `${attribute.displayName} ${FilterOperator.In}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.Like,
        userString: `${attribute.displayName} ${FilterOperator.Like}`
      }
    ]);
  });

  test('correctly autocompletes operator filters for string map attribute', () => {
    const attribute = getTestFilterAttribute(FilterAttributeType.StringMap);

    // Contains key or subpath operators if no subpath specified but could be
    expect(spectator.service.autocompleteFilters(attributes, 'String Map Attribute')).toEqual([
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.ContainsKey,
        userString: `${attribute.displayName} ${FilterOperator.ContainsKey}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.Equals,
        userString: `${attribute.displayName}.example ${FilterOperator.Equals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.NotEquals,
        userString: `${attribute.displayName}.example ${FilterOperator.NotEquals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.In,
        userString: `${attribute.displayName}.example ${FilterOperator.In}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.Like,
        userString: `${attribute.displayName}.example ${FilterOperator.Like}`
      }
    ]);

    // Regular operators only once subpath included
    expect(spectator.service.autocompleteFilters(attributes, 'String Map Attribute.testKey')).toEqual([
      expect.objectContaining({
        metadata: attribute,
        field: attribute.name,
        operator: FilterOperator.ContainsKey,
        // This operator isn't actually eligible but filtering operators is done by the chip/combobox, so just make sure the string doesn't match
        userString: expect.not.stringMatching(`${attribute.displayName}.testKey`)
      }),
      {
        metadata: attribute,
        field: attribute.name,
        subpath: 'testKey',
        operator: FilterOperator.Equals,
        userString: `${attribute.displayName}.testKey ${FilterOperator.Equals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        subpath: 'testKey',
        operator: FilterOperator.NotEquals,
        userString: `${attribute.displayName}.testKey ${FilterOperator.NotEquals}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        subpath: 'testKey',
        operator: FilterOperator.In,
        userString: `${attribute.displayName}.testKey ${FilterOperator.In}`
      },
      {
        metadata: attribute,
        field: attribute.name,
        subpath: 'testKey',
        operator: FilterOperator.Like,
        userString: `${attribute.displayName}.testKey ${FilterOperator.Like}`
      }
    ]);
  });
});
