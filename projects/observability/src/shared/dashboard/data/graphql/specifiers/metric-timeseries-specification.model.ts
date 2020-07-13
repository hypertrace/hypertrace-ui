import { Dictionary, IntervalDurationService, TimeDuration, TimeUnit } from '@hypertrace/common';
import { ENUM_TYPE, EnumPropertyTypeInstance } from '@hypertrace/dashboards';
import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { MetricTimeseriesInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { GraphQlMetricTimeseriesContainer } from '../../../../graphql/model/schema/metric/graphql-metric-timeseries';
import { MetricTimeseriesSpecification } from '../../../../graphql/model/schema/specifications/metric-timeseries-specification';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import { MetricSpecificationModel } from './metric-specification.model';

@Model({
  type: 'metric-timeseries',
  displayName: 'Metric'
})
export class MetricTimeseriesSpecificationModel extends MetricSpecificationModel<MetricTimeseriesSpecification>
  implements MetricTimeseriesSpecification {
  @ModelProperty({
    key: 'interval-duration',
    displayName: 'Interval Duration',
    type: NUMBER_PROPERTY.type
  })
  public intervalDuration?: number;

  @ModelProperty({
    key: 'interval-unit',
    displayName: 'Interval Unit',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [TimeUnit.Second, TimeUnit.Minute, TimeUnit.Hour, TimeUnit.Day]
    } as EnumPropertyTypeInstance
  })
  public timeUnit?: TimeUnit;

  @ModelInject(IntervalDurationService)
  private readonly intervalDurationService!: IntervalDurationService;

  protected buildInnerSpec(): MetricTimeseriesSpecification {
    return new ObservabilitySpecificationBuilder().metricTimeseriesSpec(
      this.metric,
      this.aggregation,
      this.intervalDurationService.getAutoDuration()
    );
  }

  public getIntervalDuration(): TimeDuration | undefined {
    return this.maybeBuildDuration();
  }

  public withNewIntervalDuration(intervalDuration: TimeDuration): MetricTimeseriesSpecification {
    return this.innerSpec.withNewIntervalDuration(intervalDuration);
  }

  public extractFromServerData(
    resultContainer: Dictionary<GraphQlMetricTimeseriesContainer>
  ): MetricTimeseriesInterval[] {
    return this.innerSpec.extractFromServerData(resultContainer);
  }

  private maybeBuildDuration(): TimeDuration | undefined {
    if (this.intervalDuration === undefined || this.timeUnit === undefined) {
      return undefined;
    }

    return new TimeDuration(this.intervalDuration, this.timeUnit);
  }
}
