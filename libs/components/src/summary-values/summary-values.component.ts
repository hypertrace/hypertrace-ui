import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { compact } from 'lodash-es';
import { SummaryValueDisplayStyle } from '../summary-value/summary-value.component';

@Component({
  selector: 'ht-summary-values',
  styleUrls: ['./summary-values.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-summary-values" data-sensitive-pii [htTooltip]="detailsTemplate">
      <ht-summary-value
        [icon]="this.icon"
        [value]="this.displayValue"
        [label]="this.label"
        [showTooltip]="false"
        summaryValueDisplayStyle="${SummaryValueDisplayStyle.Text}"
        class="summary-value"
      ></ht-summary-value>
      <ng-container *ngIf="this.additionalValues && this.additionalValues!.length > 0">
        <div class="additional-values">
          <span class="count">+{{ this.additionalValues!.length }}</span>
        </div>
      </ng-container>
    </div>

    <ng-template #detailsTemplate>
      <div class="tooltip-contents">
        <ng-container *ngIf="this.tooltip">
          <span class="value">{{ this.tooltip }}</span>
          <div class="divider"></div>
        </ng-container>
        <span *ngFor="let value of this.allValues" class="value">
          {{ value }}
        </span>
      </div>
    </ng-template>
  `
})
export class SummaryValuesComponent implements OnChanges {
  @Input()
  public values?: string[];

  @Input()
  public icon?: string;

  @Input()
  public label?: string;

  @Input()
  public tooltip?: string;

  public displayValue?: string;
  public allValues?: string[];
  public additionalValues?: string[];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.values) {
      this.allValues = compact(this.values ?? []);
      this.displayValue = this.allValues[0] ?? '-';
      this.additionalValues = this.allValues?.slice(1);
    }
  }
}
