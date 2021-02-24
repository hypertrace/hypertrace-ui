import { TimeDuration } from '@hypertrace/common';
import { GraphQlFilter } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { NEVER, Observable } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';
import {
  ExploreRequestState,
  ExploreVisualizationRequest
} from '../../../../components/explore-query-editor/explore-visualization-builder';
import {
  ExploreGraphQlQueryHandlerService,
  GraphQlExploreRequest
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { CartesianResult } from '../../../widgets/charts/cartesian-widget/cartesian-widget.model';
import { ExploreCartesianDataSourceModel, ExplorerData } from '../explore/explore-cartesian-data-source.model';
@Model({
  type: 'explorer-visualization-cartesian-data-source'
})
export class ExplorerVisualizationCartesianDataSourceModel extends ExploreCartesianDataSourceModel {
  public request?: ExploreVisualizationRequest;

  protected fetchResults(interval: TimeDuration | 'AUTO'): Observable<CartesianResult<ExplorerData>> {
    const requestState = this.buildRequestState(interval);

    if (this.request === undefined || requestState === undefined) {
      return NEVER;
    }

    return this.request.exploreQuery$.pipe(
      switchMap(exploreRequest =>
        this.query<ExploreGraphQlQueryHandlerService>(inheritedFilters =>
          this.appendFilters(exploreRequest, this.getFilters(inheritedFilters))
        ).pipe(mergeMap(response => this.mapResponseData(requestState, response)))
      )
    );
  }

  protected appendFilters(
    request: Omit<GraphQlExploreRequest, 'timeRange'>,
    filters: GraphQlFilter[]
  ): GraphQlExploreRequest {
    return {
      ...request,
      timeRange: this.getTimeRangeOrThrow(),
      filters: [...(request.filters ?? []), ...filters]
    };
  }

  protected buildRequestState(interval: TimeDuration | 'AUTO'): ExploreRequestState | undefined {
    if (this.request?.series.length === 0 || this.request?.context === undefined) {
      return undefined;
    }

    return {
      series: this.request.series,
      context: this.request.context,
      interval: interval,
      groupBy: this.request.groupBy,
      groupByLimit: this.request.groupByLimit
    };
  }
}
