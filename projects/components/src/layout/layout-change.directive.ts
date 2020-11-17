import { Directive, EventEmitter, Output } from '@angular/core';
import { LayoutChangeService, SubscriptionLifecycle } from '@hypertrace/common';

@Directive({
  selector: '[htLayoutChange]',
  providers: [SubscriptionLifecycle, LayoutChangeService]
})
export class LayoutChangeDirective {
  @Output('htLayoutChange')
  public readonly changeEmitter: EventEmitter<void> = new EventEmitter();

  public constructor(private readonly layoutChange: LayoutChangeService, subscriptionLifecycle: SubscriptionLifecycle) {
    subscriptionLifecycle.add(layoutChange.layout$.subscribe(this.changeEmitter));
    this.layoutChange.initialize();
  }
}
