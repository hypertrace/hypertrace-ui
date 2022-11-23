import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Renderer } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { WidgetRenderer } from '../widget-renderer';
import { LegendWidgetModel } from './legend-widget.model';

@Renderer({ modelClass: LegendWidgetModel })
@Component({
  selector: 'ht-legend-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./legend-widget-render.component.scss'],
  template: `
    <div class="legend-widget">
      <span>* </span>
      <div class="legend-widget-outer-box"></div>
      <div class="legend-widget-text">
        <span class="prefix-text" *ngIf="this.model.prefixText.length > 0">{{ this.model.prefixText }}</span>
        <span class="display-text">{{ this.getDisplayText() }}</span>
        <span class="suffix-text" *ngIf="this.model.suffixText.length > 0">{{ this.model.suffixText }}</span>
      </div>
    </div>
  `
})
export class LegendWidgetRendererComponent extends WidgetRenderer<LegendWidgetModel> {
  protected fetchData(): Observable<never> {
    return EMPTY;
  }

  public getDisplayText(): string {
    return this.model.displayText;
  }
}
