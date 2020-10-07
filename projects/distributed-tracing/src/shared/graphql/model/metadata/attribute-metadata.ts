import { FilterAttributeType } from '@hypertrace/components';
import { MetricAggregationType } from '../metrics/metric-aggregation';

export interface AttributeMetadata {
  name: string;
  displayName: string;
  units: string;
  type: AttributeMetadataType;
  scope: string;
  requiresAggregation: boolean;
  allowedAggregations: MetricAggregationType[];
  groupable: boolean;
}

export const enum AttributeMetadataType {
  // Duplicated for FilterAttributeType in filter-attribute-type.ts
  Boolean = 'BOOLEAN',
  String = 'STRING',
  Number = 'LONG',
  StringArray = 'STRING_ARRAY',
  StringMap = 'STRING_MAP',
  Timestamp = 'TIMESTAMP'
}

export const toFilterAttributeType = (type: AttributeMetadataType): FilterAttributeType => {
  switch (type) {
    case AttributeMetadataType.Boolean:
      return FilterAttributeType.Boolean;
    case AttributeMetadataType.Number:
      return FilterAttributeType.Number;
    case AttributeMetadataType.String:
      return FilterAttributeType.String;
    case AttributeMetadataType.StringArray:
      return FilterAttributeType.StringArray;
    case AttributeMetadataType.StringMap:
      return FilterAttributeType.StringMap;
    case AttributeMetadataType.Timestamp:
      return FilterAttributeType.Timestamp;
    default:
      throw Error(`Unable to convert type '${type}' to FilterAttributeType`);
  }
};
