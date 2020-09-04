import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SummaryCardColor, SummaryValue } from './summary-card';

@Component({
  selector: 'ht-summary-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./summary-card.component.scss'],
  template: `
    <div class="card grow" *ngIf="this.name">
      <div class="indicator">
        <div class="dot" [ngClass]="this.color"></div>
      </div>
      <div class="data">
        <div class="header" [ngClass]="this.color">
          {{ this.name }}
        </div>
        <div class="footer">
          <ht-summary-value
            class="summary"
            *ngFor="let summary of this.summaries"
            [value]="summary.value"
            [icon]="summary.icon"
            [label]="summary.label"
            [tooltip]="summary.tooltip"
          ></ht-summary-value>
        </div>
      </div>
    </div>
  `
})
export class SummaryCardComponent {
  @Input()
  public name?: string;

  @Input()
  public color?: SummaryCardColor;

  @Input()
  public summaries: SummaryValue[] = [];
}
