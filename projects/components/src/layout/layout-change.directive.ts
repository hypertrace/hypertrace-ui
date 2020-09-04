import { AfterViewInit, Directive, EventEmitter, Output } from '@angular/core';
import { LayoutChangeService, SubscriptionLifecycle } from '@hypertrace/common';

@Directive({
  selector: '[htcLayoutChange]',
  providers: [SubscriptionLifecycle, LayoutChangeService]
})
export class LayoutChangeDirective implements AfterViewInit {
  @Output('htcLayoutChange')
  public readonly changeEmitter: EventEmitter<void> = new EventEmitter();

  public constructor(private readonly layoutChange: LayoutChangeService, subscriptionLifecycle: SubscriptionLifecycle) {
    subscriptionLifecycle.add(layoutChange.layout$.subscribe(this.changeEmitter));
  }

  public ngAfterViewInit(): void {
    this.layoutChange.initialize();
  }
}
