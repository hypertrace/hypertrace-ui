import { FilterAttribute, FilterAttributeType } from '@hypertrace/components';
import { getTestFilterAttribute } from '@hypertrace/test-utils';
import { ParsedFilter } from '../parsed-filter';
import { ContainsFilterParser } from './contains-filter-parser';

describe('Filter Parser', () => {
  test('correctly parses CONTAINS_KEY with dot', () => {
    const attribute: FilterAttribute = getTestFilterAttribute(FilterAttributeType.StringMap);
    const filterString: string = 'String Map Attribute CONTAINS_KEY http.url';

    const containsFilterParser: ContainsFilterParser = new ContainsFilterParser();
    const parsedFilter: ParsedFilter<unknown> | undefined = containsFilterParser.parseFilterString(
      attribute,
      filterString
    );

    expect(parsedFilter).toEqual({
      field: 'stringMapAttribute',
      operator: 'CONTAINS_KEY',
      value: ['http.url']
    });
  });

  test('correctly parses CONTAINS_KEY with colon', () => {
    const attribute: FilterAttribute = getTestFilterAttribute(FilterAttributeType.StringMap);
    const filterString: string = 'String Map Attribute CONTAINS_KEY http:url';

    const containsFilterParser: ContainsFilterParser = new ContainsFilterParser();
    const parsedFilter: ParsedFilter<unknown> | undefined = containsFilterParser.parseFilterString(
      attribute,
      filterString
    );

    expect(parsedFilter).toEqual({
      field: 'stringMapAttribute',
      operator: 'CONTAINS_KEY',
      value: ['http:url']
    });
  });

  test('correctly parses CONTAINS_KEY_VALUE for tag with dot and URL', () => {
    const attribute: FilterAttribute = getTestFilterAttribute(FilterAttributeType.StringMap);
    const filterString: string =
      'String Map Attribute.http.url CONTAINS_KEY_VALUE http://dataservice:9394/userreview?productId=f2620500-8b55-4fab-b7a2-fe8af6f5ae24';

    const containsFilterParser: ContainsFilterParser = new ContainsFilterParser();
    const parsedFilter: ParsedFilter<unknown> | undefined = containsFilterParser.parseFilterString(
      attribute,
      filterString
    );

    expect(parsedFilter).toEqual({
      field: 'stringMapAttribute',
      operator: 'CONTAINS_KEY_VALUE',
      value: ['http.url', 'http://dataservice:9394/userreview?productId=f2620500-8b55-4fab-b7a2-fe8af6f5ae24']
    });
  });

  test('correctly parses CONTAINS_KEY_VALUE for tag with colon and URL', () => {
    const attribute: FilterAttribute = getTestFilterAttribute(FilterAttributeType.StringMap);
    const filterString: string =
      'String Map Attribute.http:url CONTAINS_KEY_VALUE http://dataservice:9394/userreview?productId=f2620500-8b55-4fab-b7a2-fe8af6f5ae24';

    const containsFilterParser: ContainsFilterParser = new ContainsFilterParser();
    const parsedFilter: ParsedFilter<unknown> | undefined = containsFilterParser.parseFilterString(
      attribute,
      filterString
    );

    expect(parsedFilter).toEqual({
      field: 'stringMapAttribute',
      operator: 'CONTAINS_KEY_VALUE',
      value: ['http:url', 'http://dataservice:9394/userreview?productId=f2620500-8b55-4fab-b7a2-fe8af6f5ae24']
    });
  });

  test('correctly parses CONTAINS_KEY_VALUE for tag with colon and empty string', () => {
    const attribute: FilterAttribute = getTestFilterAttribute(FilterAttributeType.StringMap);
    const filterString: string = 'String Map Attribute.http:url CONTAINS_KEY_VALUE ""';
    const containsFilterParser: ContainsFilterParser = new ContainsFilterParser();
    const parsedFilter: ParsedFilter<unknown> | undefined = containsFilterParser.parseFilterString(
      attribute,
      filterString
    );

    expect(parsedFilter).toEqual({
      field: 'stringMapAttribute',
      operator: 'CONTAINS_KEY_VALUE',
      value: ['http:url', '""']
    });
  });
});
