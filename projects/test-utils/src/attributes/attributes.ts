import { FilterAttribute, FilterAttributeType } from '@hypertrace/components';

const filterAttributeMap: Map<FilterAttributeType, FilterAttribute> = new Map([
  [
    FilterAttributeType.Boolean,
    {
      name: 'booleanAttribute',
      displayName: 'Boolean Attribute',
      units: '',
      type: FilterAttributeType.Boolean,
      onlySupportsAggregation: false,
      onlySupportsGrouping: true
    }
  ],
  [
    FilterAttributeType.Number,
    {
      name: 'numberAttribute',
      displayName: 'Number Attribute',
      units: 'mooches',
      type: FilterAttributeType.Number,
      onlySupportsAggregation: true,
      onlySupportsGrouping: false
    }
  ],
  [
    FilterAttributeType.String,
    {
      name: 'stringAttribute',
      displayName: 'String Attribute',
      units: '',
      type: FilterAttributeType.String,
      onlySupportsAggregation: false,
      onlySupportsGrouping: true
    }
  ],
  [
    FilterAttributeType.StringArray,
    {
      name: 'stringArrayAttribute',
      displayName: 'String Array Attribute',
      units: '',
      type: FilterAttributeType.StringArray,
      onlySupportsAggregation: false,
      onlySupportsGrouping: false
    }
  ],
  [
    FilterAttributeType.StringMap,
    {
      name: 'stringMapAttribute',
      displayName: 'String Map Attribute',
      units: '',
      type: FilterAttributeType.StringMap,
      onlySupportsAggregation: false,
      onlySupportsGrouping: false
    }
  ],
  [
    FilterAttributeType.Timestamp,
    {
      name: 'timestampAttribute',
      displayName: 'Timestamp Attribute',
      units: '',
      type: FilterAttributeType.Timestamp,
      onlySupportsAggregation: false,
      onlySupportsGrouping: false
    }
  ]
]);

export const getTestFilterAttribute = (type: FilterAttributeType) => filterAttributeMap.get(type)!;
export const getAllTestFilterAttributes = () => Array.from(filterAttributeMap.values());
