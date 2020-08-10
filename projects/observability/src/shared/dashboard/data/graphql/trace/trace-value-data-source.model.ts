import { GraphQlDataSourceModel } from '@hypertrace/distributed-tracing';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResultValue
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

export abstract class TraceValueDataSourceModel<TData> extends GraphQlDataSourceModel<TData> {
  protected abstract specification: ExploreSpecification;

  protected fetchSpecificationData(): Observable<GraphQlExploreResultValue> {
    return this.queryIsolated<ExploreGraphQlQueryHandlerService>(() => this.buildRequest()).pipe(
      map(response => response.results[0]),
      map(result => result[this.specification.resultAlias()])
    );
  }

  private buildRequest(): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: this.getTimeRangeOrThrow(),
      context: ObservabilityTraceType.Api,
      limit: 1,
      selections: [this.specification]
    };
  }
}
