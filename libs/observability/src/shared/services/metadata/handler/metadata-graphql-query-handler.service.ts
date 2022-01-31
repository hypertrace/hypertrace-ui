import { Injectable } from '@angular/core';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { AttributeMetadata, AttributeMetadataType } from '../../../graphql/model/metadata/attribute-metadata';
import {
  convertFromGraphQlMetricAggregationType,
  GraphQlMetricAggregationType
} from '../../../graphql/model/schema/metrics/graphql-metric-aggregation-type';

@Injectable({ providedIn: 'root' })
export class MetadataGraphQlQueryHandlerService
  implements GraphQlQueryHandler<GraphQlMetadataRequest, AttributeMetadata[]>
{
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  public matchesRequest(request: unknown): request is GraphQlMetadataRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlMetadataRequest>).requestType === METADATA_GQL_REQUEST
    );
  }

  public convertRequest(): GraphQlSelection {
    return {
      path: 'metadata',
      children: [
        { path: 'name' },
        { path: 'displayName' },
        { path: 'type' },
        { path: 'scope' },
        { path: 'units' },
        { path: 'onlySupportsAggregation' },
        { path: 'onlySupportsGrouping' },
        { path: 'supportedAggregations' },
        { path: 'groupable' }
      ]
    };
  }

  public convertResponse(results: AttributeMetadataServerResult[]): AttributeMetadata[] {
    return results.map(result => ({
      name: result.name,
      displayName: result.displayName,
      type: result.type,
      scope: result.scope,
      units: result.units,
      onlySupportsAggregation: result.onlySupportsAggregation,
      onlySupportsGrouping: result.onlySupportsGrouping,
      allowedAggregations: result.supportedAggregations.flatMap(convertFromGraphQlMetricAggregationType),
      groupable: result.groupable
    }));
  }
}

export const METADATA_GQL_REQUEST = Symbol('GraphQL Metadata Request');

export interface GraphQlMetadataRequest {
  requestType: typeof METADATA_GQL_REQUEST;
}

interface AttributeMetadataServerResult {
  name: string;
  displayName: string;
  type: AttributeMetadataType;
  scope: string;
  units: string;
  onlySupportsAggregation: boolean;
  onlySupportsGrouping: boolean;
  supportedAggregations: GraphQlMetricAggregationType[];
  groupable: boolean;
}
