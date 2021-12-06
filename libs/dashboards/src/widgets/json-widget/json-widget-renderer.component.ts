import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { JsonWidgetModel } from './json-widget.model';

@Renderer({ modelClass: JsonWidgetModel })
@Component({
  selector: 'ht-json-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content>
      <div
        *htLoadAsync="this.data$ as data"
        [style.backgroundColor]="'background-color' | themeProp"
        [style.color]="'text-color' | themeProp"
      >
        <pre style="overflow-x: auto">{{ data | json }}</pre>
      </div>
    </ht-titled-content>
  `
})
export class JsonWidgetRendererComponent extends WidgetRenderer<JsonWidgetModel, string> {
  protected fetchData(): Observable<string> {
    return this.api.getDataFromModelDataSource();
  }
}
