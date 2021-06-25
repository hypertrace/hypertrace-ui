import { Injectable, OnDestroy } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { Subscription } from 'rxjs';

@Injectable()
export class SubscriptionLifecycle2 implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public constructor(public readonly subscriptionLifecycle: SubscriptionLifecycle) {}

  public add(subscription: Subscription): this {
    this.subscriptions.add(subscription);

    this.subscriptionLifecycle.add(subscription);

    console.log('inside subs 2 service');
    return this;
  }

  public unsubscribe(): void {
    this.subscriptionLifecycle.unsubscribe();

    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
