import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MetricHealth } from '../../graphql/model/metrics/metric-health';

@Component({
  selector: 'ht-metric-display',
  templateUrl: './metric-display.component.html',
  styleUrls: ['./metric-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricDisplayComponent {
  @Input()
  public value: string | number = '-';

  @Input()
  public metricTitle: string = '';

  @Input()
  public metricSubtitle: string = '';

  @Input()
  public superscript: string = '';

  @Input()
  public health: MetricHealth = MetricHealth.Critical;

  @Input()
  public subscript: string = '';
}
