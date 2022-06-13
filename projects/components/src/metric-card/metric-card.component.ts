import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Color } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';
import { MetricCardLayout } from '../public-api';
import { MetricCardIndicatorType } from './metric-card';
@Component({
  selector: 'ht-metric-card',
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-card" [ngStyle]="this.getStylesForCard()">
      <div class="card-with-indicator" *ngIf="this.layoutType === '${MetricCardLayout.CardWithIndicator}'">
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
      <div class="card-with-large-icon" *ngIf="this.layoutType === '${MetricCardLayout.CardWithLargeIcon}'">
        <div class="value-with-text">
          <span class="value">{{ this.value }}</span>
          <ht-label class="text" [label]="this.titleText"></ht-label>
        </div>
        <ht-icon class="icon" [icon]="this.icon" size="${IconSize.Large}" [color]="this.iconColor"></ht-icon>
      </div>
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
  public icon?: string; // Only be used when indicator type is Icon in CardWithIndicator layout

  @Input()
  public indicatorColor: Color = Color.Gray7;

  @Input()
  public backgroundColor: Color = Color.OffWhite;

  @Input()
  public borderColor: Color = Color.Transparent;

  @Input()
  public layoutType: MetricCardLayout = MetricCardLayout.CardWithIndicator;

  @Input()
  public iconColor: Color = Color.Gray9;

  @Input()
  public isSelected: boolean = false;

  public getStylesForCard(): { 'background-color': string; 'border-color': string } {
    return this.isSelected
      ? { 'background-color': Color.Blue1, 'border-color': Color.Blue4 }
      : { 'background-color': this.backgroundColor, 'border-color': this.borderColor };
  }
}
