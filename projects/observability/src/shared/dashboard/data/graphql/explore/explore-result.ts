import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { groupBy } from 'lodash-es';
import { MetricTimeseriesInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  GraphQlExploreResponse,
  GraphQlExploreResult,
  GQL_EXPLORE_RESULT_INTERVAL_KEY
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

export class ExploreResult {
  private static readonly OTHER_SERVER_GROUP_NAME: string = '__Other';
  public static readonly OTHER_UI_GROUP_NAME: string = 'Others';

  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  public constructor(private readonly response: GraphQlExploreResponse) {}

  public getTimeSeriesData(metricKey: string, aggregation: MetricAggregationType): MetricTimeseriesInterval[] {
    return this.extractTimeseriesForSpec(this.specBuilder.exploreSpecificationForKey(metricKey, aggregation));
  }

  public getGroupedSeriesData(groupKeys: string[], metricKey: string, aggregation: MetricAggregationType): GroupData[] {
    return this.extractGroupSeriesForSpec(
      groupKeys.map(key => this.specBuilder.exploreSpecificationForKey(key)),
      this.specBuilder.exploreSpecificationForKey(metricKey, aggregation)
    );
  }

  public getGroupedTimeSeriesData(
    groupKeys: string[],
    metricKey: string,
    aggregation: MetricAggregationType
  ): Map<string[], MetricTimeseriesInterval[]> {
    const groupSpecs = groupKeys.map(key => this.specBuilder.exploreSpecificationForKey(key));
    const spec = this.specBuilder.exploreSpecificationForKey(metricKey, aggregation);
    const groupedResults = groupBy(this.response.results, result =>
      this.getGroupNamesFromResult(result, groupSpecs).join(',')
    );

    return new Map(
      Object.entries(groupedResults).map(([concatenatedGroupNames, results]) => [
        concatenatedGroupNames.split(','),
        results.map(result => this.resultToTimeseriesInterval(result, spec))
      ])
    );
  }

  private extractGroupSeriesForSpec(groupBySpecs: ExploreSpecification[], spec: ExploreSpecification): GroupData[] {
    return this.resultsContainingSpec(spec).map(result => this.resultToGroupData(result, groupBySpecs, spec));
  }

  private extractTimeseriesForSpec(spec: ExploreSpecification): MetricTimeseriesInterval[] {
    return this.resultsContainingSpec(spec).map(result => this.resultToTimeseriesInterval(result, spec));
  }

  private resultToGroupData(
    result: GraphQlExploreResult,
    groupBySpecs: ExploreSpecification[],
    spec: ExploreSpecification
  ): GroupData {
    return {
      keys: this.getGroupNamesFromResult(result, groupBySpecs),
      value: result[spec.resultAlias()].value as number
    };
  }

  private getGroupNamesFromResult(result: GraphQlExploreResult, groupBySpecs: ExploreSpecification[]): string[] {
    return groupBySpecs
      .map(spec => result[spec.resultAlias()].value as string)
      .map(name => (name === ExploreResult.OTHER_SERVER_GROUP_NAME ? ExploreResult.OTHER_UI_GROUP_NAME : name));
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

interface GroupData {
  keys: string[];
  value: number;
}
