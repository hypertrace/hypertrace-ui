import { Directive, TemplateRef } from '@angular/core';
import { CustomLegendContext } from './bar-gauge.component';

@Directive({
  selector: '[htBarGaugeLegend]'
})
export class BarGaugeLegendDirective {
  public constructor(public tpl: TemplateRef<CustomLegendContext>) {}
}
