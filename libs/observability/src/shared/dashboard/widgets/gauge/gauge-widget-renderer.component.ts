import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { GaugeWidgetData } from './gauge-widget';
import { GaugeWidgetModel } from './gauge-widget.model';

@Renderer({ modelClass: GaugeWidgetModel })
@Component({
  selector: 'ht-gauge-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content [title]="this.model.title | htDisplayTitle" *htLoadAsync="this.data$ as gaugeData">
      <ht-gauge
        class="fill-container"
        [value]="gaugeData.value"
        [maxValue]="gaugeData.maxValue"
        [thresholds]="gaugeData.thresholds"
      ></ht-gauge>
    </ht-titled-content>
  `
})
export class GaugeWidgetRendererComponent extends WidgetRenderer<GaugeWidgetModel, GaugeWidgetData> {
  protected fetchData(): Observable<GaugeWidgetData> {
    return this.model.getData();
  }
}
