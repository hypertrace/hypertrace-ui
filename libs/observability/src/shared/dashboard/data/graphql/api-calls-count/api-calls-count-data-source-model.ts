import { Model } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetricAggregation, MetricAggregationType } from '../../../../graphql/model/metrics/metric-aggregation';
import { MetricHealth } from '../../../../graphql/model/metrics/metric-health';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import { ExploreGraphQlQueryHandlerService } from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-query';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';

@Model({
  type: 'api-calls-count-data-source'
})
export class ApiCallsCountDataSourceModel extends GraphQlDataSourceModel<MetricAggregation> {
  public getData(): Observable<MetricAggregation> {
    return this.fetchCallCount().pipe(
      map(data => ({
        value: data,
        health: MetricHealth.NotSpecified,
        units: ''
      }))
    );
  }

  private readonly numCallsSpec: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'numCalls',
    MetricAggregationType.Sum
  );

  private fetchCallCount(): Observable<number> {
    return this.query<ExploreGraphQlQueryHandlerService, GraphQlExploreResponse>({
      requestType: EXPLORE_GQL_REQUEST,
      context: 'API',
      limit: 1,
      selections: [this.numCallsSpec],
      timeRange: this.getTimeRangeOrThrow()
    }).pipe(
      map(response => response.results[0]),
      map(result => result[this.numCallsSpec.resultAlias()]?.value as number)
    );
  }
}
