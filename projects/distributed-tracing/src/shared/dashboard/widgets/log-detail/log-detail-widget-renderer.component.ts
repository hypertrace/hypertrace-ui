import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { ListViewHeader, ListViewRecord } from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { LogDetailWidgetModel } from './log-detail-widget.model';

@Renderer({ modelClass: LogDetailWidgetModel })
@Component({
  selector: 'ht-log-detail-widget-renderer',
  styleUrls: ['./log-detail-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content" *htLoadAsync="this.data$ as attributes">
      <ht-list-view
        [records]="this.getLogEventAttributeRecords(attributes)"
        [header]="this.header"
        data-sensitive-pii
      ></ht-list-view>
    </div>
  `
})
export class LogDetailWidgetRendererComponent extends WidgetRenderer<LogDetailWidgetModel, Dictionary<unknown>> {
  public readonly header: ListViewHeader = { keyLabel: 'key', valueLabel: 'value' };

  protected fetchData(): Observable<Dictionary<unknown>> {
    return this.model.getData();
  }

  public getLogEventAttributeRecords(attributes: Dictionary<unknown>): ListViewRecord[] {
    if (Boolean(attributes)) {
      return Object.entries(attributes).map((attribute: [string, unknown]) => ({
        key: attribute[0],
        value: attribute[1] as string | number
      }));
    }

    return [];
  }
}
