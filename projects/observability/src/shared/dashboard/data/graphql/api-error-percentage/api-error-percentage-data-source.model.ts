import { getPercentage } from '@hypertrace/common';
import {
  GraphQlDataSourceModel,
  MetricAggregation,
  MetricAggregationType,
  MetricHealth
} from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  EXPLORE_GQL_REQUEST,
  ExploreGraphQlQueryHandlerService,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

@Model({
  type: 'api-error-percentage-data-source'
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

  private readonly errorCountSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'errorCount',
    MetricAggregationType.Sum
  );
  private readonly numCallsSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'numCalls',
    MetricAggregationType.Sum
  );

  private fetchErrorCountData(): Observable<number> {
    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>({
      requestType: EXPLORE_GQL_REQUEST,
      context: 'API',
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
