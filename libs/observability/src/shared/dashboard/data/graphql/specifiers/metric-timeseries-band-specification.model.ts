import { Dictionary, IntervalDurationService, TimeDuration, TimeUnit } from '@hypertrace/common';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { MetricTimeseriesBandInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { GraphQlMetricTimeseriesBandContainer } from '../../../../graphql/model/schema/metric/graphql-metric-timeseries';
import { MetricTimeseriesBandSpecification } from '../../../../graphql/model/schema/specifications/metric-timeseries-band-specification';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import { MetricSpecificationModel } from './metric-specification.model';

@Model({
  type: 'metric-timeseries-band'
})
export class MetricTimeseriesBandSpecificationModel
  extends MetricSpecificationModel<MetricTimeseriesBandSpecification>
  implements MetricTimeseriesBandSpecification {
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

  protected buildInnerSpec(): MetricTimeseriesBandSpecification {
    return new ObservabilitySpecificationBuilder().metricTimeseriesBandSpec(
      this.metric,
      this.aggregation,
      this.intervalDurationService.getAutoDuration()
    );
  }

  public getIntervalDuration(): TimeDuration | undefined {
    return this.maybeBuildDuration();
  }

  public withNewIntervalDuration(intervalDuration: TimeDuration): MetricTimeseriesBandSpecification {
    return this.innerSpec.withNewIntervalDuration(intervalDuration);
  }

  public extractFromServerData(
    resultContainer: Dictionary<GraphQlMetricTimeseriesBandContainer>
  ): MetricTimeseriesBandInterval[] {
    return this.innerSpec.extractFromServerData(resultContainer);
  }

  private maybeBuildDuration(): TimeDuration | undefined {
    if (this.intervalDuration === undefined || this.timeUnit === undefined) {
      return undefined;
    }

    return new TimeDuration(this.intervalDuration, this.timeUnit);
  }
}
