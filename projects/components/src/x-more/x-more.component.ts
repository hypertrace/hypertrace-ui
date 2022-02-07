import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, TemplateRef } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'ht-x-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="ht-x-more">
    <span class="summary-text" *ngIf="this.count > 0" [htTooltip]="this.tooltip" [ngClass]="this.displayStyle">{{
      this.summaryText
    }}</span>
  </div>`,
  styleUrls: ['./x-more.component.scss']
})
export class XMoreComponent implements OnChanges, OnInit {
  @Input()
  public count!: number;

  @Input()
  public suffix?: string = '';

  @Input()
  public displayStyle: XMoreDisplay = XMoreDisplay.Plain;

  @Input()
  public tooltip!: string | number | TemplateRef<unknown>;

  public summaryText!: string;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.count || changes.suffix) {
      this.summaryText = `+${this.count}`;

      if (this.suffix !== '') {
        this.summaryText += ` ${this.suffix}`;
      }
    }
  }

  public ngOnInit(): void {
    this.summaryText = `+${this.count}`;

    if (this.suffix !== '') {
      this.summaryText += ` ${this.suffix}`;
    }
  }
}

export const enum XMoreDisplay {
  Plain = 'plain',
  Gray = 'gray'
}
