import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TitlePosition } from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { MetricDisplayWidgetModel, MetricWidgetValueData } from './metric-display-widget.model';

@Renderer({ modelClass: MetricDisplayWidgetModel })
@Component({
  selector: 'ht-metric-display-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content
      *htLoadAsync="this.data$ as data"
      [title]="this.model.title | htDisplayTitle: this.getUnits(data.units)"
      [hideTitle]="this.hideTitle()"
      [titlePosition]="this.getTitlePosition()"
    >
      <ht-metric-display
        [value]="data.value"
        [metricSubtitle]="model.subtitle"
        [health]="data.health"
        [superscript]="model.superscript"
        [subscript]="model.subscript"
      >
      </ht-metric-display>
    </ht-titled-content>
  `
})
export class MetricDisplayWidgetRendererComponent extends WidgetRenderer<
  MetricDisplayWidgetModel,
  MetricWidgetValueData
> {
  protected fetchData(): Observable<MetricWidgetValueData> {
    return this.model.getData();
  }

  public getUnits(units: string): string {
    return this.model.showUnits ? units : '';
  }

  public hideTitle(): boolean {
    return this.model.title === undefined && !this.model.showUnits;
  }

  public getTitlePosition(): TitlePosition {
    return this.model.titlePosition === TitlePosition.Footer ? TitlePosition.Footer : TitlePosition.Header;
  }
}
