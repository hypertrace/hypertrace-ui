import { DateCoercer, Dictionary, TimeDuration } from '@hypertrace/common';
import {
  convertToGraphQlMetricAggregationType,
  GraphQlMetricAggregationType,
  MetricAggregation,
  MetricAggregationType,
  MetricHealth,
  MetricSpecification,
  Specification,
  SpecificationBuilder
} from '@hypertrace/distributed-tracing';
import { GraphQlEnumArgument, GraphQlSelection } from '@hypertrace/graphql-client';
import { assignIn } from 'lodash-es';
import { EntityType, ObservabilityEntityType } from '../../../model/schema/entity';
import { GraphQlMetricInterval } from '../../../model/schema/metric/graphql-metric-timeseries';
import { DefinesNeighbor, NeighborDirection } from '../../../model/schema/neighbor';
import { EntitySpecification } from '../../../model/schema/specifications/entity-specification';
import {
  ErrorPercentageMetricAggregationSpecification,
  ErrorPercentageMetricValueCategory
} from '../../../model/schema/specifications/error-percentage-aggregation-specification';
import { MetricAggregationSpecification } from '../../../model/schema/specifications/metric-aggregation-specification';
import { MetricTimeseriesSpecification } from '../../../model/schema/specifications/metric-timeseries-specification';
import {
  PercentileLatencyMetricAggregationSpecification,
  PercentileLatencyMetricValueCategory
} from '../../../model/schema/specifications/percentile-latency-aggregation-specification';
import { GraphQlObservabilityArgumentBuilder } from '../argument/graphql-observability-argument-builder';
import { EntitySpecificationBuilder } from '../specification/entity/entity-specification-builder';
import { convertToGraphQlMetricAggregationPath } from '../specification/metric/metric-aggregation-converters';

export class ObservabilitySpecificationBuilder extends SpecificationBuilder {
  protected readonly argBuilder: GraphQlObservabilityArgumentBuilder = new GraphQlObservabilityArgumentBuilder();
  protected readonly entitySpecBuilder: EntitySpecificationBuilder = new EntitySpecificationBuilder();

  public buildEntitySpecification(
    idKey: string,
    nameKey: string,
    entityType?: EntityType,
    additionalAttributes?: string[]
  ): EntitySpecification {
    return this.entitySpecBuilder.build(idKey, nameKey, entityType, additionalAttributes);
  }

  public neighborAttributeSpecificationForKey(
    attributeKey: string,
    neighborType: ObservabilityEntityType,
    neighborDirection: NeighborDirection
  ): Specification & DefinesNeighbor {
    return {
      ...this.attributeSpecificationForKey(attributeKey),
      neighborType: neighborType,
      neighborDirection: neighborDirection
    };
  }

  public metricAggregationSpecForKey(
    metric: string,
    aggregation: MetricAggregationType,
    displayName?: string
  ): MetricAggregationSpecification {
    const metricSelection = this.buildAggregationSelection(aggregation);

    return {
      ...this.getMetricSpecificationBase(metric, aggregation),
      displayName: displayName,
      resultAlias: () => this.buildResultAlias(metric, aggregation),
      asGraphQlSelections: () => ({
        ...this.getMetricSelectionBase(metric),
        children: [
          {
            ...metricSelection,
            children: [{ path: 'value' }]
          }
        ]
      }),
      extractFromServerData: serverData => {
        const graphqlAggResult = serverData[metric][this.getQueriedKeyForSelection(metricSelection)];

        return {
          value: graphqlAggResult.value,
          health: MetricHealth.NotSpecified // Not implemented for now
        };
      }
    };
  }

  public metricAggregationSpecForErrorPercentage(
    aggregation: MetricAggregationType,
    displayName?: string
  ): ErrorPercentageMetricAggregationSpecification {
    const compositeSpecification = this.buildCompositeSpecification(
      [
        this.metricAggregationSpecForKey('errorCount', aggregation),
        this.metricAggregationSpecForKey('numCalls', aggregation)
      ],
      'errorCount'
    );

    return {
      aggregation: aggregation,
      resultAlias: () => compositeSpecification.resultAlias(),
      name: 'errorPercentage',
      displayName: displayName !== undefined ? displayName : 'Error Percentage',
      asGraphQlSelections: () => compositeSpecification.asGraphQlSelections(),
      extractFromServerData: (resultContainer: Dictionary<unknown>) => {
        const [errorMetric, callsMetric] = compositeSpecification.extractFromServerData(
          resultContainer
        ) as MetricAggregation[];

        const value =
          errorMetric.value >= 0 && callsMetric.value > 0 ? (errorMetric.value / callsMetric.value) * 100 : 0;
        const category =
          value < 5
            ? ErrorPercentageMetricValueCategory.LessThan5
            : ErrorPercentageMetricValueCategory.GreaterThanOrEqualTo5;

        return {
          value: value,
          health: MetricHealth.NotSpecified,
          category: category,
          units: '%'
        };
      },
      asGraphQlOrderByFragment: () => compositeSpecification.asGraphQlOrderByFragment()
    };
  }

  public metricAggregationSpecForLatency(
    aggregation: MetricAggregationType,
    name: string,
    displayName?: string
  ): PercentileLatencyMetricAggregationSpecification {
    const metricSpec = this.metricAggregationSpecForKey('duration', aggregation, displayName);
    const getLatencyCategory = (value?: number): PercentileLatencyMetricValueCategory => {
      if (value === undefined) {
        return PercentileLatencyMetricValueCategory.NotSpecified;
      }

      if (value < 20) {
        return PercentileLatencyMetricValueCategory.LessThan20;
      }

      if (value >= 20 && value < 100) {
        return PercentileLatencyMetricValueCategory.From20To100;
      }

      if (value >= 100 && value < 500) {
        return PercentileLatencyMetricValueCategory.From100To500;
      }

      if (value >= 500 && value < 1000) {
        return PercentileLatencyMetricValueCategory.From500To1000;
      }

      return PercentileLatencyMetricValueCategory.GreaterThanOrEqualTo1000;
    };

    return {
      aggregation: aggregation,
      resultAlias: () => metricSpec.resultAlias(),
      name: name,
      displayName: displayName,
      asGraphQlSelections: () => metricSpec.asGraphQlSelections(),
      extractFromServerData: resultContainer => {
        const latencyMetric = metricSpec.extractFromServerData(resultContainer);

        return assignIn(latencyMetric, {
          category: getLatencyCategory(latencyMetric.value),
          units: 'ms'
        });
      },
      asGraphQlOrderByFragment: () => metricSpec.asGraphQlOrderByFragment()
    };
  }

  public metricTimeseriesSpec(
    metric: string,
    aggregation: MetricAggregationType,
    intervalDuration: TimeDuration,
    fetchBands: boolean = false
  ): MetricTimeseriesSpecification {
    const dateCoercer: DateCoercer = new DateCoercer();
    const seriesAlias = `${aggregation}_series_${intervalDuration.toString()}`;
    const baselineSeriesAlias = `${aggregation}_baselineSeries_${intervalDuration.toString()}`;

    // Timeseries does not require unique because it's deduping at the series level
    const aggregationSelection = this.buildAggregationSelection(aggregation, false);

    return {
      ...this.getMetricSpecificationBase(metric, aggregation),
      resultAlias: () => this.buildResultAlias(metric, aggregation, [intervalDuration.toString()]),
      withNewIntervalDuration: newInterval => this.metricTimeseriesSpec(metric, aggregation, newInterval, fetchBands),
      getIntervalDuration: () => intervalDuration,
      asGraphQlSelections: () => ({
        ...this.getMetricSelectionBase(metric),
        children: [
          {
            path: 'series',
            alias: seriesAlias,
            arguments: this.argBuilder.forIntervalArgs(intervalDuration),
            children: [
              { path: 'startTime' },
              {
                ...aggregationSelection,
                children: [{ path: 'value' }]
              }
            ]
          },
          ...(fetchBands
            ? [
                {
                  path: 'baselineSeries',
                  alias: baselineSeriesAlias,
                  arguments: this.argBuilder.forIntervalArgs(intervalDuration),
                  children: [
                    { path: 'startTime' },
                    {
                      ...aggregationSelection,
                      children: [{ path: 'value' }, { path: 'upperBound' }, { path: 'lowerBound' }]
                    }
                  ]
                }
              ]
            : [])
        ]
      }),
      extractFromServerData: resultContainer => {
        /*
         * NOTE: baselineSeries include each interval, while series may skip intervals.
         */
        const baselineSeries: GraphQlMetricInterval[] | undefined = resultContainer[metric][baselineSeriesAlias];
        const series: GraphQlMetricInterval[] = resultContainer[metric][seriesAlias];

        // Not sure why tslint is flagging "baselineSeries === undefined" as always false
        // tslint:disable-next-line:strict-type-predicates
        if (baselineSeries === undefined || baselineSeries.length === 0) {
          // No baselineSeries, so just return series data
          return series.map(interval => ({
            value: interval[convertToGraphQlMetricAggregationPath(aggregation)]!.value,
            timestamp: dateCoercer.coerce(interval.startTime)!
          }));
        }

        // Transform series array to Map based on interval timestamp to avoid a find() each time. O(n^2)
        const seriesMap: Map<string, number> = new Map<string, number>();
        series.forEach(seriesInterval => {
          seriesMap.set(
            seriesInterval.startTime,
            seriesInterval[convertToGraphQlMetricAggregationPath(aggregation)]!.value
          );
        });

        return baselineSeries.map(baselineInterval => {
          const baselineArgInterval = baselineInterval[convertToGraphQlMetricAggregationPath(aggregation)]!;

          return {
            timestamp: dateCoercer.coerce(baselineInterval.startTime)!,
            value: seriesMap.get(baselineInterval.startTime) ?? 0,
            baseline: baselineArgInterval.value,
            upperBound: baselineArgInterval.upperBound,
            lowerBound: baselineArgInterval.lowerBound
          };
        });
      }
    };
  }

  public buildAggregationSelection(
    aggregation: MetricAggregationType,
    requireUnique: boolean = true,
    fetchBounds: boolean = false
  ): GraphQlSelection {
    return {
      path: convertToGraphQlMetricAggregationPath(aggregation),
      alias: requireUnique ? aggregation : undefined,
      arguments: this.argBuilder.forAggregationArgs(aggregation),
      children: fetchBounds ? [{ path: 'upperBound' }, { path: 'lowerBound' }] : []
    };
  }

  protected getQueriedKeyForSelection(selection: GraphQlSelection): string {
    return typeof selection.alias === 'string' ? selection.alias : selection.path;
  }

  protected getMetricSelectionBase(metric: string): GraphQlSelection {
    return {
      alias: metric,
      path: 'metric',
      arguments: [this.argBuilder.forAttributeKey(metric)]
    };
  }

  protected getMetricSpecificationBase(
    metric: string,
    aggregation: MetricAggregationType
  ): Pick<MetricSpecification, 'name' | 'aggregation' | 'asGraphQlOrderByFragment'> {
    return {
      name: metric,
      aggregation: aggregation,
      asGraphQlOrderByFragment: () => ({
        key: metric,
        aggregation: this.aggregationAsEnum(aggregation)
      })
    };
  }

  protected aggregationAsEnum(aggregation: MetricAggregationType): GraphQlEnumArgument<GraphQlMetricAggregationType> {
    return new GraphQlEnumArgument(convertToGraphQlMetricAggregationType(aggregation));
  }

  protected buildResultAlias(key: string, aggregation?: MetricAggregationType, args: (string | number)[] = []): string {
    // The format is aggregation(metric_name,arg1,arg2,...,argN)
    return aggregation === undefined ? key : `${aggregation}(${[key, ...args].join(',')})`;
  }
}
