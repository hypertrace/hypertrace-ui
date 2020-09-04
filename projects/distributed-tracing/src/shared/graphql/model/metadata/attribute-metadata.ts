import { FilterType } from '@hypertrace/components';
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
  // Duplicated for FilterType in filter-type.ts
  Boolean = 'BOOLEAN',
  String = 'STRING',
  Number = 'LONG',
  StringMap = 'STRING_MAP',
  Timestamp = 'TIMESTAMP'
}

export const toFilterType = (type: AttributeMetadataType): FilterType => {
  switch (type) {
    case 'BOOLEAN':
      return FilterType.Boolean;
    case 'STRING':
      return FilterType.String;
    case 'LONG':
      return FilterType.Number;
    case 'STRING_MAP':
      return FilterType.StringMap;
    case 'TIMESTAMP':
      return FilterType.Timestamp;
    default:
      throw Error(`Unable to convert type '${type}' to FilterType`);
  }
};
