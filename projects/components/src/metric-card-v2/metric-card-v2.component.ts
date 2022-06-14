import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Color } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-metric-card-v2',
  styleUrls: ['./metric-card-v2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-card" [ngClass]="{ selected: this.isSelected }">
      <div class="value-with-text">
        <span class="value">{{ this.value }}</span>
        <ht-label class="text" [label]="this.text"></ht-label>
      </div>
      <ht-icon class="icon" [icon]="this.icon" [size]="this.iconSize" [color]="this.iconColor"></ht-icon>
    </div>
  `
})
export class MetricCardV2Component {
  @Input()
  public text?: string;

  @Input()
  public value?: string | number;

  @Input()
  public icon?: string;

  @Input()
  public iconSize: string = IconSize.Large;

  @Input()
  public iconColor: Color = Color.Gray9;

  @Input()
  public isSelected: boolean = false;
}
