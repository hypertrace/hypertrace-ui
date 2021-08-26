import {
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  NUMBER_PROPERTY
} from '@hypertrace/hyperdash';
import { AttributeSpecificationModel, GraphQlDataSourceModel, Specification } from '@hypertrace/observability';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DonutSeries, DonutSeriesResults } from '../../../../../components/donut/donut';
import { ObservabilityTraceType } from '../../../../../graphql/model/schema/observability-traces';
import { MetricAggregationSpecification } from '../../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { ExploreSpecificationBuilder } from '../../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { ExploreGraphQlQueryHandlerService } from '../../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../../graphql/request/handlers/explore/explore-query';
import { ExploreResult } from '../../explore/explore-result';
import { MetricAggregationSpecificationModel } from '../../specifiers/metric-aggregation-specification.model';

@Model({
  type: 'trace-donut-data-source'
})
export class TraceDonutDataSourceModel extends GraphQlDataSourceModel<DonutSeriesResults> {
  @ModelProperty({
    key: 'metric',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: MetricAggregationSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public metric!: MetricAggregationSpecification;

  @ModelProperty({
    key: 'groupBy',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: AttributeSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public groupBy!: Specification;

  @ModelProperty({
    key: 'maxResults',
    type: NUMBER_PROPERTY.type
  })
  public maxResults: number = 5;

  public getData(): Observable<DonutSeriesResults> {
    return this.query<ExploreGraphQlQueryHandlerService>(filters => ({
      requestType: EXPLORE_GQL_REQUEST,
      selections: [
        new ExploreSpecificationBuilder().exploreSpecificationForKey(this.metric.name, this.metric.aggregation)
      ],
      context: ObservabilityTraceType.Api,
      limit: this.maxResults,
      timeRange: this.getTimeRangeOrThrow(),
      filters: filters,
      groupBy: {
        keys: [this.groupBy.name],
        limit: this.maxResults
      }
    })).pipe(map(exploreResponse => this.buildDonutResults(exploreResponse, this.metric)));
  }

  private buildDonutResults(
    exploreResponse: GraphQlExploreResponse,
    metric: MetricAggregationSpecification
  ): DonutSeriesResults {
    let total = 0;

    const series: DonutSeries[] = new ExploreResult(exploreResponse)
      .getGroupedSeriesData([this.groupBy.name], metric.name, metric.aggregation)
      .map(seriesTuple => {
        total = total + seriesTuple.value;

        return {
          name: seriesTuple.keys.join(', '),
          value: seriesTuple.value
        };
      });

    return {
      series: series,
      total: total
    };
  }
}
