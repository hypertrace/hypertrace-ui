import { GraphQlFilter } from '../../../../../../../distributed-tracing/src/shared/graphql/model/schema/filter/graphql-filter';
import { ColorService, forkJoinSafeEmpty, RequireBy, TimeDuration } from '@hypertrace/common';
import { GraphQlDataSourceModel, GraphQlSortBySpecification, MetadataService } from '@hypertrace/distributed-tracing';
import {
  ARRAY_PROPERTY,
  BOOLEAN_PROPERTY,
  Model,
  ModelProperty,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { isEmpty } from 'lodash-es';
import { Observable, of, NEVER } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Series } from '../../../../components/cartesian/chart';
import {
  ExploreRequestState,
  ExploreSeries
} from '../../../../components/explore-query-editor/explore-visualization-builder';
import { MetricTimeseriesInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST,
  GraphQlExploreRequest,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { CartesianDataFetcher } from '../../../widgets/charts/cartesian-widget/cartesian-widget.model';
import { ExploreResult } from './explore-result';
@Model({
  type: 'explore-cartesian-data-source'
})
export class ExploreCartesianDataSourceModel extends GraphQlDataSourceModel<CartesianDataFetcher<ExplorerData>> {
  @ModelProperty({
    key: 'context',
    displayName: 'Context',
    type: STRING_PROPERTY.type
  })
  public context?: string;

  @ModelProperty({
    key: 'metric-explore-series',
    displayName: 'Metric explore series',
    type: ARRAY_PROPERTY.type,
    required: true
  })
  public metricExploreSeries: ExploreSeries[] = [];

  @ModelProperty({
    key: 'group-by',
    displayName: 'Group By',
    required: false,
    type: STRING_PROPERTY.type
  })
  public groupBy: string[] = [];

  @ModelProperty({
    key: 'groupByLimit',
    displayName: 'Group by limit',
    type: NUMBER_PROPERTY.type
  })
  public groupByLimit: number = 100;

  @ModelProperty({
    key: 'group-by-include-rest',
    displayName: 'Group By',
    required: false,
    type: BOOLEAN_PROPERTY.type
  })
  public groupByIncludeRest: boolean = true;

  @ModelProperty({
    key: 'order-by',
    displayName: 'Order By',
    required: false,
    type: ARRAY_PROPERTY.type
  })
  public orderBy: GraphQlSortBySpecification[] = [];

  @ModelInject(ColorService)
  private readonly colorService!: ColorService;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  public getData(): Observable<CartesianDataFetcher<ExplorerData>> {
    return of({
      getData: (interval: TimeDuration) => {
        const requestState = this.buildRequestState(interval);

        if (requestState === undefined) {
          return NEVER;
        }

        return this.query<ExploreGraphQlQueryHandlerService>(inheritedFilters =>
          this.buildExploreRequest(requestState, this.getFilters(inheritedFilters))
        ).pipe(
          mergeMap(response =>
            this.getAllData(requestState, response).pipe(
              map(explorerResults => ({
                series: explorerResults,
                bands: []
              }))
            )
          )
        );
      }
    });
  }

  protected buildExploreRequest(requestState: ExploreRequestState, filters: GraphQlFilter[]): GraphQlExploreRequest {
    return {
      requestType: EXPLORE_GQL_REQUEST,
      selections: requestState.series.map(series => series.specification),
      context: requestState.context,
      limit: requestState.groupByLimit ?? 100,
      timeRange: this.getTimeRangeOrThrow(),
      interval: requestState.interval as TimeDuration,
      filters: filters,
      groupBy: requestState.groupBy
    };
  }

  protected buildRequestState(interval: TimeDuration | 'AUTO' = 'AUTO'): ExploreRequestState | undefined {
    if (this.metricExploreSeries.length === 0 || this.context === undefined) {
      return undefined;
    }

    return {
      series: this.metricExploreSeries,
      context: this.context,
      interval: interval,
      groupBy:
        this.groupBy?.length > 0
          ? {
              keys: this.groupBy,
              includeRest: this.groupByIncludeRest
            }
          : undefined,
      groupByLimit: this.groupByLimit,
      useGroupName: true
    };
  }

  private getAllData(request: ExploreRequestState, response: GraphQlExploreResponse): Observable<ExplorerSeries[]> {
    return this.buildAllSeries(request, new ExploreResult(response));
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

    const groupByKeys = request.groupBy?.keys ?? [];
    const isGroupBy = groupByKeys.length > 0;

    if (!isGroupBy && request.interval) {
      return aggregatableSpecs.map(spec => this.buildTimeseriesData(spec, result));
    }

    if (isGroupBy && !request.interval) {
      return aggregatableSpecs.map(spec => this.buildGroupedSeriesData(spec, groupByKeys, result));
    }

    if (isGroupBy && request.interval) {
      return aggregatableSpecs.map(spec => this.buildGroupedTimeseriesData(spec, groupByKeys, result)).flat();
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
        name: isEmpty(result.groupName)
          ? obj.specDisplayName
          : request.useGroupName
          ? result.groupName!
          : `${obj.specDisplayName}: ${result.groupName}`,
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

  public buildGroupedSeriesData(spec: AggregatableSpec, groupByKeys: string[], result: ExploreResult): SeriesData {
    return {
      data: result
        .getGroupedSeriesData(groupByKeys, spec.name, spec.aggregation)
        .map(({ keys, value }) => [this.buildGroupedSeriesName(keys), value]),
      spec: spec
    };
  }

  public buildGroupedTimeseriesData(
    spec: AggregatableSpec,
    groupByKeys: string[],
    result: ExploreResult
  ): SeriesData[] {
    return Array.from(result.getGroupedTimeSeriesData(groupByKeys, spec.name, spec.aggregation).entries()).map(
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
