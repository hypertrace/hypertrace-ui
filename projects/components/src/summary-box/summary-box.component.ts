import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Color } from '@hypertrace/common';

@Component({
  selector: 'ht-summary-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="ht-summary-box">
    <span
      class="summary-text"
      *ngIf="this.count > 0"
      [htTooltip]="summaryTooltip"
      [style.color]="this.color"
      [style.backgroundColor]="this.backgroundColor"
      [ngClass]="this.displayStyle"
      >{{ this.summaryText }} {{ this.suffix }}</span
    >
    <ng-template #summaryTooltip>
      <div class="tooltip-contents">{{ this.tooltip }}</div>
    </ng-template>
  </div>`,
  styleUrls: ['./summary-box.component.scss']
})
export class SummaryBoxComponent implements OnChanges {
  @Input()
  public count!: number;

  @Input()
  public suffix?: string = 'more';

  @Input()
  public displayStyle: SummaryBoxDisplay = SummaryBoxDisplay.Plain;

  @Input()
  public backgroundColor?: Color = Color.White;

  @Input()
  public color?: string = Color.Gray7;

  @Input()
  public tooltip!: string;

  public summaryText!: string;

  public ngOnChanges(): void {
    this.summaryText = `+${this.count}`;
    if (this.displayStyle === SummaryBoxDisplay.Plain) {
      this.backgroundColor = Color.White;
    }
  }
}

export const enum SummaryBoxDisplay {
  Plain = 'plain',
  WithBackground = 'with-background'
}
