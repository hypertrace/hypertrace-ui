import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { HighlightedLabelWidgetModel } from './highlighted-label-widget.model';

@Renderer({ modelClass: HighlightedLabelWidgetModel })
@Component({
  selector: 'htc-highlighted-label-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-highlighted-label *htcLoadAsync="this.data$ as data" [data]="data" [templateString]="this.model.labelTemplate">
    </htc-highlighted-label>
  `
})
export class HighlightedLabelWidgetRendererComponent extends WidgetRenderer<
  HighlightedLabelWidgetModel,
  Dictionary<string | number>
> {
  protected fetchData(): Observable<Dictionary<string | number>> {
    return this.api.getDataFromModelDataSource();
  }
}
