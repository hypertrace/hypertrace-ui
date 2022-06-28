import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Color } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';
import { MetricCardIconPosition, MetricCardIndicatorType, MetricCardSize } from './metric-card';
@Component({
  selector: 'ht-metric-card',
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="metric-card"
      [ngStyle]="this.getStylesForCard()"
      [ngClass]="{ clickable: this.isClickable, 'large-card': this.cardSize === '${MetricCardSize.Large}' }"
    >
      <div class="indicator-and-title">
        <div class="indicator">
          <ng-container [ngSwitch]="this.indicator">
            <ng-container *ngSwitchCase="'${MetricCardIndicatorType.Dot}'">
              <div class="dot" [style.backgroundColor]="this.indicatorColor"></div>
            </ng-container>
            <ng-container *ngSwitchCase="'${MetricCardIndicatorType.Icon}'">
              <ng-container *ngIf="this.icon && this.iconPosition === '${MetricCardIconPosition.TopLeft}'">
                <ng-container *ngTemplateOutlet="iconTemplate"></ng-container>
              </ng-container>
            </ng-container>
          </ng-container>
        </div>
        <div
          class="title-text"
          [ngClass]="{
            large: this.cardSize === '${MetricCardSize.Large}'
          }"
        >
          {{ this.titleText }}
        </div>
      </div>
      <div class="value-and-icon">
        <div
          class="value"
          [ngClass]="{
            large: this.cardSize === '${MetricCardSize.Large}'
          }"
        >
          {{ value }}
        </div>
        <ng-container *ngIf="this.icon && this.iconPosition === '${MetricCardIconPosition.BottomRight}'">
          <ng-container *ngTemplateOutlet="iconTemplate"></ng-container>
        </ng-container>
      </div>
    </div>

    <ng-template #iconTemplate>
      <ht-icon class="icon" [icon]="this.icon" [size]="this.iconSize" [color]="this.indicatorColor"></ht-icon>
    </ng-template>
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
  public iconPosition: MetricCardIconPosition = MetricCardIconPosition.TopLeft;

  @Input()
  public iconSize: IconSize = IconSize.Small;

  @Input()
  public indicatorColor: Color = Color.Gray7;

  @Input()
  public backgroundColor: Color = Color.OffWhite;

  @Input()
  public borderColor: Color = Color.Transparent;

  @Input()
  public cardSize: MetricCardSize = MetricCardSize.Small;

  @Input()
  public isSelected: boolean = false;

  @Input()
  public isClickable: boolean = false;

  public getStylesForCard(): { 'background-color': string; 'border-color': string } {
    return this.isSelected
      ? { 'background-color': Color.Blue1, 'border-color': Color.Blue4 }
      : { 'background-color': this.backgroundColor, 'border-color': this.borderColor };
  }
}
