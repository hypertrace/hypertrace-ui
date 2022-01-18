import { TimeDuration } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreGraphQlQueryHandlerService } from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResult
} from '../../../../graphql/request/handlers/explore/explore-query';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
import { GraphQlFilter } from './../../../../graphql/model/schema/filter/graphql-filter';

export abstract class TraceSeriesValuesDataSourceModel<TData> extends GraphQlDataSourceModel<TData> {
  protected abstract specification: ExploreSpecification;

  protected fetchSpecificationData(interval: TimeDuration): Observable<GraphQlExploreResult[]> {
    return this.query<ExploreGraphQlQueryHandlerService>(inheritedFilters =>
      this.buildRequest(interval, inheritedFilters)
    ).pipe(map(response => response.results));
  }

  private buildRequest(interval: TimeDuration, inheritedFilters: GraphQlFilter[] = []): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: this.getTimeRangeOrThrow(),
      context: ObservabilityTraceType.Api,
      interval: interval,
      filters: [...inheritedFilters],
      limit: 10000,
      selections: [this.specification]
    };
  }
}
