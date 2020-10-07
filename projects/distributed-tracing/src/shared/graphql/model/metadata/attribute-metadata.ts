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
  StringMap = 'STRING_MAP',
  Timestamp = 'TIMESTAMP'
}

export const toFilterType = (type: AttributeMetadataType): FilterAttributeType => {
  switch (type) {
    case 'BOOLEAN':
      return FilterAttributeType.Boolean;
    case 'STRING':
      return FilterAttributeType.String;
    case 'LONG':
      return FilterAttributeType.Number;
    case 'STRING_MAP':
      return FilterAttributeType.StringMap;
    case 'TIMESTAMP':
      return FilterAttributeType.Timestamp;
    default:
      throw Error(`Unable to convert type '${type}' to FilterType`);
  }
};
