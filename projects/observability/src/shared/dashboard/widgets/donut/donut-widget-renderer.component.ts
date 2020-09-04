import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { DonutResults } from '../../../components/donut/donut';
import { DonutWidgetModel } from './donut-widget.model';

@Renderer({ modelClass: DonutWidgetModel })
@Component({
  selector: 'ht-donut-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-titled-content
      [title]="this.model.header?.title | htcDisplayTitle"
      [link]="this.model.header?.link?.url"
      [linkLabel]="this.model.header?.link?.displayText"
      *htcLoadAsync="this.data$ as data"
    >
      <ht-donut
        class="fill-container"
        [series]="data.series"
        [center]="data.center"
        [legendPosition]="this.model.legendPosition"
        [displayLegendCounts]="this.model.displayLegendCounts"
      >
      </ht-donut>
    </htc-titled-content>
  `
})
export class DonutWidgetRendererComponent extends WidgetRenderer<DonutWidgetModel, DonutResults> {
  protected fetchData(): Observable<DonutResults> {
    return this.model.getData();
  }
}
