import { Dictionary } from './../../../../../../../../common/src/utilities/types/types';
import { GraphQlSortWithoutDirection } from './../../../../../../../../distributed-tracing/src/shared/graphql/model/schema/sort/graphql-sort-without-direction';
import { DateCoercer } from '@hypertrace/common';
import {
  AttributeMetadataType,
  convertToGraphQlMetricAggregationType,
  GraphQlMetricAggregationType,
  MetricAggregationType
} from '@hypertrace/distributed-tracing';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { INTERVAL_START_QUERY_KEY } from '../../../../model/schema/explore';
import { ExploreSpecification } from '../../../../model/schema/specifications/explore-specification';
import { GraphQlObservabilityArgumentBuilder } from '../../argument/graphql-observability-argument-builder';

export class ExploreSpecificationBuilder {
  private readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public exploreSpecificationForInterval(): ExploreSpecification {
    return {
      resultAlias: () => INTERVAL_START_QUERY_KEY,
      name: INTERVAL_START_QUERY_KEY,
      asGraphQlSelections: () => [],
      extractFromServerData: serverData => ({
        value: this.dateCoercer.coerce(serverData[INTERVAL_START_QUERY_KEY]),
        type: AttributeMetadataType.Timestamp
      }),
      asGraphQlOrderByFragment: () => ({
        key: 'intervalStart'
      })
    };
  }

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
      asGraphQlOrderByFragment: () => {
        const fragment: GraphQlSortWithoutDirection & Dictionary<unknown> = {
          key: key
        };

        if (aggregation !== undefined) {
          fragment.aggregation = this.aggregationAsEnum(aggregation);
        }

        return fragment;
      }
    };
  }

  protected buildResultAlias(key: string, aggregation?: MetricAggregationType): string {
    return aggregation === undefined ? key : `${aggregation}(${key})`;
  }

  protected aggregationAsEnum(aggregation: MetricAggregationType): GraphQlEnumArgument<GraphQlMetricAggregationType> {
    return new GraphQlEnumArgument(convertToGraphQlMetricAggregationType(aggregation));
  }
}
