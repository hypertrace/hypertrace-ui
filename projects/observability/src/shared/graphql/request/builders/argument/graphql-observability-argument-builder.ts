import { TimeDuration } from '@hypertrace/common';
import { GraphQlArgument, GraphQlEnumArgument } from '@hypertrace/graphql-client';
import {
  convertToGraphQlMetricAggregationType,
  GraphQlArgumentBuilder,
  GraphQlSortBySpecification,
  MetricAggregationType,
  TraceType
} from '@hypertrace/observability';
import { EntityType } from '../../../model/schema/entity';
import { GraphQlGroupBy } from '../../../model/schema/groupby/graphql-group-by';
import { GraphQlIntervalUnit } from '../../../model/schema/interval/graphql-interval-unit';
import { convertToGraphQlIntervalUnit } from '../specification/metric/metric-interval-unit-converter';

export class GraphQlObservabilityArgumentBuilder extends GraphQlArgumentBuilder {
  public forIncludeInactive(includeInactive?: boolean): GraphQlArgument[] {
    return includeInactive !== undefined ? [{ name: 'includeInactive', value: includeInactive }] : [];
  }
  public forNeighborType(type: EntityType): GraphQlArgument {
    return {
      name: 'neighborType',
      value: new GraphQlEnumArgument(type)
    };
  }

  public forAggregationArgs(aggregation?: MetricAggregationType): GraphQlArgument[] {
    switch (aggregation) {
      case MetricAggregationType.AvgrateMinute:
        return [
          { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) },
          { name: 'size', value: 1 }
        ];
      case MetricAggregationType.AvgrateSecond:
        return [
          { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Seconds) },
          { name: 'size', value: 1 }
        ];
      case MetricAggregationType.P99:
        return [
          {
            name: 'size',
            value: 99
          }
        ];
      case MetricAggregationType.P95:
        return [
          {
            name: 'size',
            value: 95
          }
        ];
      case MetricAggregationType.P90:
        return [
          {
            name: 'size',
            value: 90
          }
        ];
      case MetricAggregationType.P50:
        return [
          {
            name: 'size',
            value: 50
          }
        ];
      default:
        return [];
    }
  }

  public forInterval(interval?: TimeDuration): GraphQlArgument[] {
    return interval === undefined
      ? []
      : [
          {
            name: 'interval',
            value: {
              size: interval.value,
              units: new GraphQlEnumArgument(convertToGraphQlIntervalUnit(interval.unit))
            }
          }
        ];
  }

  public forIntervalArgs(interval?: TimeDuration): GraphQlArgument[] {
    return interval === undefined
      ? []
      : [
          {
            name: 'size',
            value: interval.value
          },
          {
            name: 'units',
            value: new GraphQlEnumArgument(convertToGraphQlIntervalUnit(interval.unit))
          }
        ];
  }

  public forAggregation(aggregation?: MetricAggregationType): GraphQlArgument[] {
    return aggregation === undefined
      ? []
      : [{ name: 'aggregation', value: new GraphQlEnumArgument(convertToGraphQlMetricAggregationType(aggregation)) }];
  }

  public forOrderBy(orderBy?: GraphQlSortBySpecification): GraphQlArgument[] {
    return this.forOrderBys(orderBy && [orderBy]);
  }

  public forOrderBys(orderBys: GraphQlSortBySpecification[] = []): GraphQlArgument[] {
    if (orderBys.length === 0) {
      return [];
    }

    return [
      {
        name: 'orderBy',
        value: orderBys.map(orderBy => ({
          ...orderBy.key.asGraphQlOrderByFragment(),
          direction: new GraphQlEnumArgument(orderBy.direction)
        }))
      }
    ];
  }

  public forGroupBy(groupBy?: GraphQlGroupBy): GraphQlArgument[] {
    if (!groupBy) {
      return [];
    }

    return [
      {
        name: 'groupBy',
        value:
          // Remove includeRest key if undefined
          groupBy.includeRest === undefined
            ? {
                keys: groupBy.keys,
                groupLimit: groupBy.limit
              }
            : {
                keys: groupBy.keys,
                groupLimit: groupBy.limit,
                includeRest: groupBy.includeRest
              }
      }
    ];
  }

  public forTraceType(type: TraceType): GraphQlArgument {
    return {
      name: 'type',
      value: new GraphQlEnumArgument(type)
    };
  }
}
