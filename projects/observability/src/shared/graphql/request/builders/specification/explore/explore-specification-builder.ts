import {
  convertToGraphQlMetricAggregationType,
  GraphQlMetricAggregationType,
  MetricAggregationType
} from '@hypertrace/distributed-tracing';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { ExploreSpecification } from '../../../../model/schema/specifications/explore-specification';
import { GraphQlObservabilityArgumentBuilder } from '../../argument/graphql-observability-argument-builder';

export class ExploreSpecificationBuilder {
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();

  public exploreSpecificationForKey(key: string, aggregation?: MetricAggregationType): ExploreSpecification {
    const queryAlias = aggregation === undefined ? key : `${aggregation}_${key}`;

    return {
      resultAlias: () => this.buildResultAlias(key, aggregation),
      name: key,
      aggregation: aggregation,
      asGraphQlSelections: () => ({
        path: 'selection',
        alias: queryAlias,
        arguments: [
          this.argBuilder.forAttributeKey(key),
          ...this.argBuilder.forAggregation(aggregation),
          ...this.argBuilder.forAggregationArgs(aggregation)
        ],
        children: [{ path: 'value' }, { path: 'type' }]
      }),
      extractFromServerData: serverData => serverData[queryAlias],
      asGraphQlOrderByFragment: () => ({
        key: key,
        aggregation: aggregation === undefined ? undefined : this.aggregationAsEnum(aggregation)
      })
    };
  }

  protected buildResultAlias(key: string, aggregation?: MetricAggregationType): string {
    return aggregation === undefined ? key : `${aggregation}(${key})`;
  }

  protected aggregationAsEnum(aggregation: MetricAggregationType): GraphQlEnumArgument<GraphQlMetricAggregationType> {
    return new GraphQlEnumArgument(convertToGraphQlMetricAggregationType(aggregation));
  }
}
