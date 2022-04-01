import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Color } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';
import { MetricCardIndicatorType } from './metric-card';
@Component({
  selector: 'ht-metric-card',
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-card" [style.backgroundColor]="this.backgroundColor" [style.borderColor]="this.borderColor">
      <div class="indicator-and-title">
        <div class="indicator">
          <ng-container [ngSwitch]="this.indicator">
            <ng-container *ngSwitchCase="'${MetricCardIndicatorType.Dot}'">
              <div class="dot" [style.backgroundColor]="this.indicatorColor"></div>
            </ng-container>
            <ng-container *ngSwitchCase="'${MetricCardIndicatorType.Icon}'">
              <ht-icon
                *ngIf="this.icon"
                class="icon"
                [icon]="this.icon"
                size="${IconSize.Small}"
                [color]="this.indicatorColor"
              ></ht-icon>
            </ng-container>
          </ng-container>
        </div>
        <div class="title-text">{{ this.titleText }}</div>
      </div>
      <div class="value">{{ value }}</div>
    </div>
  `
})
export class MetricCardComponent {
  @Input()
  public titleText?: string;

  @Input()
  public value?: string | number;

  @Input()
  public indicator: MetricCardIndicatorType = MetricCardIndicatorType.Dot;

  @Input()
  public icon?: string; // Only be used when indicator type is Icon

  @Input()
  public indicatorColor: Color = Color.Gray7;

  @Input()
  public backgroundColor: Color = Color.OffWhite;

  @Input()
  public borderColor: Color = Color.Transparent;
}
