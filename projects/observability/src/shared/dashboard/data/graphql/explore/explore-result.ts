import { TimeDuration } from '@hypertrace/common';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { groupBy } from 'lodash-es';
import { MetricTimeseriesInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreResponse,
  GraphQlExploreResult
} from '../../../../graphql/request/handlers/explore/explore-query';

export class ExploreResult {
  private static readonly OTHER_SERVER_GROUP_NAME: string = '__Other';
  public static readonly OTHER_UI_GROUP_NAME: string = 'Others';

  private readonly specBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  public constructor(
    private readonly response: GraphQlExploreResponse,
    private readonly interval?: TimeDuration,
    private readonly timeRange?: GraphQlTimeRange
  ) {}

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
        this.resultsToTimeseriesIntervals(results, spec)
      ])
    );
  }

  private extractGroupSeriesForSpec(groupBySpecs: ExploreSpecification[], spec: ExploreSpecification): GroupData[] {
    return this.resultsContainingSpec(spec).map(result => this.resultToGroupData(result, groupBySpecs, spec));
  }

  private extractTimeseriesForSpec(spec: ExploreSpecification): MetricTimeseriesInterval[] {
    return this.resultsToTimeseriesIntervals(this.resultsContainingSpec(spec), spec);
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

  private resultsToTimeseriesIntervals(
    results: GraphQlExploreResult[],
    spec: ExploreSpecification
  ): MetricTimeseriesInterval[] {
    if (this.interval !== undefined && this.timeRange !== undefined) {
      // This should add missing data to array

      // Add all intervals
      const buckets = [];
      const intervalDuration = this.interval.toMillis();
      const startTime = Math.floor(this.timeRange.from.valueOf() / intervalDuration) * intervalDuration;
      const endTime = Math.ceil(this.timeRange.to.valueOf() / intervalDuration) * intervalDuration;

      for (let timestamp = startTime; timestamp < endTime; timestamp = timestamp + intervalDuration) {
        buckets.push(timestamp);
      }

      const resultBucketMap: Map<number, MetricTimeseriesInterval> = new Map(
        results
          .map(result => this.resultToTimeseriesInterval(result, spec))
          .map(metric => [metric.timestamp.getTime(), metric])
      );

      const metrics = buckets.map(
        timestamp =>
          resultBucketMap.get(timestamp) ?? {
            value: 0,
            timestamp: new Date(timestamp)
          }
      );

      return metrics;
    }

    return results.map(result => this.resultToTimeseriesInterval(result, spec));
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
