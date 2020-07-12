import { GraphQlDataSourceModel } from '@hypertrace/distributed-tracing';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import {
  EXPLORE_GQL_REQUEST,
  ExploreGraphQlQueryHandlerService,
  GraphQlExploreRequest,
  GraphQlExploreResult
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { TimeDuration } from '@hypertrace/common';

export abstract class TraceSeriesValuesDataSourceModel<TData> extends GraphQlDataSourceModel<TData> {
  protected abstract specification: ExploreSpecification;

  protected fetchSpecificationData(interval: TimeDuration): Observable<GraphQlExploreResult[]> {
    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService>(() => this.buildRequest(interval)).pipe(
      map(response => response.results)
    );
  }

  private buildRequest(interval: TimeDuration): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: this.getTimeRangeOrThrow(),
      context: ObservabilityTraceType.Api,
      interval: interval,
      limit: 10000,
      selections: [this.specification]
    };
  }
}
