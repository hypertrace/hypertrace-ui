import { DateCoercer, Dictionary } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { isEmpty } from 'lodash-es';
import { AttributeExpression } from '../../../../model/attribute/attribute-expression';
import { AttributeMetadataType } from '../../../../model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../../model/metrics/metric-aggregation';
import { INTERVAL_START_QUERY_KEY } from '../../../../model/schema/explore';
import {
  convertToGraphQlMetricAggregationType,
  GraphQlMetricAggregationType
} from '../../../../model/schema/metrics/graphql-metric-aggregation-type';
import { GraphQlSortWithoutDirection } from '../../../../model/schema/sort/graphql-sort-without-direction';
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
        expression: { key: 'intervalStart' }
      })
    };
  }

  public exploreSpecificationForKey(key: string, aggregation?: MetricAggregationType): ExploreSpecification {
    return this.exploreSpecificationForAttributeExpression({ key: key }, aggregation);
  }

  public exploreSpecificationForAttributeExpression(
    expression: AttributeExpression,
    aggregation?: MetricAggregationType
  ): ExploreSpecification {
    const expressionString = this.attributeExpressionAsString(expression);
    const queryAlias = aggregation === undefined ? expressionString : `${aggregation}_${expressionString}`;

    return {
      resultAlias: () => this.buildResultAlias(expression, aggregation),
      name: expressionString,
      aggregation: aggregation,
      asGraphQlSelections: () => ({
        path: 'selection',
        alias: queryAlias,
        arguments: [
          this.argBuilder.forAttributeExpression(expression),
          ...this.argBuilder.forAggregation(aggregation),
          ...this.argBuilder.forAggregationArgs(aggregation)
        ],
        children: [{ path: 'value' }, { path: 'type' }]
      }),
      extractFromServerData: serverData => serverData[queryAlias],
      asGraphQlOrderByFragment: () => {
        const fragment: GraphQlSortWithoutDirection & Dictionary<unknown> = {
          expression: expression
        };

        if (aggregation !== undefined) {
          fragment.aggregation = this.aggregationAsEnum(aggregation);
        }

        return fragment;
      }
    };
  }

  protected attributeExpressionAsString(expression: AttributeExpression): string {
    return isEmpty(expression.subpath) ? expression.key : `${expression.key}.${expression.subpath}`;
  }

  protected buildResultAlias(expression: AttributeExpression, aggregation?: MetricAggregationType): string {
    const expressionString = this.attributeExpressionAsString(expression);

    return aggregation === undefined ? expressionString : `${aggregation}(${expressionString})`;
  }

  protected aggregationAsEnum(aggregation: MetricAggregationType): GraphQlEnumArgument<GraphQlMetricAggregationType> {
    return new GraphQlEnumArgument(convertToGraphQlMetricAggregationType(aggregation));
  }
}
