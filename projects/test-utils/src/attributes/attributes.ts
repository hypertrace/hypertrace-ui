import { FilterAttribute, FilterAttributeType } from '@hypertrace/components';

const filterAttributeMap: Map<FilterAttributeType, FilterAttribute> = new Map([
  [
    FilterAttributeType.Boolean,
    {
      name: 'booleanAttribute',
      displayName: 'Boolean Attribute',
      units: '',
      type: FilterAttributeType.Boolean
    }
  ],
  [
    FilterAttributeType.Number,
    {
      name: 'numberAttribute',
      displayName: 'Number Attribute',
      units: 'mooches',
      type: FilterAttributeType.Number
    }
  ],
  [
    FilterAttributeType.String,
    {
      name: 'stringAttribute',
      displayName: 'String Attribute',
      units: '',
      type: FilterAttributeType.String
    }
  ],
  [
    FilterAttributeType.StringMap,
    {
      name: 'stringMapAttribute',
      displayName: 'String Map Attribute',
      units: '',
      type: FilterAttributeType.StringMap
    }
  ],
  [
    FilterAttributeType.Timestamp,
    {
      name: 'timestampAttribute',
      displayName: 'Timestamp Attribute',
      units: '',
      type: FilterAttributeType.Timestamp
    }
  ]
]);

export const getTestFilterAttribute = (type: FilterAttributeType) => filterAttributeMap.get(type)!;
