import { ColorService, forkJoinSafeEmpty, RequireBy } from '@hypertrace/common';
import { GraphQlDataSourceModel, MetadataService } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { isEmpty } from 'lodash';
import { EMPTY, Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { Series } from '../../../../components/cartesian/chart';
import { ExploreVisualizationRequest } from '../../../../components/explore-query-editor/explore-visualization-builder';
import { MetricTimeseriesInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import {
  ExploreGraphQlQueryHandlerService,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { MetricSeriesFetcher } from '../../../widgets/charts/cartesian-widget/cartesian-widget.model';
import { ExploreResult } from './explore-result';
@Model({
  type: 'explore-cartesian-data-source'
})
export class ExploreCartesianDataSourceModel extends GraphQlDataSourceModel<MetricSeriesFetcher<ExplorerData>> {
  public request?: ExploreVisualizationRequest;

  @ModelInject(ColorService)
  private readonly colorService!: ColorService;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  public getData(): Observable<MetricSeriesFetcher<ExplorerData>> {
    return (this.request ? this.request.exploreQuery$ : EMPTY).pipe(
      flatMap(request =>
        this.queryWithNextBatch<ExploreGraphQlQueryHandlerService>(inheritedFilters => {
          // Add inherited filters
          request.filters?.push(...inheritedFilters);

          return {
            ...request,
            timeRange: this.getTimeRangeOrThrow()
          };
        })
      ),
      map(response => ({
        getData: () => this.getAllData(response)
      }))
    );
  }

  private getAllData(response: GraphQlExploreResponse): Observable<ExplorerSeries[]> {
    return this.buildAllSeries(this.request!, new ExploreResult(response));
  }

  protected buildAllSeries(request: ExploreVisualizationRequest, result: ExploreResult): Observable<ExplorerSeries[]> {
    const seriesData = this.gatherSeriesData(request, result);
    const colors = this.colorService.getColorPalette().forNColors(seriesData.length);

    return forkJoinSafeEmpty(seriesData.map((data, index) => this.buildSeries(request, data, colors[index])));
  }

  private gatherSeriesData(request: ExploreVisualizationRequest, result: ExploreResult): SeriesData[] {
    const aggregatableSpecs = request.series
      .map(series => series.specification)
      .filter(
        (selection): selection is RequireBy<ExploreSpecification, 'aggregation'> => selection.aggregation !== undefined
      );

    const groupByKeys = request.groupBy?.keys || [];
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

  private buildSeries(
    request: ExploreVisualizationRequest,
    result: SeriesData,
    color: string
  ): Observable<ExplorerSeries> {
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
