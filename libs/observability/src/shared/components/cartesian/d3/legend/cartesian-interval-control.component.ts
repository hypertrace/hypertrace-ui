import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';
import { SelectSize } from '@hypertrace/components';
import { Observer } from 'rxjs';
import { IntervalValue } from '../../../interval-select/interval-select.component';

export const INTERVAL_DATA = new InjectionToken<CartesianIntervalData>('INTERVAL_DATA');

@Component({
  selector: 'ht-cartesian-interval-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./cartesian-interval-control.component.scss'],
  template: `
    <div class="interval-selector">
      <ht-interval-select
        class="selection"
        size="${SelectSize.Small}"
        [showIcon]="true"
        [interval]="this.interval"
        [intervalOptions]="this.intervalOptions"
        (intervalChange)="this.onIntervalChange($event)"
      >
      </ht-interval-select>
    </div>
  `
})
export class CartesianIntervalControlComponent {
  public readonly interval: IntervalValue;
  public readonly intervalOptions: IntervalValue[];

  public constructor(@Inject(INTERVAL_DATA) private readonly data: CartesianIntervalData) {
    this.interval = this.data.initial;
    this.intervalOptions = this.data.options;
  }

  public onIntervalChange(intervalValue: IntervalValue): void {
    this.data.changeObserver.next(intervalValue);
  }
}

export interface CartesianIntervalData {
  options: IntervalValue[];
  initial: IntervalValue;
  changeObserver: Observer<IntervalValue>;
}
