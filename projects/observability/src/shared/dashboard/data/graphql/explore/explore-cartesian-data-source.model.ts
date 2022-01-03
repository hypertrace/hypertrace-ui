import { ColorService, forkJoinSafeEmpty, RequireBy, TimeDuration } from '@hypertrace/common';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { isEmpty } from 'lodash-es';
import { AttributeExpression } from 'projects/observability/src/shared/graphql/model/attribute/attribute-expression';
import { NEVER, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Series } from '../../../../components/cartesian/chart';
import { ExploreRequestState } from '../../../../components/explore-query-editor/explore-visualization-builder';
import { MetricTimeseriesInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { GraphQlFilter } from '../../../../graphql/model/schema/filter/graphql-filter';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { GraphQlTimeRange } from '../../../../graphql/model/schema/timerange/graphql-time-range';
import { ExploreGraphQlQueryHandlerService } from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-query';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { CartesianDataFetcher, CartesianResult } from '../../../widgets/charts/cartesian-widget/cartesian-widget.model';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
import { ExploreResult } from './explore-result';

export abstract class ExploreCartesianDataSourceModel extends GraphQlDataSourceModel<
  CartesianDataFetcher<ExplorerData>
> {
  @ModelInject(ColorService)
  private readonly colorService!: ColorService;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  protected abstract buildRequestState(interval: TimeDuration | 'AUTO'): ExploreRequestState | undefined;

  public getData(): Observable<CartesianDataFetcher<ExplorerData>> {
    return of({
      getData: (interval: TimeDuration) => this.fetchResults(interval)
    });
  }

  protected fetchResults(interval: TimeDuration | 'AUTO'): Observable<CartesianResult<ExplorerData>> {
    const requestState = this.buildRequestState(interval);
    const timeRange = this.getTimeRangeOrThrow();
    if (requestState === undefined) {
      return NEVER;
    }

    return this.query<ExploreGraphQlQueryHandlerService>(inheritedFilters =>
      this.buildExploreRequest(requestState, this.getFilters(inheritedFilters), timeRange)
    ).pipe(
      mergeMap(response =>
        this.mapResponseData(requestState, response, requestState.interval as TimeDuration, timeRange)
      )
    );
  }

  protected mapResponseData(
    requestState: ExploreRequestState,
    response: GraphQlExploreResponse,
    interval: TimeDuration,
    timeRange: GraphQlTimeRange
  ): Observable<CartesianResult<ExplorerData>> {
    return this.getAllData(requestState, response, interval, timeRange).pipe(
      map(explorerResults => ({
        series: explorerResults,
        bands: []
      }))
    );
  }

  protected buildExploreRequest(
    requestState: ExploreRequestState,
    filters: GraphQlFilter[],
    timeRange: GraphQlTimeRange
  ): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      selections: requestState.series.map(series => series.specification),
      context: requestState.context,
      limit: requestState.resultLimit,
      timeRange: timeRange,
      interval: requestState.interval as TimeDuration,
      filters: filters,
      groupBy: requestState.groupBy
    };
  }

  private getAllData(
    request: ExploreRequestState,
    response: GraphQlExploreResponse,
    interval?: TimeDuration,
    timeRange?: GraphQlTimeRange
  ): Observable<ExplorerSeries[]> {
    return this.buildAllSeries(request, new ExploreResult(response, interval, timeRange));
  }

  protected buildAllSeries(request: ExploreRequestState, result: ExploreResult): Observable<ExplorerSeries[]> {
    const seriesData = this.gatherSeriesData(request, result);
    const colors = this.colorService.getColorPalette().forNColors(seriesData.length);

    return forkJoinSafeEmpty(seriesData.map((data, index) => this.buildSeries(request, data, colors[index])));
  }

  private gatherSeriesData(request: ExploreRequestState, result: ExploreResult): SeriesData[] {
    const aggregatableSpecs = request.series
      .map(series => series.specification)
      .filter(
        (selection): selection is RequireBy<ExploreSpecification, 'aggregation'> => selection.aggregation !== undefined
      );

    const groupByExpressions = request.groupBy?.keyExpressions ?? [];
    const isGroupBy = groupByExpressions.length > 0;

    if (!isGroupBy && request.interval) {
      return aggregatableSpecs.map(spec => this.buildTimeseriesData(spec, result));
    }

    if (isGroupBy && !request.interval) {
      return aggregatableSpecs.map(spec => this.buildGroupedSeriesData(spec, groupByExpressions, result));
    }

    if (isGroupBy && request.interval) {
      return aggregatableSpecs.map(spec => this.buildGroupedTimeseriesData(spec, groupByExpressions, result)).flat();
    }

    return [];
  }

  private buildSeries(request: ExploreRequestState, result: SeriesData, color: string): Observable<ExplorerSeries> {
    return forkJoinSafeEmpty({
      specDisplayName: this.metadataService.getSpecificationDisplayName(request.context, result.spec),
      attribute: this.metadataService.getAttribute(request.context, result.spec.name)
    }).pipe(
      map(obj => ({
        data: result.data,
        units: obj.attribute.units !== '' ? obj.attribute.units : undefined,
        type: request.series.find(series => series.specification === result.spec)!.visualizationOptions.type,
        name: !isEmpty(result.groupName) ? result.groupName! : obj.specDisplayName,
        groupName:
          !isEmpty(result.groupName) && (request.useGroupName ?? false) ? result.groupName! : obj.specDisplayName,
        color: color
      }))
    );
  }

  public buildTimeseriesData(spec: AggregatableSpec, result: ExploreResult): SeriesData {
    return {
      data: result.getTimeSeriesData(spec.name, spec.aggregation),
      spec: spec
    };
  }

  public buildGroupedSeriesData(
    spec: AggregatableSpec,
    groupByExpressions: AttributeExpression[],
    result: ExploreResult
  ): SeriesData {
    return {
      data: result
        .getGroupedSeriesData(groupByExpressions, spec.name, spec.aggregation)
        .map(({ keys, value }) => [this.buildGroupedSeriesName(keys), value]),
      spec: spec
    };
  }

  public buildGroupedTimeseriesData(
    spec: AggregatableSpec,
    groupByExpressions: AttributeExpression[],
    result: ExploreResult
  ): SeriesData[] {
    return Array.from(result.getGroupedTimeSeriesData(groupByExpressions, spec.name, spec.aggregation).entries()).map(
      ([groupNames, data]) => ({
        data: data,
        groupName: this.buildGroupedSeriesName(groupNames),
        spec: spec
      })
    );
  }

  private buildGroupedSeriesName(groupKeys: string[]): string {
    return groupKeys.join(', ');
  }
}

export type ExplorerData = MetricTimeseriesInterval | [string, number];
type ExplorerSeries = Series<ExplorerData>;
interface SeriesData {
  data: ExplorerData[];
  spec: AggregatableSpec;
  groupName?: string;
}
type AggregatableSpec = RequireBy<ExploreSpecification, 'aggregation'>;
