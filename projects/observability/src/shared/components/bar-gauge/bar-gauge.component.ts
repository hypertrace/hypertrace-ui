import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { getPercentage, TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'ht-bar-gauge',
  styleUrls: ['./bar-gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar-gauge">
      <div *ngIf="this.title" class="title">{{ this.title | htDisplayTitle }}</div>
      <div class="count">
        {{ this.value?.toLocaleString() }} / {{ this.maxValue?.toLocaleString() }}
        <span class="units" *ngIf="this.units">{{ this.units }}</span>
      </div>
      <div class="bar">
        <div class="max-value-bar"></div>
        <div
          class="current-value-bar"
          [ngClass]="{ 'almost-max-value': this.almostMaxValue, 'over-max-value': this.overMaxValue }"
          [style.width.%]="this.valuePercentage"
        ></div>
      </div>
    </div>
  `
})
export class BarGaugeComponent implements OnChanges {
  @Input()
  public title?: string;

  @Input()
  public value?: number;

  @Input()
  public maxValue?: number;

  @Input()
  public units?: string;

  public valuePercentage: number = 0;
  public almostMaxValue: boolean = false; // We use this to add radius to the bar when it gets close to end
  public overMaxValue: boolean = false;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.value || changes.maxValue) {
      const percentage = getPercentage(this.value, this.maxValue);
      this.almostMaxValue = percentage >= 96; // Not exact since depends on width, but close enough
      this.overMaxValue = percentage > 100;
      this.valuePercentage = Math.min(getPercentage(this.value, this.maxValue), 100);
    }
  }
}
