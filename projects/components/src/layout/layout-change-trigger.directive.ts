import { Directive, Input, OnChanges } from '@angular/core';
import { LayoutChangeService, TypedSimpleChanges } from '@hypertrace/common';

@Directive({
  selector: '[htcLayoutChangeTrigger]'
})
export class LayoutChangeTriggerDirective implements OnChanges {
  public constructor(private readonly layoutChange: LayoutChangeService) {}

  @Input('htcLayoutChangeTrigger')
  public changeTrigger?: unknown;

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.changeTrigger && !changeObject.changeTrigger.isFirstChange()) {
      setTimeout(() => this.layoutChange.publishLayoutChange());
    }
  }
}
