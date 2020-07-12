import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { groupBy } from 'lodash';
import { MetricTimeseriesInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  GQL_EXPLORE_RESULT_GROUP_KEY,
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreResponse,
  GraphQlExploreResult
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

export class ExploreResult {
  private static readonly OTHER_SERVER_GROUP_NAME: string = '__Other';
  private static readonly OTHER_UI_GROUP_NAME: string = 'Other results';

  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  public constructor(private readonly response: GraphQlExploreResponse) {}

  public getTimeSeriesData(metricKey: string, aggregation: MetricAggregationType): MetricTimeseriesInterval[] {
    return this.extractTimeseriesForSpec(this.specBuilder.exploreSpecificationForKey(metricKey, aggregation));
  }

  public getGroupedSeriesData(metricKey: string, aggregation: MetricAggregationType): GroupData[] {
    return this.extractGroupSeriesForSpec(this.specBuilder.exploreSpecificationForKey(metricKey, aggregation));
  }

  public getGroupedTimeSeriesData(
    metricKey: string,
    aggregation: MetricAggregationType
  ): Map<string, MetricTimeseriesInterval[]> {
    const groupedResults = groupBy(this.response.results, result => this.getGroupNameFromResult(result));
    const spec = this.specBuilder.exploreSpecificationForKey(metricKey, aggregation);

    return new Map(
      Object.entries(groupedResults).map(([groupName, results]) => [
        groupName,
        results.map(result => this.resultToTimeseriesInterval(result, spec))
      ])
    );
  }

  private extractGroupSeriesForSpec(spec: ExploreSpecification): GroupData[] {
    return this.resultsContainingSpec(spec).map(result => this.resultToGroupData(result, spec));
  }

  private extractTimeseriesForSpec(spec: ExploreSpecification): MetricTimeseriesInterval[] {
    return this.resultsContainingSpec(spec).map(result => this.resultToTimeseriesInterval(result, spec));
  }

  private resultToGroupData(result: GraphQlExploreResult, spec: ExploreSpecification): GroupData {
    return [this.getGroupNameFromResult(result), result[spec.resultAlias()].value as number];
  }

  private getGroupNameFromResult(result: GraphQlExploreResult): string {
    const returnedName = result[GQL_EXPLORE_RESULT_GROUP_KEY]!;

    if (returnedName === ExploreResult.OTHER_SERVER_GROUP_NAME) {
      return ExploreResult.OTHER_UI_GROUP_NAME;
    }

    return returnedName;
  }

  private resultToTimeseriesInterval(
    result: GraphQlExploreResult,
    spec: ExploreSpecification
  ): MetricTimeseriesInterval {
    return {
      value: result[spec.resultAlias()].value as number,
      timestamp: result[GQL_EXPLORE_RESULT_INTERVAL_KEY]!
    };
  }

  private resultsContainingSpec(spec: ExploreSpecification): GraphQlExploreResult[] {
    const key = spec.resultAlias();

    return this.response.results.filter(result => key in result);
  }
}

type GroupData = [string, number];
