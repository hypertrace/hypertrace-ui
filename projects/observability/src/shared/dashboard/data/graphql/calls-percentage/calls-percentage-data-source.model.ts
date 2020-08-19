import { forkJoinSafeEmpty, getPercentage } from '@hypertrace/common';
import {
  GraphQlDataSourceModel,
  MetricAggregation,
  MetricAggregationType,
  MetricHealth
} from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

@Model({
  type: 'calls-percentage-data-source'
})
export class CallsPercentageDataSourceModel extends GraphQlDataSourceModel<MetricAggregation> {
  @ModelProperty({
    key: 'context',
    type: STRING_PROPERTY.type,
    required: true
  })
  public context!: string;

  @ModelProperty({
    key: 'call-count-metric-key',
    type: STRING_PROPERTY.type,
    required: true
  })
  public callCountMetricKey!: string;

  public getData(): Observable<MetricAggregation> {
    return forkJoinSafeEmpty([this.fetchCallCountWithFilters(), this.fetchTotalCallsData()]).pipe(
      map(results => ({
        value: getPercentage(results[0], results[1]),
        health: MetricHealth.NotSpecified,
        units: '%'
      }))
    );
  }

  private fetchCallCountWithFilters(): Observable<number> {
    const callCountSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
      this.callCountMetricKey,
      MetricAggregationType.Count
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>({
      requestType: EXPLORE_GQL_REQUEST,
      context: this.context,
      selections: [callCountSpec],
      timeRange: this.getTimeRangeOrThrow(),
      filters: this.filters,
      limit: 1
    }).pipe(
      map(response => response.results[0]),
      map(result => result[callCountSpec.resultAlias()]?.value as number)
    );
  }

  private fetchTotalCallsData(): Observable<number> {
    const totalCallsSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
      this.callCountMetricKey,
      MetricAggregationType.Sum
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>({
      requestType: EXPLORE_GQL_REQUEST,
      context: this.context,
      selections: [totalCallsSpec],
      timeRange: this.getTimeRangeOrThrow(),
      limit: 1
    }).pipe(
      map(response => response.results[0]),
      map(result => result[totalCallsSpec.resultAlias()]?.value as number)
    );
  }
}
