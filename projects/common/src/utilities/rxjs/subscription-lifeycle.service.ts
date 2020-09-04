import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable()
export class SubscriptionLifecycle implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public add(subscription: Subscription): this {
    this.subscriptions.add(subscription);

    return this;
  }

  public unsubscribe(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
