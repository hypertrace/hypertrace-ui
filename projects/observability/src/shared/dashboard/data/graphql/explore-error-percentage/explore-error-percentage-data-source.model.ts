import { getPercentage } from '@hypertrace/common';
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
  type: 'explore-error-percentage-data-source'
})
export class ExploreErrorPercentageDataSourceModel extends GraphQlDataSourceModel<MetricAggregation> {
  @ModelProperty({
    key: 'context',
    type: STRING_PROPERTY.type,
    required: true
  })
  public context!: string;

  @ModelProperty({
    key: 'error-count-metric-key',
    type: STRING_PROPERTY.type,
    required: true
  })
  public errorCountMetricKey!: string;

  @ModelProperty({
    key: 'call-count-metric-key',
    type: STRING_PROPERTY.type,
    required: true
  })
  public callCountMetricKey!: string;

  public getData(): Observable<MetricAggregation> {
    return this.fetchErrorCountData().pipe(
      map((response: number) => ({
        value: response,
        health: MetricHealth.NotSpecified,
        units: '%'
      }))
    );
  }

  private fetchErrorCountData(): Observable<number> {
    const numCallsSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
      this.callCountMetricKey,
      MetricAggregationType.Sum
    );

    const errorCountSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
      this.errorCountMetricKey,
      MetricAggregationType.Sum
    );

    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>({
      requestType: EXPLORE_GQL_REQUEST,
      context: this.context,
      selections: [numCallsSpec, errorCountSpec],
      timeRange: this.getTimeRangeOrThrow(),
      limit: 1
    }).pipe(
      map(response => response.results[0]),
      map(result => {
        const errorCount: number = result[errorCountSpec.resultAlias()]?.value as number;
        const callCount: number = result[numCallsSpec.resultAlias()]?.value as number;

        return getPercentage(errorCount, callCount);
      })
    );
  }
}
