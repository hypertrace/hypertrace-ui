import { Directive, EventEmitter, OnInit, Output } from '@angular/core';
import { LayoutChangeService, SubscriptionLifecycle } from '@hypertrace/common';

@Directive({
  selector: '[htLayoutChange]',
  providers: [SubscriptionLifecycle, LayoutChangeService]
})
export class LayoutChangeDirective implements OnInit {
  @Output('htLayoutChange')
  public readonly changeEmitter: EventEmitter<void> = new EventEmitter();

  public constructor(private readonly layoutChange: LayoutChangeService, subscriptionLifecycle: SubscriptionLifecycle) {
    subscriptionLifecycle.add(layoutChange.layout$.subscribe(this.changeEmitter));
  }

  public ngOnInit(): void {
    this.layoutChange.initialize();
  }
}
