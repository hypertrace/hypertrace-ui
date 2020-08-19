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
export class ApiErrorPercentageDataSourceModel extends GraphQlDataSourceModel<MetricAggregation> {
  public getData(): Observable<MetricAggregation> {
    return this.fetchErrorCountData().pipe(
      map((response: number) => ({
        value: response,
        health: MetricHealth.NotSpecified,
        units: '%'
      }))
    );
  }

  @ModelProperty({
    key: 'context',
    type: STRING_PROPERTY.type
  })
  public context!: string;

  private readonly errorCountSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'errorCount',
    MetricAggregationType.Sum
  );
  private readonly numCallsSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'numCalls',
    MetricAggregationType.Sum
  );

  private fetchErrorCountData(): Observable<number> {
    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>({
      requestType: EXPLORE_GQL_REQUEST,
      context: this.context,
      selections: [this.errorCountSpec, this.numCallsSpec],
      timeRange: this.getTimeRangeOrThrow(),
      limit: 1
    }).pipe(
      map(response => response.results[0]),
      map(result => {
        const errorCount: number = result[this.errorCountSpec.resultAlias()]?.value as number;
        const callCount: number = result[this.numCallsSpec.resultAlias()]?.value as number;

        return getPercentage(errorCount, callCount);
      })
    );
  }
}
