import { ChangeDetectionStrategy, Component, Input, OnChanges, TemplateRef } from '@angular/core';
import { Color } from '@hypertrace/common';
import { TooltipDirective } from '../public-api';

@Component({
  selector: 'ht-x-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="ht-x-more">
    <span
      class="summary-text"
      *ngIf="this.count > 0"
      [htTooltip]="this.tooltip"
      [style.color]="this.color"
      [style.backgroundColor]="this.backgroundColor"
      [ngClass]="this.displayStyle"
      >{{ this.summaryText }}</span
    >
  </div>`,
  styleUrls: ['./x-more.component.scss']
})
export class XMoreComponent implements OnChanges {
  @Input()
  public count!: number;

  @Input()
  public suffix?: string = '';

  @Input()
  public displayStyle: XMoreDisplay = XMoreDisplay.Plain;

  @Input()
  public backgroundColor?: Color;

  @Input()
  public color?: string;

  @Input()
  public tooltip!: string | number | TemplateRef<TooltipDirective>;

  public summaryText!: string;

  public ngOnChanges(): void {
    this.summaryText = `+${this.count}`;

    if (this.suffix !== '') {
      this.summaryText += ` ${this.suffix}`;
    }

    if (this.displayStyle === XMoreDisplay.Plain) {
      this.backgroundColor = Color.White;
    }
  }
}

export const enum XMoreDisplay {
  Plain = 'plain',
  WithBackground = 'with-background'
}
