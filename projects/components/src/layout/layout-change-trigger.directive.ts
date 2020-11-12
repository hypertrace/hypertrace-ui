import { Directive, Input, OnChanges } from '@angular/core';
import { LayoutChangeService } from '@hypertrace/common';

@Directive({
  selector: '[htLayoutChangeTrigger]'
})
export class LayoutChangeTriggerDirective implements OnChanges {
  public constructor(private readonly layoutChange: LayoutChangeService) {}

  @Input('htLayoutChangeTrigger')
  public changeTrigger?: unknown;

  public ngOnChanges(): void {
    setTimeout(() => this.layoutChange.publishLayoutChange());
  }
}
