import { FilterAttribute } from '../filter-attribute';
import { FilterAttributeType } from '../filter-attribute-type';
import { tryParseStringForAttribute } from './parsed-filter';

describe('Filter Parsing utilities', () => {
  const testStatusAttribute: FilterAttribute = {
    name: 'status',
    displayName: 'Status',
    type: FilterAttributeType.String
  };

  const testStatusCodeAttribute: FilterAttribute = {
    name: 'statusCode',
    displayName: 'Status Code',
    type: FilterAttributeType.String
  };

  test('should match if full name match', () => {
    expect(tryParseStringForAttribute(testStatusAttribute, 'status', ['name'])).toEqual({
      attribute: testStatusAttribute
    });

    expect(tryParseStringForAttribute(testStatusAttribute, 'status ', ['name'])).toEqual({
      attribute: testStatusAttribute
    });

    expect(tryParseStringForAttribute(testStatusCodeAttribute, 'statusCode', ['name'])).toEqual({
      attribute: testStatusCodeAttribute
    });
  });

  test('should match if followed by beginning of operator', () => {
    expect(tryParseStringForAttribute(testStatusAttribute, 'status !', ['name'])).toEqual({
      attribute: testStatusAttribute
    });
  });

  test('should not match if partial name match', () => {
    expect(tryParseStringForAttribute(testStatusCodeAttribute, 'status', ['name'])).toBe(undefined);
  });

  test('should not match if text starts with attribute name and continues', () => {
    expect(tryParseStringForAttribute(testStatusAttribute, 'statusCode', ['name'])).toBe(undefined);
  });
});
